"use client";

import { useEffect, useState } from "react";
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

export default function StudentLessonPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  const lessonId = params.lessonid as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);

  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "student") {
        router.replace("/dashboard/teacher");
        return;
      }

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .eq("status", "published")
        .single();

      if (courseError || !courseData) {
        console.error("COURSE ERROR:", courseError);
        setError("Course not found or this course is not published.");
        setLoading(false);
        return;
      }

      setCourse(courseData);

      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select(
          "id, title, description, lesson_type, duration, lesson_order, content_url"
        )
        .eq("id", lessonId)
        .eq("course_id", courseId)
        .single();

      if (lessonError || !lessonData) {
        console.error("LESSON ERROR:", lessonError);
        setError("Lesson not found.");
        setLoading(false);
        return;
      }

      setLesson(lessonData);

      // Check existing progress
      const { data: progressData, error: progressError } = await supabase
        .from("lesson_progress")
        .select("completed")
        .eq("student_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (progressError) {
        console.error("PROGRESS ERROR:", progressError);
      }

      setCompleted(progressData?.completed === true);

      setLoading(false);
    }

    loadLesson();
  }, [courseId, lessonId, router]);

  async function markComplete() {
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error: progressError } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          student_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "student_id,lesson_id",
        }
      );

    if (progressError) {
      console.error("SAVE PROGRESS ERROR:", progressError);
      setError(progressError.message);
      setSaving(false);
      return;
    }

    setCompleted(true);
    setSaving(false);
  }

  function backToCourse() {
    router.push(`/dashboard/courses/${courseId}`);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading lesson...
      </main>
    );
  }

  if (error || !lesson || !course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">

          <div className="text-5xl">⚠️</div>

          <h1 className="mt-5 text-2xl font-bold">
            {error || "Lesson not found"}
          </h1>

          <button
            onClick={backToCourse}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            ← Back to Course
          </button>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
              S
            </div>

            <div>
              <h1 className="font-bold">
                SKILLX
              </h1>

              <p className="text-xs text-slate-500">
                Student Portal
              </p>
            </div>

          </div>

          <button
            onClick={backToCourse}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← Course
          </button>

        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* LESSON HEADER */}
        <div className="mb-8">

          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            {course.title}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
              Lesson {lesson.lesson_order}
            </span>

            {lesson.lesson_type && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {lesson.lesson_type}
              </span>
            )}

            {lesson.duration && (
              <span className="text-xs text-slate-500">
                Duration: {lesson.duration}
              </span>
            )}

            {completed && (
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                ✓ Completed
              </span>
            )}

          </div>

          <h2 className="mt-4 text-3xl font-bold">
            {lesson.title}
          </h2>

          {lesson.description && (
            <p className="mt-3 text-slate-400">
              {lesson.description}
            </p>
          )}

        </div>

        {/* VIDEO / CONTENT */}
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

          {lesson.content_url ? (

            lesson.lesson_type === "video" ? (

              <div className="aspect-video bg-black">

                <iframe
                  src={lesson.content_url}
                  title={lesson.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

              </div>

            ) : (

              <div className="p-12 text-center">

                <div className="text-5xl">
                  📖
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  Lesson Content
                </h3>

                <p className="mt-2 text-slate-400">
                  Open the lesson content to continue learning.
                </p>

                <a
                  href={lesson.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
                >
                  Open Content →
                </a>

              </div>

            )

          ) : (

            <div className="p-12 text-center">

              <div className="text-5xl">
                📝
              </div>

              <h3 className="mt-5 text-xl font-bold">
                No Content Added
              </h3>

              <p className="mt-2 text-slate-500">
                This lesson does not have content yet.
              </p>

            </div>

          )}

        </section>

        {/* COMPLETE LESSON */}
        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-300">
                Lesson Progress
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {completed
                  ? "You have completed this lesson."
                  : "Finish this lesson and mark it as complete."}
              </p>

            </div>

            {completed ? (

              <div className="rounded-xl bg-emerald-500/10 px-6 py-3 font-semibold text-emerald-400">
                ✓ Lesson Completed
              </div>

            ) : (

              <button
                onClick={markComplete}
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "✓ Mark as Complete"}
              </button>

            )}

          </div>

        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            ✕ {error}
          </div>
        )}

        {/* NAVIGATION */}
        <div className="mt-8 flex items-center justify-between">

          <button
            onClick={backToCourse}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold hover:bg-slate-800"
          >
            ← All Lessons
          </button>

          <button
            onClick={backToCourse}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
          >
            Course View →
          </button>

        </div>

      </div>

    </main>
  );
}