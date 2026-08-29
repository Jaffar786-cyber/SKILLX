"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function TeacherDashboardPage() {
  const router = useRouter();

  const [name, setName] = useState("Teacher");
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonCount, setLessonCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeacher() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // CHECK TEACHER PROFILE
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (profile?.role !== "teacher") {
        router.replace("/dashboard");
        return;
      }

      setName(profile.full_name || "Teacher");

      // LOAD TEACHER COURSES
      const { data: courseData, error: courseError } =
        await supabase
          .from("courses")
          .select(
            "id, title, category, level, description, duration, estimated_hours, status, access_type, price"
          )
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false });

      if (courseError) {
        console.error("TEACHER COURSES ERROR:", courseError);
        setError(courseError.message);
        setLoading(false);
        return;
      }

      const teacherCourses = courseData || [];

      setCourses(teacherCourses);

      // GET COURSE IDS
      const courseIds = teacherCourses.map(
        (course) => course.id
      );

      // LOAD TOTAL LESSONS
      if (courseIds.length > 0) {
        const { count, error: lessonError } =
          await supabase
            .from("lessons")
            .select("id", {
              count: "exact",
              head: true,
            })
            .in("course_id", courseIds);

        if (lessonError) {
          console.error(
            "LESSON COUNT ERROR:",
            lessonError
          );
        } else {
          setLessonCount(count || 0);
        }
      } else {
        setLessonCount(0);
      }

      /*
       * STUDENT COUNT
       *
       * If enrollments table exists, this will count
       * students enrolled in this teacher's courses.
       *
       * If the table is not ready yet, dashboard
       * will safely show 0.
       */
      if (courseIds.length > 0) {
        const { count, error: enrollmentError } =
          await supabase
            .from("enrollments")
            .select("id", {
              count: "exact",
              head: true,
            })
            .in("course_id", courseIds);

        if (enrollmentError) {
          console.log(
            "ENROLLMENT COUNT NOT READY:",
            enrollmentError.message
          );
          setStudentCount(0);
        } else {
          setStudentCount(count || 0);
        }
      } else {
        setStudentCount(0);
      }

      setLoading(false);
    }

    loadTeacher();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const publishedCourses = courses.filter(
    (course) => course.status === "published"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4">
            Loading teacher dashboard...
          </p>

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
                Teacher Portal
              </p>

            </div>

          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-red-500/10 hover:text-red-400"
          >
            Logout
          </button>

        </div>

      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* WELCOME */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <p className="text-sm font-medium text-blue-400">
            TEACHER DASHBOARD
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Welcome, {name} 👋
          </h2>

          <p className="mt-3 text-slate-400">
            Create courses, manage lessons and help students
            learn.
          </p>

        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400">
            ✕ {error}
          </div>
        )}

        {/* STATS */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* COURSES */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <p className="text-sm text-slate-400">
                My Courses
              </p>

              <span className="text-2xl">
                📚
              </span>

            </div>

            <p className="mt-2 text-3xl font-bold">
              {courses.length}
            </p>

          </div>

          {/* PUBLISHED */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <p className="text-sm text-slate-400">
                Published
              </p>

              <span className="text-2xl">
                🟢
              </span>

            </div>

            <p className="mt-2 text-3xl font-bold">
              {publishedCourses}
            </p>

          </div>

          {/* STUDENTS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <p className="text-sm text-slate-400">
                Students
              </p>

              <span className="text-2xl">
                👨‍🎓
              </span>

            </div>

            <p className="mt-2 text-3xl font-bold">
              {studentCount}
            </p>

          </div>

          {/* LESSONS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <p className="text-sm text-slate-400">
                Lessons
              </p>

              <span className="text-2xl">
                📖
              </span>

            </div>

            <p className="mt-2 text-3xl font-bold">
              {lessonCount}
            </p>

          </div>

        </section>

        {/* ACTIONS */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">

          <button
            onClick={() =>
              router.push(
                "/dashboard/teacher/courses"
              )
            }
            className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-left transition hover:border-blue-500 hover:bg-slate-900/80"
          >

            <div className="text-4xl">
              📚
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Manage Courses
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create, edit and publish your courses.
            </p>

          </button>

          <button
            onClick={() =>
              router.push(
                "/dashboard/teacher/courses/new"
              )
            }
            className="rounded-3xl border border-blue-500/30 bg-blue-600/10 p-8 text-left transition hover:bg-blue-600/20"
          >

            <div className="text-4xl">
              ➕
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Create New Course
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Start building a new learning course.
            </p>

          </button>

        </section>

        {/* MY COURSES */}
        <section className="mt-10">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-blue-400">
                MY COURSES
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                Your Courses
              </h3>

            </div>

            <button
              onClick={() =>
                router.push(
                  "/dashboard/teacher/courses"
                )
              }
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Manage All
            </button>

          </div>

          {courses.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">

              <div className="text-5xl">
                📚
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No courses yet
              </h3>

              <p className="mt-2 text-slate-500">
                Create your first course to start teaching.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/dashboard/teacher/courses/new"
                  )
                }
                className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
              >
                Create Course
              </button>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2">

              {courses.map((course) => (

                <div
                  key={course.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-xs font-medium uppercase text-blue-400">
                        {course.category || "Course"}
                      </p>

                      <h4 className="mt-2 text-xl font-bold">
                        {course.title}
                      </h4>

                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        course.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {course.status || "draft"}
                    </span>

                  </div>

                  {course.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                      {course.description}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">

                    {course.level && (
                      <span>
                        Level: {course.level}
                      </span>
                    )}

                    {course.duration && (
                      <span>
                        Duration: {course.duration}
                      </span>
                    )}

                    {course.access_type && (
                      <span>
                        Access: {course.access_type}
                      </span>
                    )}

                  </div>

                  <div className="mt-6 flex gap-3">

                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/teacher/courses/${course.id}/lessons`
                        )
                      }
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-500"
                    >
                      Manage Lessons
                    </button>

                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/teacher/courses/${course.id}`
                        )
                      }
                      className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold hover:bg-slate-800"
                    >
                      View
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