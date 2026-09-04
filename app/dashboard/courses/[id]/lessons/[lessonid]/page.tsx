"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  lesson_type: string | null;
  duration: string | null;
  lesson_order: number;
  content_url: string | null;
};

type Course = {
  id: string;
  title: string;
};

function getYouTubeEmbedUrl(url: string) {
  try {
    const cleanUrl = url.trim();
    const parsedUrl = new URL(cleanUrl);

    // youtu.be/VIDEO_ID
    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname
        .split("/")
        .filter(Boolean)[0];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // youtube.com/watch?v=VIDEO_ID
    if (
      parsedUrl.hostname.includes("youtube.com") &&
      parsedUrl.pathname === "/watch"
    ) {
      const videoId =
        parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // youtube.com/shorts/VIDEO_ID
    if (
      parsedUrl.hostname.includes("youtube.com") &&
      parsedUrl.pathname.startsWith("/shorts/")
    ) {
      const parts = parsedUrl.pathname
        .split("/")
        .filter(Boolean);

      const videoId = parts[1];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // youtube.com/embed/VIDEO_ID
    if (
      parsedUrl.hostname.includes("youtube.com") &&
      parsedUrl.pathname.startsWith("/embed/")
    ) {
      return cleanUrl;
    }

    return cleanUrl;
  } catch (error) {
    console.error("VIDEO URL ERROR:", error);
    return url;
  }
}

function isYouTubeUrl(url: string) {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  );
}

function formatDuration(value: string | null) {
  if (!value) {
    return null;
  }

  const clean = value.trim();

  if (/^\d+$/.test(clean)) {
    return `${clean} minutes`;
  }

  return clean;
}

export default function StudentLessonPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const lessonId = (
    params.lessonId ??
    params.lessonid
  ) as string;

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [course, setCourse] =
    useState<Course | null>(null);

  const [allLessons, setAllLessons] =
    useState<Lesson[]>([]);

  const [completedLessonIds, setCompletedLessonIds] =
    useState<Set<string>>(new Set());

  const [completed, setCompleted] =
    useState(false);

  const [courseProgress, setCourseProgress] =
    useState(0);

  const [courseCompleted, setCourseCompleted] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      if (!courseId || !lessonId) {
        setError(
          "Invalid course or lesson."
        );
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Verify student
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "PROFILE ERROR:",
          profileError
        );

        setError(
          "Unable to verify your account."
        );

        setLoading(false);
        return;
      }

      if (profile?.role !== "student") {
        router.replace(
          "/dashboard/teacher"
        );
        return;
      }

      // Load published course
      const {
        data: courseData,
        error: courseError,
      } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .eq("status", "published")
        .single();

      if (courseError || !courseData) {
        console.error(
          "COURSE ERROR:",
          courseError
        );

        setError(
          "Course not found or this course is not published."
        );

        setLoading(false);
        return;
      }

      setCourse(courseData);

      // Load all course lessons
      const {
        data: lessonData,
        error: lessonsError,
      } = await supabase
        .from("lessons")
        .select(
          "id, title, description, lesson_type, duration, lesson_order, content_url"
        )
        .eq("course_id", courseId)
        .order("lesson_order", {
          ascending: true,
        });

      if (lessonsError) {
        console.error(
          "LESSONS ERROR:",
          lessonsError
        );

        setError(lessonsError.message);
        setLoading(false);
        return;
      }

      const courseLessons =
        lessonData || [];

      setAllLessons(courseLessons);

      const currentLesson =
        courseLessons.find(
          (item) => item.id === lessonId
        );

      if (!currentLesson) {
        setError("Lesson not found.");
        setLoading(false);
        return;
      }

      setLesson(currentLesson);

      // Load completed lesson progress
      const {
        data: progressRows,
        error: progressError,
      } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("student_id", user.id)
        .eq("course_id", courseId)
        .eq("completed", true);

      if (progressError) {
        console.error(
          "PROGRESS ERROR:",
          progressError
        );
      }

      const completedIds =
        new Set<string>(
          (progressRows || []).map(
            (row) => row.lesson_id
          )
        );

      setCompletedLessonIds(
        completedIds
      );

      setCompleted(
        completedIds.has(lessonId)
      );

      const totalLessons =
        courseLessons.length;

      const progressValue =
        totalLessons > 0
          ? Math.round(
              (completedIds.size /
                totalLessons) *
                100
            )
          : 0;

      setCourseProgress(
        Math.min(100, progressValue)
      );

      setCourseCompleted(
        totalLessons > 0 &&
          completedIds.size >=
            totalLessons
      );

      setLoading(false);
    }

    loadLesson();
  }, [
    courseId,
    lessonId,
    router,
  ]);

  const currentIndex = useMemo(() => {
    return allLessons.findIndex(
      (item) => item.id === lessonId
    );
  }, [allLessons, lessonId]);

  const previousLesson =
    currentIndex > 0
      ? allLessons[currentIndex - 1]
      : null;

  const nextLesson =
    currentIndex >= 0 &&
    currentIndex <
      allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  async function updateCourseProgress(
    studentId: string,
    newCompletedIds: Set<string>
  ) {
    const totalLessons =
      allLessons.length;

    if (totalLessons === 0) {
      return {
        progress: 0,
        courseCompleted: false,
      };
    }

    const completedCount =
      newCompletedIds.size;

    const calculatedProgress =
      Math.min(
        100,
        Math.round(
          (completedCount /
            totalLessons) *
            100
        )
      );

    const isCompleted =
      completedCount >= totalLessons;

    const {
      error: enrollmentError,
    } = await supabase
      .from("enrollments")
      .upsert(
        {
          student_id: studentId,
          course_id: courseId,
          progress:
            calculatedProgress,
          completed: isCompleted,
          completed_at: isCompleted
            ? new Date().toISOString()
            : null,
        },
        {
          onConflict:
            "student_id,course_id",
        }
      );

    if (enrollmentError) {
      console.error(
        "ENROLLMENT UPDATE ERROR:",
        enrollmentError
      );

      throw new Error(
        enrollmentError.message
      );
    }

    return {
      progress:
        calculatedProgress,
      courseCompleted:
        isCompleted,
    };
  }

  async function markComplete() {
    if (
      saving ||
      completed ||
      !lesson
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.replace("/login");
      return;
    }

    const now =
      new Date().toISOString();

    // Save lesson completion
    const {
      error: progressError,
    } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          student_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          completed: true,
          completed_at: now,
          updated_at: now,
        },
        {
          onConflict:
            "student_id,lesson_id",
        }
      );

    if (progressError) {
      console.error(
        "SAVE PROGRESS ERROR:",
        progressError
      );

      setError(
        progressError.message
      );

      setSaving(false);
      return;
    }

    const newCompletedIds =
      new Set(completedLessonIds);

    newCompletedIds.add(
      lessonId
    );

    setCompletedLessonIds(
      newCompletedIds
    );

    setCompleted(true);

    try {
      const result =
        await updateCourseProgress(
          user.id,
          newCompletedIds
        );

      setCourseProgress(
        result.progress
      );

      setCourseCompleted(
        result.courseCompleted
      );

      if (
        result.courseCompleted
      ) {
        setSuccessMessage(
          "Course completed! You finished every lesson."
        );
      } else {
        setSuccessMessage(
          `Lesson completed. Course progress is now ${result.progress}%.`
        );
      }
    } catch (updateError) {
      console.error(
        "COURSE PROGRESS ERROR:",
        updateError
      );

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Lesson completed, but course progress could not be updated."
      );
    }

    setSaving(false);
  }

  function openLesson(
    targetLessonId: string
  ) {
    router.push(
      `/dashboard/courses/${courseId}/lessons/${targetLessonId}`
    );
  }

  function backToCourse() {
    router.push(
      `/dashboard/courses/${courseId}`
    );
  }

  function backToDashboard() {
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] text-white">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading lesson...
          </p>
        </div>
      </main>
    );
  }

  if (!lesson || !course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] px-6 text-white">
        <div className="max-w-md text-center">
          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            {error ||
              "Lesson not found"}
          </h1>

          <button
            type="button"
            onClick={backToCourse}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            ← Back to Course
          </button>
        </div>
      </main>
    );
  }

  const contentUrl =
    lesson.content_url?.trim() ||
    "";

  const embedUrl =
    contentUrl &&
    isYouTubeUrl(contentUrl)
      ? getYouTubeEmbedUrl(
          contentUrl
        )
      : contentUrl;

  return (
    <main className="min-h-screen bg-[#030817] text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#030817]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8">

          <button
            type="button"
            onClick={backToDashboard}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-600/20">
              S
            </div>

            <div className="text-left">
              <p className="font-bold">
                SKILLX
              </p>

              <p className="text-xs text-slate-500">
                Student Portal
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={backToCourse}
              className="rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              ← Course
            </button>

            <button
              type="button"
              onClick={backToDashboard}
              className="hidden rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-400 transition hover:text-white sm:block"
            >
              Dashboard
            </button>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8">

        {/* BREADCRUMB */}
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">

          <button
            type="button"
            onClick={backToDashboard}
            className="hover:text-white"
          >
            Dashboard
          </button>

          <span>/</span>

          <button
            type="button"
            onClick={backToCourse}
            className="hover:text-white"
          >
            {course.title}
          </button>

          <span>/</span>

          <span className="text-slate-300">
            {lesson.title}
          </span>

        </div>

        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">

          {/* MAIN CONTENT */}
          <div className="min-w-0">

            {/* LESSON HEADER */}
            <section className="mb-6 rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#0c192d] to-[#081321] p-7 sm:p-8">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                <div className="max-w-3xl">

                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-400">
                    {course.title}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">

                    <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">
                      Lesson{" "}
                      {lesson.lesson_order}
                    </span>

                    {lesson.lesson_type && (
                      <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs uppercase text-slate-400">
                        {lesson.lesson_type}
                      </span>
                    )}

                    {formatDuration(
                      lesson.duration
                    ) && (
                      <span className="rounded-full bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">
                        {formatDuration(
                          lesson.duration
                        )}
                      </span>
                    )}

                    {completed && (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                        ✓ Completed
                      </span>
                    )}

                  </div>

                  <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                    {lesson.title}
                  </h1>

                  {lesson.description && (
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
                      {lesson.description}
                    </p>
                  )}

                </div>

                <div className="min-w-[150px] rounded-2xl border border-white/[0.08] bg-[#08111f] p-4">

                  <p className="text-xs text-slate-500">
                    Course Progress
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {courseProgress}%
                  </p>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                      style={{
                        width: `${courseProgress}%`,
                      }}
                    />
                  </div>

                </div>

              </div>

            </section>

            {/* VIDEO */}
            <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#060b13] shadow-[0_30px_80px_rgba(0,0,0,.3)]">

              {contentUrl ? (
                lesson.lesson_type
                  ?.toLowerCase() ===
                "video" ? (
                  isYouTubeUrl(
                    contentUrl
                  ) ? (
                    <div className="aspect-video bg-black">

                      <iframe
                        src={embedUrl}
                        title={lesson.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />

                    </div>
                  ) : (
                    <video
                      src={contentUrl}
                      controls
                      className="aspect-video w-full bg-black"
                    >
                      Your browser does not
                      support the video tag.
                    </video>
                  )
                ) : (
                  <div className="px-8 py-16 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
                      📖
                    </div>

                    <h2 className="mt-5 text-xl font-bold">
                      Lesson Content
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Open the lesson material
                      to continue learning.
                    </p>

                    <a
                      href={contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
                    >
                      Open Content →
                    </a>

                  </div>
                )
              ) : (
                <div className="px-8 py-16 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
                    📝
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    No Content Added
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    This lesson does not
                    have content yet.
                  </p>

                </div>
              )}

            </section>

            {/* COMPLETE AREA */}
            <section className="mt-6 rounded-[28px] border border-white/[0.08] bg-[#0a1526] p-6 sm:p-7">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="font-semibold">
                    Lesson Progress
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {completed
                      ? "This lesson is complete and included in your course progress."
                      : "Complete the lesson when you are ready to continue."}
                  </p>

                </div>

                {completed ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 font-semibold text-emerald-400">
                    ✓ Lesson Completed
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={
                      markComplete
                    }
                    disabled={saving}
                    className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold shadow-lg shadow-emerald-600/10 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : "✓ Mark as Complete"}
                  </button>
                )}

              </div>

            </section>

            {successMessage && (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400">
                ✓ {successMessage}
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
                ✕ {error}
              </div>
            )}

            {/* PREVIOUS / NEXT */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">

              <button
                type="button"
                disabled={!previousLesson}
                onClick={() => {
                  if (
                    previousLesson
                  ) {
                    openLesson(
                      previousLesson.id
                    );
                  }
                }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left transition hover:border-blue-500/30 hover:bg-blue-500/[0.03] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Previous Lesson
                </p>

                <p className="mt-2 font-semibold">
                  {previousLesson
                    ? `← ${previousLesson.title}`
                    : "No previous lesson"}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (nextLesson) {
                    openLesson(
                      nextLesson.id
                    );
                  } else {
                    backToCourse();
                  }
                }}
                className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-5 text-left transition hover:bg-blue-500/[0.1]"
              >
                <p className="text-xs uppercase tracking-wider text-blue-400">
                  {nextLesson
                    ? "Next Lesson"
                    : courseCompleted
                    ? "Course Complete"
                    : "Course View"}
                </p>

                <p className="mt-2 font-semibold">
                  {nextLesson
                    ? `${nextLesson.title} →`
                    : courseCompleted
                    ? "Review Course →"
                    : "Back to Course →"}
                </p>
              </button>

            </div>

          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">

            {/* COURSE OUTLINE */}
            <section className="rounded-[28px] border border-white/[0.09] bg-[#091523] p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Course
                  </p>

                  <h2 className="mt-2 text-lg font-bold">
                    {course.title}
                  </h2>
                </div>

                <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-400">
                  {allLessons.length} lessons
                </span>

              </div>

              <div className="mt-5 space-y-2">

                {allLessons.map(
                  (item) => {
                    const isCurrent =
                      item.id ===
                      lessonId;

                    const isDone =
                      completedLessonIds.has(
                        item.id
                      );

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          openLesson(
                            item.id
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                          isCurrent
                            ? "border-blue-500/30 bg-blue-500/10"
                            : "border-transparent bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                            isDone
                              ? "bg-emerald-500/10 text-emerald-400"
                              : isCurrent
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-white/[0.05] text-slate-500"
                          }`}
                        >
                          {isDone
                            ? "✓"
                            : item.lesson_order}
                        </div>

                        <div className="min-w-0">

                          <p
                            className={`truncate text-sm font-medium ${
                              isCurrent
                                ? "text-white"
                                : "text-slate-300"
                            }`}
                          >
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {formatDuration(
                              item.duration
                            ) ||
                              item.lesson_type ||
                              "Lesson"}
                          </p>

                        </div>
                      </button>
                    );
                  }
                )}

              </div>

            </section>

            {/* SUMMARY */}
            <section className="rounded-[28px] border border-white/[0.09] bg-[#091523] p-6">

              <h2 className="font-bold">
                Your Progress
              </h2>

              <div className="mt-5">

                <div className="flex justify-between text-sm">

                  <span className="text-slate-500">
                    Course completion
                  </span>

                  <span className="font-semibold">
                    {courseProgress}%
                  </span>

                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{
                      width: `${courseProgress}%`,
                    }}
                  />

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  {
                    completedLessonIds.size
                  }{" "}
                  of {allLessons.length}{" "}
                  lesson
                  {allLessons.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  completed.
                </p>

              </div>

              {courseCompleted && (
                <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
                  ✓ Course completed
                </div>
              )}

            </section>

            {/* BACK */}
            <button
              type="button"
              onClick={backToCourse}
              className="w-full rounded-xl border border-white/[0.1] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.04]"
            >
              ← Back to Course
            </button>

          </aside>

        </div>

      </div>

    </main>
  );
}