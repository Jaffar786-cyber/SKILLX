# SKILLX Launch Audit

## Status
The application has a working MVP foundation: student/teacher authentication, course management, lessons, YouTube playback, student progress, and Vercel deployment.

## Fixed in this reviewed copy
- Fixed the incorrect `dashboard/teacher/courses/[id]/lessons/new` route, which previously rendered a New Course form instead of a New Lesson form.
- Removed legacy/mock routes under `/student`, `/teacher`, and `/admin` so old prototype dashboards cannot conflict with the production flow.
- Replaced the misplaced teacher lesson manager under the student `/dashboard/courses/[id]/lessons` route with a safe redirect to the course page.
- Added a student-role check to the student course library.
- Improved homepage CTA routing so student and teacher signup actions go to the correct signup pages.
- Removed verbose signup diagnostics that exposed session/user details in the browser console.
- Added a production `.gitignore` and `.env.example`.
- Added a custom 404 page.
- Improved site metadata.

## Critical launch checks still required
### 1. Supabase Row Level Security (RLS)
Code-side role checks are not a security boundary. RLS policies must be verified for:
- `profiles`
- `courses`
- `lessons`
- `lesson_progress`
- `enrollments` (if used)

Required behavior:
- Students can read only published courses/lessons.
- Students can only create/update their own lesson progress.
- Teachers can create/update/delete only their own courses.
- Teachers can create/update/delete lessons only for courses they own.
- Users cannot arbitrarily change their own role to teacher/admin through direct API calls unless that is intentionally allowed.

### 2. Paid courses are not launch-ready
The UI contains `free/paid` fields, but there is no verified payment checkout or entitlement gate. A student can currently reach published course content based on publication status, not purchase state.

Launch recommendation: use FREE courses only until payments and enrollment authorization are implemented.

### 3. Signup/profile creation
The app creates Supabase Auth users and then inserts a `profiles` row from the browser. This can work with the current Supabase configuration, but a production setup should use a database trigger or carefully designed RLS so profile creation is reliable even when email confirmation is enabled.

### 4. Password recovery
A production site should add Forgot Password / Reset Password and configure the Supabase redirect URLs.

### 5. Enrollment model
The teacher dashboard reads an `enrollments` table for student counts, but the current student experience is primarily a course catalogue + lesson progress flow. Decide whether enrollment is required before launch or remove enrollment-dependent metrics until implemented.

## Recommended launch sequence
1. Run `npm install` / `npm ci`.
2. Run `npm run build` and fix every build error.
3. Run `npm run lint`.
4. Test fresh Student signup/login.
5. Test fresh Teacher signup/login.
6. Teacher: create course -> add lesson -> add YouTube URL -> publish.
7. Student: open course -> play lesson -> mark complete.
8. Test logout and direct protected URLs while logged out.
9. Test a student attempting teacher URLs.
10. Verify Supabase RLS policies in SQL editor.
11. Use only free courses for first launch.
12. Test on Android + iPhone/mobile browser and desktop incognito.
13. Deploy production Vercel build.
14. Configure custom domain and Supabase allowed redirect/site URLs.

## Phase 2 after MVP launch
- Password reset
- Email verification flow
- Real enrollment system
- Payments
- Teacher application/approval workflow
- Admin portal with real authorization
- Course thumbnails/uploads
- Quizzes/assignments/assessments
- Certificates
- Reviews/ratings
- Analytics
