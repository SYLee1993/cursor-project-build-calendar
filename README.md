# Personal Calendar

개인 일정을 월간 캘린더로 관리하는 Next.js 앱입니다.

## 기능

- 월간 / 분기 / 연간 캘린더
- 날짜 클릭 또는 일정 추가로 등록
- 일정명, 상세, 카테고리, 시작/완료일, 상태 관리
- 드래그로 일정 이동·복사
- **Supabase**에 사용자별 일정 저장 (RLS)
- 기존 `localStorage` 데이터는 최초 로그인 시 자동 이전

## 기술 스택

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- date-fns
- Supabase (Auth + Postgres)

## Supabase 설정

**Organization:** [SYLee1993](https://supabase.com/dashboard/org/SYLee1993)  
**Project:** [Personal Calendar](https://supabase.com/dashboard/project/nmdsvlifextgbyzqdinf) (`nmdsvlifextgbyzqdinf`, AWS ap-northeast-2)

1. `.env.local.example`을 복사해 `.env.local` 생성

```bash
cp .env.local.example .env.local
```

2. [Personal Calendar → Project Settings → API](https://supabase.com/dashboard/project/nmdsvlifextgbyzqdinf/settings/api)에서 URL과 anon/publishable key를 `.env.local`에 입력

3. (선택) Supabase CLI로 로컬 프로젝트와 원격 연결

```bash
npx supabase login
npx supabase link --project-ref nmdsvlifextgbyzqdinf
npx supabase db push
```

Cursor **Supabase MCP**도 동일 프로젝트(`nmdsvlifextgbyzqdinf`)에 연결되어 있어야 MCP 마이그레이션이 Personal Calendar DB에 적용됩니다.

또는 Supabase MCP `apply_migration`으로 `supabase/migrations/20260807140000_create_calendar_projects.sql` 내용을 적용합니다.

### DB 스키마

- 테이블: `public.calendar_projects`
- 컬럼: `user_id`, `name`, `description`, `type`, `start_date`, `end_date`, `status`
- RLS: 로그인한 사용자 본인 일정만 CRUD

### Auth

- 이메일 매직 링크 로그인
- Redirect URL: `http://localhost:3000/auth/callback` (Supabase Auth → URL Configuration에 등록)

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 후 이메일로 로그인

> **포트 충돌:** 다른 Next.js 앱(예: 노션 클론)이 3000을 쓰면 캘린더가 다른 포트로 뜹니다. 캘린더만 3000에서 실행하려면 해당 프로세스를 종료한 뒤 `npm run dev`를 다시 실행하세요.

## 프로젝트 Skill

`.agents/skills/`에 프로젝트 레벨 skill이 설치되어 있습니다.

| Skill | 용도 |
|-------|------|
| `build-calendar` | 이 프로젝트 전용 컨벤션 |
| `shadcn` | shadcn/ui 컴포넌트 관리 |
| `nextjs` | Next.js App Router 패턴 |
| `create-pr` | GitHub PR 생성 |
| `deploy-to-vercel` | Vercel 배포 |

## GitHub & Vercel 배포

1. GitHub repo 생성 후 push
2. [Vercel](https://vercel.com)에서 GitHub repo import
3. Environment Variables 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Supabase Auth Redirect URLs에 배포 URL `/auth/callback` 추가
5. Deploy

## 데이터 이전

- legacy localStorage key: `build-calendar:projects`
- 최초 Supabase 로그인 후 DB가 비어 있으면 localStorage 일정을 자동 업로드하고 localStorage를 비웁니다.

