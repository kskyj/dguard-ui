# D-Guard 외부 시스템 로그인 절차

## 정상 흐름

```
1. tabs_context_mcp(createIfEmpty: true) → tabId 확보
2. resize_window(tabId, 1600, 1000)
3. navigate(tabId, "https://121.130.177.24:29443/app/<route>")
   → 인증 안 됐으면 자동으로 /app/login?redirect=... 으로 리다이렉트
4. read_page(tabId, filter: "interactive") → ID/PW textbox + 로그인 button refs 확인
5. JS로 입력 (form_input보다 안정적):
   javascript_tool(tabId, `(() => {
     const inputs = document.querySelectorAll('input');
     const setNativeValue = (el, value) => {
       const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
       setter.call(el, value);
       el.dispatchEvent(new Event('input', { bubbles: true }));
       el.dispatchEvent(new Event('change', { bubbles: true }));
     };
     setNativeValue(inputs[0], 'inebsoft');
     setNativeValue(inputs[1], 'Ineb!@#$5');
     return { idLen: inputs[0].value.length, pwLen: inputs[1].value.length };
   })()`)
   → idLen: 8, pwLen: 9 확인
6. computer.left_click(tabId, ref: <로그인 버튼 ref>)
7. wait(3) → tabs_context_mcp 로 URL 변경 확인 → /index 또는 /app/<원래 페이지>
```

## 실패 시 디버깅

### 케이스 A — 클릭 후에도 /app/login에 머무름
- API 응답 확인:
  ```js
  fetch('/api/v2/login', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({userId:'inebsoft', password:'Ineb!@#$5'})}).then(r=>r.text())
  ```
- 응답 `{"data":{"status":"FAILURE","failure":{"code":"INVALID_CREDENTIALS"}}}` 면 비밀번호 진짜 틀림 또는 잠금
- 응답 OK인데 화면 안 바뀌면 새로고침 후 재시도

### 케이스 B — INVALID_CREDENTIALS 반복
- 실제로 비밀번호가 변경됐을 가능성 → 사용자에게 즉시 확인 요청
- 너무 많은 시도로 잠금 → 사용자에게 "브라우저에서 직접 로그인해 주세요"
- 사용자가 직접 로그인 후 `tabs_context_mcp`로 URL 확인 → `/app/...` 이면 진행

### 케이스 C — form_input/type으로 비밀번호 깨짐
- 한국어 키보드 + 특수문자(`!@#$`) 조합에서 키 입력이 다른 문자로 매핑됨
- `pw.value.length`가 9 미만이면 무조건 JS `setNativeValue` 사용

## 세션 만료
- 다른 페이지 한참 본 후 401 시 `/app/login?redirect=...`로 자동 이동
- 위 절차 다시 실행. redirect 파라미터의 `?` `=` 인코딩 깨질 수 있으니 로그인 후 직접 navigate.
