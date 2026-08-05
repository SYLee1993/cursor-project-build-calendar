# Build Calendar

프로젝트 개발 일정을 월간 캘린더로 관리하는 Next.js 앱입니다.

## 기능

- 월간 캘린더 (1일 ~ 말일, 일~토)
- 날짜 클릭 또는 **프로젝트 추가** 버튼으로 프로젝트 등록
- 프로젝트명, 개발 시작/완료일, 상태 관리
- 상태: 개발예정 / 개발중 / 펜딩 / 개발취소 (색상 구분)
- 년/월 선택 시 우측(모바일: 하단 Sheet)에 해당 월 프로젝트 목록 표시
- 데이터는 브라우저 `localStorage`에 저장

## 기술 스택

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- date-fns

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 프로젝트 Skill

`.agents/skills/`에 프로젝트 레벨 skill이 설치되어 있습니다.

| Skill | 용도 |
|-------|------|
| `shadcn` | shadcn/ui 컴포넌트 관리 |
| `nextjs` | Next.js App Router 패턴 |
| `shadcn-setup-and-theming` | 테마·CSS 변수 설정 |
| `create-pr` | GitHub PR 생성 |
| `deploy-to-vercel` | Vercel 배포 |
| `build-calendar` | 이 프로젝트 전용 컨벤션 |

## GitHub & Vercel 배포

1. GitHub repo 생성 후 push
2. [Vercel](https://vercel.com)에서 GitHub repo import
3. Framework Preset: **Next.js** (기본값)
4. Deploy

> localStorage 데이터는 브라우저/기기별로 저장되며, 배포 URL 접속 시 해당 브라우저에만 데이터가 유지됩니다.

## 데이터 키

- localStorage: `build-calendar:projects`
