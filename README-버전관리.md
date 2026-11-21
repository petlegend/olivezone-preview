# oz 버전 관리 (2026-11-21)

| 이름 | 무엇 | 어디 |
|---|---|---|
| **oz1** | 원래 사이트 (Tilda, 라이브) | https://olivezonemedical.ru — 이 저장소에서는 바꾸지 않는다. 보관본: `C:\AI WORK\dev\olivezone-renewal\archive\oz1_20261121` |
| **oz2** | 리뉴얼 첫 고정본 | `versions/oz2/` · 태그 `oz2` |
| **oz3, oz4 …** | 이후 수정할 때마다 새 번호 | `versions/ozN/` · 태그 `ozN` |

- 지금 화면(대표에게 드리는 주소): https://petlegend.github.io/olivezone-preview/
- 모든 버전 목록: https://petlegend.github.io/olivezone-preview/versions/
- 각 버전 바로 보기: https://petlegend.github.io/olivezone-preview/versions/oz2/

## 대표가 「ozN 으로 원복해줘」 하면

```
node oz.js restore oz2
```

원복 직전 화면이 어떤 저장본과도 다르면 `auto_날짜_시각` 으로 먼저 자동 보관한다.

## 지키는 규칙

- `versions/` 폴더와 `ozN` 태그는 **절대 지우지 않는다**. 같은 이름 덮어쓰기도 막혀 있다
- 원복도 새 커밋이다. 이력(git)은 그대로 남는다
- 이 저장소는 검색 제외(noindex·robots)다
