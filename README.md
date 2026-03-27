# dguard-ui Skill 변환 방법(Codex -> Claude)

현재 `dguard-ui` Skill의 구조는 아래와 같습니다.

```text
skills/
└── dguard-ui/
    ├── agents/
    │   └── openai.yaml
    ├── references/
    │   ├── common-patterns.md
    │   └── page-input-checklist.md
    └── SKILL.md
```
- `SKILL.md`는 Claude에서 가장 중요한 진입점입니다.
- `references/` 아래 문서는 보조 지침으로 활용할 수 있습니다.
- `agents/openai.yaml`은 Codex/OpenAI 전용 설정 입니다.

**Codex/OpenAI 기준으로 작성된 Skill 구조**로 Claude에서 사용하기 전에, 먼저 Claude에게 아래와 같이 요청해 주세요.

## Claude 요청 문구

```text
현재 skills/dguard-ui 는 Codex/OpenAI 기준으로 작성된 Skill입니다.
Claude에서 바로 사용할 수 있도록 Claude용 Skill 형식에 맞게 변환·보완해줘.

수정 요청:
1. 루트 SKILL.md를 중심으로 Claude가 이해하기 쉬운 구조로 정리
2. SKILL.md의 name, description, instructions를 Claude 기준에 맞게 수정
3. description에는 사용해야 하는 경우와 사용하지 말아야 하는 경우를 명확히 작성
4. references 폴더 문서를 Claude가 참조하기 쉽게 연결
5. agents/openai.yaml이 Codex/OpenAI 전용이면 Claude 기준에서 무시하거나 분리
6. md 파일 안의 절대 경로가 있으면 Claude skill 폴더 기준 경로로 수정
7. Claude에서 바로 사용할 수 있는 최종 수정안을 제시
```
