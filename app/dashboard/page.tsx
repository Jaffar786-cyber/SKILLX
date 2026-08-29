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

export default function StudentDashboardPage() {
  const router = useRouter();

  const [name, setName] = useState("Student");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
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
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (profile?.role !== "student") {
        router.replace("/dashboard/teacher");
        return;
      }

      setName(profile.full_name || "Student");

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(
          "id, title, category, level, description, duration, estimated_hours, status, access_type, price"
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (courseError) {
        setError(courseError.message);
      } else {
        setCourses(courseData || []);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading student dashboard...
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
            STUDENT DASHBOARD
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Welcome, {name} 👋
          </h2>

          <p className="mt-3 text-slate-400">
            Explore courses, learn new skills and grow with SKILLX.
          </p>

        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400">
            ✕ {error}
          </div>
        )}

        {/* STATS */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Available Courses
            </p>

            <p className="mt-2 text-3xl font-bold">
              {courses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              My Learning
            </p>

            <p className="mt-2 text-3xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold">
              0
            </p>
          </div>

        </section>

        {/* COURSES */}
        <section className="mt-10">

          <div className="mb-5">

            <p className="text-sm font-medium text-blue-400">
              LEARN WITH SKILLX
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              Explore Courses
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Choose a course and start learning.
            </p>

          </div>

          {courses.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center">

              <div className="text-5xl">
                📚
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No courses available
              </h3>

              <p className="mt-2 text-slate-500">
                Published courses will appear here.
              </p>

            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {courses.map((course) => (

                <div
                  key={course.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="text-xs font-medium uppercase text-blue-400">
                        {course.category || "Course"}
                      </p>

                      <h4 className="mt-2 text-xl font-bold">
                        {course.title}
                      </h4>

                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                      Published
                    </span>

                  </div>

                  {course.description && (
                    <p className="mt-4 line-clamp-3 text-sm text-slate-500">
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

                    {course.estimated_hours != null && (
                      <span>
                        {course.estimated_hours} hours
                      </span>
                    )}

                  </div>

                  <div className="mt-6">

                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/courses/${course.id}`
                        )
                      }
                      className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500"
                    >
                      View Course →
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