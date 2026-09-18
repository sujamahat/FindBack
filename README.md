# FindBack

QR 키링으로 분실물을 더 안전하고 빠르게 돌려받으세요.

FindBack은 물리적인 QR 키링과 웹 애플리케이션을 연결하는 프라이버시 중심의 분실물 찾기 서비스입니다. 물건 주인은 개인정보를 노출하지 않고, 습득자는 로그인이나 앱 설치 없이 발견 사실을 바로 알릴 수 있습니다.

GDGoC Korea University **BYPP 해커톤** 출품작입니다.

## 이 프로젝트가 해결하는 문제

우산, 물병, 가방처럼 캠퍼스에서 흔히 잃어버리는 물건들은 되찾을 방법이 마땅치 않습니다. 이름표에 연락처를 적으면 개인정보가 노출되고, 분실물 보관소는 확인이 번거롭습니다. FindBack은:

- 물건에 붙인 QR 태그를 스캔하면 습득자가 로그인 없이 발견 위치를 제보할 수 있고
- 제보는 즉시 주인의 비공개 대시보드로 전달되며
- QR/공개 페이지 어디에도 주인의 이름, 이메일, 전화번호, DB ID, 대시보드 URL이 노출되지 않습니다.

## 물리적 QR 키링 작동 방식

1. 주인이 물건을 등록하면 임의의 `public_token`(QR용)과 짧은 `recovery_code`(예: `7K2M9P`, QR이 안 될 때 수동 입력용)가 생성됩니다.
2. `/items/[id]/tag` 페이지에서 45×65mm 크기의 태그(앞면: 마스코트, 뒷면: QR + 코드)를 인쇄해 물건에 부착합니다.
3. QR은 `{NEXT_PUBLIC_APP_URL}/f/{publicToken}`을 인코딩합니다 — 이 URL 자체에는 owner_id나 DB 내부 id가 전혀 포함되지 않습니다.
4. 습득자가 QR을 스캔(또는 `/recover`에서 코드 입력)하면 `/f/[publicToken]` 공개 페이지가 열리고, 위치·전달 방법·메시지를 남길 수 있습니다.
5. 제보는 서버의 `/api/reports` 라우트를 통해서만 저장되며, 주인의 대시보드에 즉시(Realtime) 반영됩니다.

## 아키텍처 요약

- **Next.js 16 (App Router) + TypeScript strict + Tailwind v4**
- **Supabase**: Postgres(RLS) + Auth(이메일 매직링크) + Storage(공개 미디어 버킷)
- 인증된 소유자 흐름은 **Server Components / Server Actions**가 사용자 세션 쿠키로 Supabase에 접근(RLS 적용).
- 공개(비로그인) 흐름(`/f/[publicToken]`, `/recover`, `/api/reports`, `/api/recover`)은 **서버 전용 서비스 롤 클라이언트**(`src/lib/supabase/admin.ts`)로 접근하며, 클라이언트에는 반드시 안전한 필드만 선별해 전달합니다(`src/lib/publicItem.ts`).
- 서비스 롤 키는 `SUPABASE_SERVICE_ROLE_KEY` 환경 변수로만 존재하고, `server-only` 패키지로 클라이언트 번들 유입을 방지합니다.
- 실시간 업데이트: `found_reports` 테이블을 Supabase Realtime publication에 추가해 아이템 상세 페이지가 새 제보를 즉시 반영합니다.

```
src/
  app/            라우트 (App Router)
  components/     공유 UI (마스코트, 상태 뱃지, 아이템 카드 등)
  lib/
    supabase/     client / server / admin 클라이언트 + 타입
    validation.ts zod 스키마
    codes.ts      public_token / recovery_code 생성
    statusTransitions.ts  상태 전이 규칙
    notifications/email.ts  이메일 알림 추상화 (Resend, 선택)
supabase/migrations/
  20260918000000_initial_schema.sql       전체 스키마 + RLS + 스토리지 정책
  20260919000000_add_report_geolocation.sql  제보 GPS 좌표(선택) 컬럼 추가
```

## 로컬 개발 환경 설정

```bash
npm install
cp .env.example .env.local   # 아래 "Supabase 설정" 참고해 값 채우기
npm run dev                  # http://localhost:3000
```

## Supabase 설정

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. **Project Settings → API**에서 Project URL, `anon` public key, `service_role` key를 복사해 `.env.local`에 채웁니다.
3. **Authentication → Providers → Email**에서 매직링크(OTP) 로그인이 활성화되어 있는지 확인합니다(기본값으로 이미 켜져 있습니다).
4. **Authentication → URL Configuration**의 Redirect URLs에 `http://localhost:3000/auth/callback`과 배포 도메인의 `/auth/callback`을 추가합니다.
5. 마이그레이션을 적용합니다(아래 "마이그레이션 적용" 참고). `supabase/migrations/`의 두 파일이 `items`, `found_reports`(GPS 좌표 컬럼 포함), `item_status_events` 테이블, RLS 정책, `findback-media` 공개 스토리지 버킷을 모두 생성합니다.

## 마이그레이션 적용

Supabase CLI가 있다면:

