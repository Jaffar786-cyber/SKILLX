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
  access_type: string | null;
  price: number | null;
};

export default function StudentDashboard() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    console.log("🔥 STUDENT DASHBOARD FILE LOADED");
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      // Check logged-in student
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("👤 CURRENT USER:", user);
      console.log("👤 USER ERROR:", userError);

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserEmail(user.email || "");

      // Get published courses
      const { data, error: coursesError } = await supabase
        .from("courses")
        .select(
          "id, title, category, level, description, duration, estimated_hours, access_type, price"
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

      console.log("📚 COURSES FROM SUPABASE:", data);
      console.log("❌ COURSES ERROR:", coursesError);

      if (coursesError) {
        setError(coursesError.message);
        setLoading(false);
        return;
      }

      setCourses(data || []);
    } catch (err) {
      console.error("🔥 DASHBOARD ERROR:", err);
      setError("Unable to load courses.");
    }

    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">SKILLX</div>
          <p className="mt-2 text-slate-400">Loading courses...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold">SKILLX</h1>
            <p className="text-xs text-slate-500">
              Student Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-400 md:block">
              {userEmail}
            </span>

            <button
              onClick={logout}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-6 py-10">

        <div className="mb-10">
          <p className="text-sm font-medium text-blue-400">
            STUDENT PORTAL
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Welcome to SKILLX 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Explore available courses and start learning.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* COURSE HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">
              Available Courses
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {courses.length} published course
              {courses.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {/* NO COURSES */}
        {courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
              📚
            </div>

            <h3 className="mt-5 text-xl font-bold">
              No courses yet
            </h3>

            <p className="mt-2 text-slate-500">
              There are currently no published courses available.
            </p>

          </div>
        ) : (

          /* COURSES */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {courses.map((course) => (

              <div
                key={course.id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
              >

                {/* COURSE TOP */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-6">

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    {course.category || "General"}
                  </span>

                  <h4 className="mt-5 text-xl font-bold">
                    {course.title}
                  </h4>

                </div>

                {/* COURSE BODY */}
                <div className="p-6">

                  <div className="flex gap-3 text-xs text-slate-500">

                    {course.level && (
                      <span>
                        Level: {course.level}
                      </span>
                    )}

                    {course.duration && (
                      <span>
                        • {course.duration}
                      </span>
                    )}

                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                    {course.description ||
                      "Start learning this course on SKILLX."}
                  </p>

                  <div className="mt-5 flex items-center justify-between">

                    <span className="font-bold text-emerald-400">
                      {course.access_type === "free"
                        ? "FREE"
                        : `PKR ${course.price || 0}`}
                    </span>

                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/courses/${course.id}/lessons`
                        )
                      }
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500"
                    >
                      View Course
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </main>
  );
}