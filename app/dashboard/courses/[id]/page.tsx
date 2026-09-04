"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Course = {
  id: string;
  title: string;
  category: string | null;
  level: string | null;
  description: string | null;
  duration: string | null;
  estimated_hours: number | null;
  status: string | null;
  access_type: string | null;
  price: number | null;
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  lesson_order: number;
  lesson_type: string | null;
  duration: string | null;
  content_url: string | null;
};

type TabName =
  | "lessons"
  | "about"
  | "learning"
  | "requirements"
  | "reviews";

export default function StudentCoursePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("Student");

  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);

  const [activeTab, setActiveTab] =
    useState<TabName>("lessons");

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setStudentId(user.id);

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

      if (profileError || profile?.role !== "student") {
        router.replace("/dashboard/teacher");
        return;
      }

      setStudentName(profile.full_name || "Student");

      const { data: courseData, error: courseError } =
        await supabase
          .from("courses")
          .select(
            "id, title, category, level, description, duration, estimated_hours, status, access_type, price"
          )
          .eq("id", courseId)
          .eq("status", "published")
          .single();

      if (courseError || !courseData) {
        setError(
          "Course not found or this course is not published."
        );
        setLoading(false);
        return;
      }

      setCourse(courseData);

      const { data: lessonData, error: lessonError } =
        await supabase
          .from("lessons")
          .select(
            "id, title, description, lesson_order, lesson_type, duration, content_url"
          )
          .eq("course_id", courseId)
          .order("lesson_order", {
            ascending: true,
          });

      if (lessonError) {
        setError(lessonError.message);
        setLoading(false);
        return;
      }

      setLessons(lessonData || []);

      const { data: enrollmentData } =
        await supabase
          .from("enrollments")
          .select("progress, completed")
          .eq("student_id", user.id)
          .eq("course_id", courseId)
          .maybeSingle();

      if (enrollmentData) {
        setEnrolled(true);
        setProgress(
          Number(enrollmentData.progress) || 0
        );
        setCourseCompleted(
          enrollmentData.completed === true
        );
      }

      setLoading(false);
    }

    loadCourse();
  }, [courseId, router]);

  async function ensureEnrollment() {
    if (!studentId || !course) {
      setError(
        "Student account could not be verified."
      );
      return false;
    }

    if (enrolled) {
      return true;
    }

    if (course.access_type === "paid") {
      setError(
        "Paid course enrollment is not available yet."
      );
      return false;
    }

    const { error: enrollmentError } =
      await supabase
        .from("enrollments")
        .upsert(
          {
            student_id: studentId,
            course_id: courseId,
            progress: 0,
            completed: false,
          },
          {
            onConflict: "student_id,course_id",
          }
        );

    if (enrollmentError) {
      setError(enrollmentError.message);
      return false;
    }

    setEnrolled(true);
    setProgress(0);
    setCourseCompleted(false);

    return true;
  }

  async function startLearning() {
    setStarting(true);
    setError("");

    const ready = await ensureEnrollment();

    if (!ready) {
      setStarting(false);
      return;
    }

    if (lessons.length === 0) {
      setError(
        "This course does not have any lessons yet."
      );
      setStarting(false);
      return;
    }

    router.push(
      `/dashboard/courses/${courseId}/lessons/${lessons[0].id}`
    );
  }

  async function openLesson(lessonId: string) {
    setError("");

    const ready = await ensureEnrollment();

    if (!ready) {
      return;
    }

    router.push(
      `/dashboard/courses/${courseId}/lessons/${lessonId}`
    );
  }

  function goDashboard() {
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] text-white">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />
          <p className="mt-4 text-sm text-slate-400">
            Loading course...
          </p>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] px-6 text-white">
        <div className="text-center">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-5 text-2xl font-bold">
            {error || "Course not found"}
          </h1>

          <button
            type="button"
            onClick={goDashboard}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const safeProgress = Math.min(
    100,
    Math.max(0, Number(progress) || 0)
  );

  const displayProgress =
    courseCompleted ? 100 : safeProgress;

  const tabs: {
    id: TabName;
    label: string;
  }[] = [
    { id: "lessons", label: "Lessons" },
    { id: "about", label: "About" },
    {
      id: "learning",
      label: "What You'll Learn",
    },
    {
      id: "requirements",
      label: "Requirements",
    },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <main className="min-h-screen bg-[#030817] text-white">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#030817]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1540px] items-center justify-between px-5 sm:px-8">

          <button
            type="button"
            onClick={goDashboard}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-bold shadow-[0_10px_30px_rgba(37,99,235,.3)]">
              S
            </div>

            <div className="text-left">
              <p className="text-[15px] font-bold tracking-wide">
                SKILLX
              </p>
              <p className="text-xs text-slate-500">
                Student Portal
              </p>
            </div>
          </button>

          <nav className="hidden items-center gap-10 lg:flex">
            <button
              type="button"
              onClick={goDashboard}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard#my-learning")
              }
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              My Learning
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard#explore-courses"
                )
              }
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Explore
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden w-[270px] items-center gap-3 rounded-xl border border-white/[0.09] bg-[#0b1528] px-4 py-2.5 xl:flex">
              <SearchIcon />

              <input
                type="text"
                placeholder="Search courses, lessons..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-400 transition hover:border-white/[0.08] hover:bg-white/[0.04]"
            >
              <BellIcon />
              <span className="absolute right-[7px] top-[5px] h-2 w-2 rounded-full border-2 border-[#030817] bg-orange-500" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-semibold shadow-lg">
                {studentName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <span className="hidden text-sm font-semibold sm:block">
                {studentName}
              </span>
            </div>
          </div>

        </div>
      </header>

      <div className="mx-auto max-w-[1540px] px-5 py-8 sm:px-8">

        {/* BREADCRUMB */}
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <button
            type="button"
            onClick={goDashboard}
            className="transition hover:text-white"
          >
            Dashboard
          </button>

          <ChevronRight />

          <span>Courses</span>

          <ChevronRight />

          <span className="font-medium text-white">
            {course.title}
          </span>
        </div>

        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_370px]">

          {/* LEFT */}
          <div className="min-w-0">

            {/* HERO */}
            <section className="relative overflow-hidden rounded-[30px] border border-white/[0.09] bg-[#0b172a] shadow-[0_30px_80px_rgba(0,0,0,.18)]">

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_35%,rgba(37,99,235,.18),transparent_34%),linear-gradient(135deg,rgba(30,58,138,.08),transparent_42%)]" />

              <div className="relative grid min-h-[390px] lg:grid-cols-[minmax(0,1fr)_430px]">

                <div className="flex flex-col justify-between p-8 sm:p-10">

                  <div>
                    <div className="flex flex-wrap gap-3">

                      <Pill tone="blue">
                        {course.category || "Course"}
                      </Pill>

                      <Pill tone="green">
                        {course.access_type === "free"
                          ? "Free Course"
                          : "Paid Course"}
                      </Pill>
                    </div>

                    <h1 className="mt-7 text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-[56px]">
                      {course.title}
                    </h1>

                    <p className="mt-5 max-w-[660px] text-[15px] leading-7 text-[#9ba8bc] sm:text-base">
                      {course.description ||
                        "Build a strong understanding through structured lessons, practical concepts and guided learning."}
                    </p>
                  </div>

                  <div className="mt-9 grid max-w-[760px] grid-cols-2 gap-3 sm:grid-cols-4">

                    <HeroStat
                      icon={<BarsIcon />}
                      label="Level"
                      value={capitalize(
                        course.level || "beginner"
                      )}
                    />

                    <HeroStat
                      icon={<PlayIcon />}
                      label="Lessons"
                      value={`${lessons.length}`}
                    />

                    <HeroStat
                      icon={<ClockIcon />}
                      label="Estimated Time"
                      value={
                        course.estimated_hours != null
                          ? `${course.estimated_hours} hours`
                          : "Flexible"
                      }
                    />

                    <HeroStat
                      icon={<CalendarIcon />}
                      label="Duration"
                      value={formatDuration(
                        course.duration
                      )}
                    />

                  </div>
                </div>

                {/* INLINE SVG ART */}
                <div className="relative hidden items-center justify-center overflow-hidden border-l border-white/[0.05] lg:flex">
                  <TechIllustration />
                </div>

              </div>
            </section>

            {/* TABS */}
            <section className="mt-7 border-b border-white/[0.08]">
              <div className="flex gap-5 overflow-x-auto">

                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={`relative whitespace-nowrap px-3 py-4 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab.label}

                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* TAB BODY */}
            <div className="mt-6">
              {activeTab === "lessons" && (
                <CourseContent
                  lessons={lessons}
                  openLesson={openLesson}
                />
              )}

              {activeTab === "about" && (
                <TextPanel
                  title="About This Course"
                  text={
                    course.description ||
                    "Build a strong foundation through structured lessons, practical examples and guided learning."
                  }
                />
              )}

              {activeTab === "learning" && (
                <TextPanel
                  title="What You'll Learn"
                  text="Understand the core concepts, strengthen practical knowledge, improve problem-solving skills and apply your learning through structured lessons."
                />
              )}

              {activeTab === "requirements" && (
                <TextPanel
                  title="Requirements"
                  text="A computer or mobile device, internet access and willingness to learn. No advanced experience is required unless stated by the instructor."
                />
              )}

              {activeTab === "reviews" && (
                <TextPanel
                  title="Student Reviews"
                  text="Ratings and student reviews will appear here when the review system is enabled."
                />
              )}
            </div>

            {/* ABOUT */}
            <section className="mt-7 rounded-[30px] border border-white/[0.09] bg-gradient-to-br from-[#0b1729] to-[#07111f] p-7 sm:p-8">

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_230px]">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-400">
                    Course overview
                  </p>

                  <h2 className="mt-3 text-2xl font-bold">
                    About This Course
                  </h2>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[#96a4b9]">
                    {course.description ||
                      "This course is designed for learners who want to build a strong foundation and practical understanding of the subject."}
                  </p>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[#96a4b9]">
                    Complete the lessons at your own pace,
                    apply what you learn, and keep building
                    your skills as you progress.
                  </p>

                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <CheckItem text="Beginner-friendly content" />
                    <CheckItem text="Learn at your own pace" />
                    <CheckItem text="Practical learning path" />
                    <CheckItem text="Progress tracking" />
                  </div>
                </div>

                <div className="hidden items-center justify-center lg:flex">
                  <BookIllustration />
                </div>

              </div>
            </section>

            {/* HELP */}
            <section className="mt-7 flex flex-col gap-5 rounded-[26px] border border-white/[0.09] bg-[#0a1526] p-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
                  <SupportIcon />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    Need help?
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Have a question about this course?
                    Reach out to support.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="rounded-xl border border-white/[0.1] bg-white/[0.025] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-white"
              >
                Contact Support →
              </button>

            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">

            <section className="rounded-[30px] border border-white/[0.1] bg-gradient-to-b from-[#0a1729] to-[#07111f] p-7 shadow-[0_25px_70px_rgba(0,0,0,.22)]">

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">
                    Course Access
                  </p>

                  <h2 className="mt-2 text-[34px] font-bold">
                    {course.access_type === "free"
                      ? "Free"
                      : course.price != null
                      ? `Rs. ${course.price}`
                      : "Paid"}
                  </h2>
                </div>

                <span className="rounded-full border border-emerald-500/10 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                  ✓ Available
                </span>
              </div>

              <div className="mt-7">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">
                    Your Progress
                  </span>

                  <span className="font-semibold">
                    {displayProgress}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#1a2940]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                    style={{
                      width: `${displayProgress}%`,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={startLearning}
                disabled={starting}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1474ff] to-[#2463ff] px-5 py-4 font-semibold shadow-[0_14px_35px_rgba(20,103,255,.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlayCircleIcon />

                {starting
                  ? "Opening..."
                  : courseCompleted
                  ? "Review Course →"
                  : enrolled
                  ? "Continue Learning →"
                  : "Start Learning →"}
              </button>

              <p className="mt-4 text-center text-xs text-slate-600">
                {lessons.length} lesson
                {lessons.length === 1 ? "" : "s"} available
              </p>

              <div className="mt-7 space-y-4 border-t border-white/[0.08] pt-6">
                <Feature
                  icon={<ClockIcon />}
                  text="Learn at your own pace"
                  tone="cyan"
                />

                <Feature
                  icon={<InfinityIcon />}
                  text="Flexible course access"
                  tone="blue"
                />

                <Feature
                  icon={<AwardIcon />}
                  text="Track completion"
                  tone="purple"
                />

                <Feature
                  icon={<ChartIcon />}
                  text="Progress tracking"
                  tone="pink"
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-white/[0.09] bg-[#091523] p-7">

              <h3 className="text-xl font-bold">
                About This Course
              </h3>

              <p className="mt-4 text-sm leading-6 text-[#8f9db2]">
                {course.description ||
                  "Build a strong understanding through structured lessons and practical learning."}
              </p>

              <div className="mt-6 space-y-4 border-t border-white/[0.08] pt-6">

                <SideInfo
                  label="Category"
                  value={
                    course.category || "General"
                  }
                />

                <SideInfo
                  label="Difficulty"
                  value={capitalize(
                    course.level || "beginner"
                  )}
                />

                <SideInfo
                  label="Lessons"
                  value={`${lessons.length}`}
                />

                <SideInfo
                  label="Estimated Time"
                  value={
                    course.estimated_hours != null
                      ? `${course.estimated_hours} hours`
                      : "Flexible"
                  }
                />

                <SideInfo
                  label="Duration"
                  value={formatDuration(
                    course.duration
                  )}
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-white/[0.09] bg-[#091523] p-7">

              <h3 className="text-xl font-bold">
                Instructor
              </h3>

              <div className="mt-6 flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                  <UserIcon />
                </div>

                <div>
                  <p className="font-semibold">
                    SKILLX Team
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Course Instructor
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[#8e9cb2]">
                Focused on creating practical,
                structured and accessible learning
                experiences.
              </p>
            </section>

          </aside>

        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            ✕ {error}
          </div>
        )}

      </div>
    </main>
  );
}

/* ---------- UI ---------- */

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "blue" | "green";
}) {
  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-bold ${
        tone === "blue"
          ? "bg-blue-500/10 text-blue-400"
          : "bg-emerald-500/10 text-emerald-400"
      }`}
    >
      {children}
    </span>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[#111d31]/85 p-4">

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] text-slate-500">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CourseContent({
  lessons,
  openLesson,
}: {
  lessons: Lesson[];
  openLesson: (
    lessonId: string
  ) => Promise<void>;
}) {
  return (
    <section className="rounded-[30px] border border-white/[0.09] bg-gradient-to-b from-[#0c192c] to-[#081321] p-6 sm:p-8">

      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-400">
            Curriculum
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Course Content
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Follow the lessons in order for the best learning experience.
          </p>
        </div>

        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs text-slate-300">
          {lessons.length} total
        </span>
      </div>

      {lessons.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/[0.1] p-10 text-center">
          <p className="text-sm text-slate-500">
            No lessons available yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {lessons.map((lesson) => (
            <article
              key={lesson.id}
              className="group flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-blue-500/30 hover:bg-blue-500/[0.025] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-blue-500/10 font-bold text-blue-400">
                  {lesson.lesson_order}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold">
                      {lesson.title}
                    </h3>

                    {lesson.lesson_type && (
                      <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {lesson.lesson_type}
                      </span>
                    )}
                  </div>

                  {lesson.description && (
                    <p className="mt-2 text-sm text-slate-500">
                      {lesson.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">

                    {lesson.duration && (
                      <span className="flex items-center gap-1.5">
                        <ClockIcon />
                        {formatLessonDuration(
                          lesson.duration
                        )}
                      </span>
                    )}

                    <span>
                      {lesson.content_url
                        ? "Content ready"
                        : "Content pending"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  openLesson(lesson.id)
                }
                className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-600/10 transition hover:bg-blue-500"
              >
                Open Lesson →
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function TextPanel({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <section className="rounded-[30px] border border-white/[0.09] bg-[#0a1627] p-8">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
        {text}
      </p>
    </section>
  );
}

function CheckItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
        ✓
      </div>

      <span className="text-sm text-slate-300">
        {text}
      </span>
    </div>
  );
}

function Feature({
  icon,
  text,
  tone,
}: {
  icon: React.ReactNode;
  text: string;
  tone:
    | "cyan"
    | "blue"
    | "purple"
    | "pink";
}) {
  const styles = {
    cyan: "bg-cyan-500/10 text-cyan-400",
    blue: "bg-blue-500/10 text-blue-400",
    purple:
      "bg-violet-500/10 text-violet-400",
    pink: "bg-pink-500/10 text-pink-400",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${styles[tone]}`}
      >
        {icon}
      </div>

      <span className="text-sm text-slate-400">
        {text}
      </span>
    </div>
  );
}

function SideInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-slate-200">
        {value}
      </span>
    </div>
  );
}

/* ---------- ARTWORK ---------- */

function TechIllustration() {
  return (
    <svg
      viewBox="0 0 430 330"
      className="relative z-10 w-[390px] max-w-[95%]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="screen"
          x1="0"
          x2="1"
        >
          <stop
            offset="0"
            stopColor="#1574ff"
          />
          <stop
            offset="1"
            stopColor="#6537e8"
          />
        </linearGradient>

        <linearGradient
          id="base"
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#91a5c9"
          />
          <stop
            offset="1"
            stopColor="#344665"
          />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <ellipse
        cx="220"
        cy="265"
        rx="135"
        ry="34"
        fill="#1d4ed8"
        opacity=".24"
        filter="url(#glow)"
      />

      <g opacity=".75">
        <rect
          x="55"
          y="72"
          width="58"
          height="58"
          rx="16"
          fill="#10254a"
          stroke="#2563eb"
        />

        <path
          d="M77 101h14M84 94v14"
          stroke="#60a5fa"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <rect
          x="280"
          y="72"
          width="58"
          height="58"
          rx="16"
          fill="#28164f"
          stroke="#7c3aed"
        />

        <path
          d="M298 105c3-11 19-11 22 0 8 0 8 11 0 11h-22c-8 0-8-11 0-11Z"
          fill="#c4b5fd"
        />

        <rect
          x="188"
          y="26"
          width="58"
          height="58"
          rx="16"
          fill="#172554"
          stroke="#3b82f6"
        />

        <circle
          cx="217"
          cy="55"
          r="14"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="3"
        />

        <path
          d="M203 55h28M217 41c5 6 5 22 0 28M217 41c-5 6-5 22 0 28"
          stroke="#93c5fd"
          strokeWidth="2"
        />
      </g>

      <g transform="translate(95 92)">
        <rect
          width="226"
          height="145"
          rx="20"
          fill="#334a72"
        />

        <rect
          x="8"
          y="8"
          width="210"
          height="129"
          rx="14"
          fill="url(#screen)"
        />

        <path
          d="m91 56-28 19 28 19M135 56l28 19-28 19M124 47l-21 56"
          fill="none"
          stroke="#dbeafe"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M-18 145h262l-13 23H-5Z"
          fill="url(#base)"
        />

        <rect
          x="94"
          y="151"
          width="39"
          height="5"
          rx="2.5"
          fill="#becbe0"
        />
      </g>
    </svg>
  );
}

function BookIllustration() {
  return (
    <svg
      viewBox="0 0 220 170"
      className="w-[190px]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="book"
          x1="0"
          x2="1"
        >
          <stop
            offset="0"
            stopColor="#2563eb"
          />
          <stop
            offset="1"
            stopColor="#6d4aff"
          />
        </linearGradient>
      </defs>

      <path
        d="M110 130C86 111 63 110 35 114V45c30-4 53 2 75 22Z"
        fill="url(#book)"
        opacity=".95"
      />

      <path
        d="M110 130c24-19 47-20 75-16V45c-30-4-53 2-75 22Z"
        fill="#4f46e5"
      />

      <path
        d="M110 68v62"
        stroke="#bfdbfe"
        strokeWidth="3"
      />

      <path
        d="M46 60c18-2 34 2 51 13M46 78c18-2 34 2 51 13M173 60c-18-2-34 2-51 13M173 78c-18-2-34 2-51 13"
        fill="none"
        stroke="#bfdbfe"
        strokeWidth="3"
        opacity=".7"
      />

      <circle
        cx="110"
        cy="91"
        r="75"
        fill="#2563eb"
        opacity=".08"
      />
    </svg>
  );
}

/* ---------- ICONS ---------- */

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-slate-500"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-slate-700"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function BarsIcon() {
  return <span className="text-lg">▥</span>;
}

function PlayIcon() {
  return <span className="text-sm">▶</span>;
}

function ClockIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function PlayCircleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4Z" />
    </svg>
  );
}

function InfinityIcon() {
  return <span className="text-xl">∞</span>;
}

function AwardIcon() {
  return <span className="text-lg">✦</span>;
}

function ChartIcon() {
  return <span className="text-lg">▥</span>;
}

function UserIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-5 4-7 8-7s7 2 8 7" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#a78bfa"
      strokeWidth="2"
    >
      <path d="M3 8.5 12 4l9 4.5-9 4.5Z" />
      <path d="M7 11v5c3 2 7 2 10 0v-5" />
      <path d="M21 9v6" />
    </svg>
  );
}

/* ---------- HELPERS ---------- */

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function formatDuration(
  value: string | null
) {
  if (!value) {
    return "Self paced";
  }

  const clean = value.trim();

  if (/^\d+$/.test(clean)) {
    return `${clean} weeks`;
  }

  return clean;
}

function formatLessonDuration(
  value: string
) {
  const clean = value.trim();

  if (/^\d+$/.test(clean)) {
    return `${clean} minutes`;
  }

  return clean;
}