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
};

export default function TeacherCoursePage() {
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

      if (profileError || profile?.role !== "teacher") {
        router.replace("/dashboard");
        return;
      }

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(
          "id, title, category, level, description, duration, estimated_hours, status, access_type, price"
        )
        .eq("id", courseId)
        .eq("teacher_id", user.id)
        .single();

      if (courseError || !courseData) {
        console.error("COURSE ERROR:", courseError);
        setError("Course not found or you are not the owner.");
        setLoading(false);
        return;
      }

      setCourse(courseData);

      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("id, title, description, lesson_order")
        .eq("course_id", courseId)
        .order("lesson_order", { ascending: true });

      if (lessonError) {
        setError(lessonError.message);
      } else {
        setLessons(lessonData || []);
      }

      setLoading(false);
    }

    loadCourse();
  }, [courseId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading course...
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center">

          <div className="text-5xl">⚠️</div>

          <h1 className="mt-5 text-2xl font-bold">
            {error || "Course not found"}
          </h1>

          <button
            onClick={() =>
              router.push("/dashboard/teacher/courses")
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            ← Back to Courses
          </button>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="font-bold">SKILLX</h1>
            <p className="text-xs text-slate-500">
              Teacher Portal
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/dashboard/teacher/courses")
            }
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← My Courses
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <p className="text-sm font-medium uppercase text-blue-400">
            {course.category || "Course"}
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            {course.title}
          </h2>

          {course.description && (
            <p className="mt-4 max-w-3xl text-slate-400">
              {course.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
            {course.level && (
              <span className="rounded-full bg-slate-800 px-4 py-2">
                Level: {course.level}
              </span>
            )}

            {course.duration && (
              <span className="rounded-full bg-slate-800 px-4 py-2">
                Duration: {course.duration}
              </span>
            )}

            <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-emerald-400">
              {course.status}
            </span>
          </div>

          <button
            onClick={() =>
              router.push(
                `/dashboard/teacher/courses/${courseId}/lessons`
              )
            }
            className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            Manage Lessons →
          </button>

        </section>

        <section className="mt-8">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h3 className="text-2xl font-bold">
                Course Lessons
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {lessons.length} lesson(s)
              </p>
            </div>

            <button
              onClick={() =>
                router.push(
                  `/dashboard/teacher/courses/${courseId}/lessons`
                )
              }
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
            >
              + Manage Lessons
            </button>

          </div>

          {lessons.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">

              <div className="text-4xl">📚</div>

              <h4 className="mt-4 text-lg font-semibold">
                No lessons yet
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Add your first lesson to this course.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <p className="text-xs text-blue-400">
                        LESSON {lesson.lesson_order}
                      </p>

                      <h4 className="mt-1 font-semibold">
                        {lesson.title}
                      </h4>

                      {lesson.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/teacher/courses/${courseId}/lessons/${lesson.id}`
                        )
                      }
                      className="shrink-0 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
                    >
                      Open
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