```bash
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

CLI가 없다면 Supabase 대시보드의 **SQL Editor**에 `supabase/migrations/` 안의 두 파일을 **파일명 순서대로**(`20260918000000_initial_schema.sql` 다음 `20260919000000_add_report_geolocation.sql`) 그대로 붙여넣어 실행해도 동일합니다.

## 환경 변수

`.env.example` 참고. 실제로 코드에서 사용하는 변수만 나열했습니다.

| 변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저/서버 공용 anon 키 (RLS 적용됨) |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용.** `/api/reports`, `/api/recover`, `/f/[publicToken]`에서만 사용 |
| `NEXT_PUBLIC_APP_URL` | QR 코드/이메일 링크에 사용할 배포 URL |
| `RESEND_API_KEY` (선택) | 설정 시 발견 제보 이메일 알림 발송 |
| `RESEND_FROM_EMAIL` (선택) | 알림 발신자 주소 |

자격 증명은 절대 커밋하지 마세요. `.env*`는 `.gitignore`에 포함되어 있습니다.

## Vercel 배포

1. GitHub에 이 저장소를 푸시합니다.
2. Vercel에서 New Project → 저장소 선택 → Framework: Next.js (자동 감지).
3. 위 환경 변수를 Vercel 프로젝트의 Environment Variables에 등록합니다(`NEXT_PUBLIC_APP_URL`은 배포될 실제 도메인으로).
4. Supabase Authentication → URL Configuration의 Redirect URLs에 `https://YOUR-DOMAIN/auth/callback`을 추가합니다.
5. Deploy. 빌드 커맨드/출력 디렉터리는 Next.js 기본값을 그대로 사용합니다.

## 프라이버시 및 보안 모델

- **QR/공개 페이지는 개인정보를 절대 포함하지 않습니다.** `public_token`은 소유자 정보와 무관한 24바이트 랜덤 문자열이며, 공개 페이지가 반환하는 필드는 이름·카테고리·설명·사진·상태·반환 안내뿐입니다(`toPublicItemView`).
- **`items`/`found_reports`/`item_status_events` 테이블에는 익명 사용자를 위한 직접 조회/삽입 RLS 정책이 없습니다.** 공개 조회와 제보 저장은 오직 서버의 Route Handler가 검증을 마친 뒤 서비스 롤 클라이언트로 수행합니다 — 브라우저에서 PostgREST를 직접 호출해도 막힙니다.
- **서비스 롤 키는 클라이언트 번들에 포함되지 않습니다.** `server-only` 패키지가 실수로 클라이언트 컴포넌트에서 import될 경우 빌드 타임에 에러를 발생시킵니다.
- **습득자는 계정이 필요 없습니다.** 이름/이메일/전화번호/연락처/위치 자동수집을 요구하지 않으며, 허니팟 필드와 IP 기반 레이트 리밋으로 스팸 제출을 완화합니다.
- 소유자만 자신의 아이템/제보를 조회·수정할 수 있도록 모든 테이블에 `owner_id = auth.uid()` 기반 RLS가 적용됩니다.

## 알려진 MVP 한계

- **레이트 리밋은 인메모리**입니다(서버리스 인스턴스 재시작 시 초기화되며 인스턴스 간 공유되지 않음). 실서비스에서는 Upstash/Redis 등 공유 스토어가 필요합니다.
- **이메일 알림은 선택 기능**입니다. `RESEND_API_KEY`가 없으면 콘솔에 개발용 로그만 남기고 실제 메일은 보내지 않습니다.
- **상태 변경 이력은 `lost`/`returned` 두 이벤트만 정밀 기록**합니다. `found`는 제보 도착 시각(`found_reports.created_at`)으로 타임라인에 표시됩니다.
- 습득자 제보 사진 업로드는 서버 라우트를 통해서만 가능하며(최대 5MB, 이미지 파일만), 별도 이미지 최적화/리사이즈는 하지 않습니다.
- 다국어(영/한) 토글은 아직 구현되지 않았습니다 — 문자열이 `src/lib/constants.ts`와 각 컴포넌트에 모여 있어 이후 `next-intl` 등으로 쉽게 확장 가능한 구조로 작성했습니다.
- 중복 제보 방지는 클라이언트 측 "제출 후 폼 숨김" + 서버 레이트 리밋 수준이며, DB 레벨의 강한 유니크 제약은 없습니다.

## 데모 방법 (가장 빠른 전체 흐름 테스트)

1. `npm run dev` 실행 후 `http://localhost:3000/login`에서 이메일 매직링크로 로그인합니다.
2. `/items/new`에서 물건을 하나 등록합니다(사진은 선택).
3. 생성된 아이템 페이지에서 **QR 태그 보기 / 인쇄**를 눌러 `/items/[id]/tag`로 이동합니다.
4. 같은 QR을 다른 브라우저(시크릿 창) 또는 다른 기기에서 스캔/접속해 `/f/[publicToken]`을 엽니다 — 개인정보가 전혀 보이지 않는지 확인합니다.
5. 발견 장소를 입력하고 "제보 보내기"를 누릅니다.
6. 원래 로그인된 창에서 아이템 페이지를 새로고침(또는 Realtime이 켜져 있다면 자동으로) 하면 제보가 보입니다.
7. "반환 완료로 표시"를 눌러 상태를 변경합니다.
8. `/recover`에서 태그에 적힌 코드를 입력해 같은 공개 페이지로 이동하는지 확인합니다. 존재하지 않는 코드를 입력하면 어떤 코드가 유사한지 드러내지 않는 일반 오류만 표시되는지 확인합니다.

## 테스트

```bash
npm run lint     # ESLint
npx tsc --noEmit # (또는 npm run build가 타입체크를 포함합니다)
npm run test     # Vitest 단위 테스트 (코드 생성, zod 검증, 공개 데이터 필터링, 상태 전이)
npm run build    # 프로덕션 빌드
```

개발 과정과 의사결정 기록은 [`BUILD_LOG.md`](./BUILD_LOG.md)를 참고하세요.
