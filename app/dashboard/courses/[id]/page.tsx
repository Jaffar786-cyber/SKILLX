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

export default function StudentCoursePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
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
        .select(
          "id, title, category, level, description, duration, estimated_hours, status, access_type, price"
        )
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
          "id, title, description, lesson_order, lesson_type, duration, content_url"
        )
        .eq("course_id", courseId)
        .order("lesson_order", { ascending: true });

      if (lessonError) {
        console.error("LESSON ERROR:", lessonError);
        setError(lessonError.message);
      } else {
        setLessons(lessonData || []);
      }

      setLoading(false);
    }

    loadCourse();
  }, [courseId, router]);

  function goBack() {
    router.push("/dashboard");
  }

  function openLesson(lessonId: string) {
    router.push(
      `/dashboard/courses/${courseId}/lessons/${lessonId}`
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading course...
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            {error || "Course not found"}
          </h1>

          <button
            onClick={goBack}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            ← Back to Dashboard
          </button>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

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
            onClick={goBack}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* COURSE HERO */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

            <div className="max-w-3xl">

              <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
                {course.category || "Course"}
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                {course.title}
              </h2>

              {course.description && (
                <p className="mt-5 text-lg leading-8 text-slate-400">
                  {course.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">

                {course.level && (
                  <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                    🎯 {course.level}
                  </span>
                )}

                {course.duration && (
                  <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                    ⏱ {course.duration}
                  </span>
                )}

                {course.estimated_hours != null && (
                  <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                    📖 {course.estimated_hours} hours
                  </span>
                )}

              </div>

            </div>

            {/* COURSE PRICE */}
            <div className="min-w-[220px] rounded-2xl border border-slate-700 bg-slate-950 p-6">

              <p className="text-sm text-slate-500">
                Course Access
              </p>

              <p className="mt-2 text-3xl font-bold">

                {course.access_type === "free"
                  ? "Free"
                  : course.price != null
                  ? `Rs. ${course.price}`
                  : "Paid"}

              </p>

              <button
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
                onClick={() => {
                  document
                    .getElementById("course-lessons")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Start Learning →
              </button>

            </div>

          </div>

        </section>

        {/* COURSE CONTENT */}
        <section
          id="course-lessons"
          className="mt-10"
        >

          <div className="mb-6">

            <p className="text-sm font-medium text-blue-400">
              COURSE CONTENT
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              Course Lessons
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {lessons.length} lesson(s) available
            </p>

          </div>

          {lessons.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center">

              <div className="text-5xl">
                📚
              </div>

              <h4 className="mt-5 text-xl font-semibold">
                No lessons available yet
              </h4>

              <p className="mt-2 text-slate-500">
                The teacher has not added lessons to this course yet.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {lessons.map((lesson) => (

                <div
                  key={lesson.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-sm font-bold text-blue-400">
                        {lesson.lesson_order}
                      </div>

                      <div>

                        <h4 className="text-lg font-semibold">
                          {lesson.title}
                        </h4>

                        {lesson.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {lesson.description}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">

                          {lesson.lesson_type && (
                            <span>
                              Type: {lesson.lesson_type}
                            </span>
                          )}

                          {lesson.duration && (
                            <span>
                              Duration: {lesson.duration}
                            </span>
                          )}

                          <span>
                            {lesson.content_url
                              ? "Content available"
                              : "Content pending"}
                          </span>

                        </div>

                      </div>

                    </div>

                    <button
                      onClick={() => openLesson(lesson.id)}
                      className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
                    >
                      Open Lesson →
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}