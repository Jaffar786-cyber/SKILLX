"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Course = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  duration: string | null;
  estimated_hours: number | null;
  status: string | null;
  access_type: string | null;
  price: number | null;
};

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
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

      const { data, error } = await supabase
        .from("courses")
        .select(
          "id, title, description, category, level, duration, estimated_hours, status, access_type, price"
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("COURSES ERROR:", error);
        setError(error.message);
      } else {
        setCourses(data || []);
        setFilteredCourses(data || []);
      }

      setLoading(false);
    }

    loadCourses();
  }, [router]);

  useEffect(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      setFilteredCourses(courses);
      return;
    }

    const results = courses.filter((course) =>
      `${course.title} ${course.description || ""} ${
        course.category || ""
      } ${course.level || ""}`
        .toLowerCase()
        .includes(query)
    );

    setFilteredCourses(results);
  }, [search, courses]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <p className="mt-4 text-slate-400">
            Loading courses...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
              S
            </div>

            <div className="text-left">
              <h1 className="font-bold">SKILLX</h1>
              <p className="text-xs text-slate-500">
                Student Portal
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Hero */}
        <section>
          <p className="text-sm font-medium text-blue-400">
            LEARNING LIBRARY
          </p>

          <h2 className="mt-2 text-4xl font-bold tracking-tight">
            Explore Courses
          </h2>

          <p className="mt-3 max-w-2xl text-slate-400">
            Discover courses created by SKILLX teachers and start building
            valuable skills.
          </p>
        </section>

        {/* Search */}
        <section className="mt-8">
          <div className="relative max-w-2xl">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, categories, skills..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pl-12 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />

          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            ✕ {error}
          </div>
        )}

        {/* Courses */}
        <section className="mt-10">

          <div className="mb-5">
            <h3 className="text-xl font-bold">
              Available Courses
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {filteredCourses.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">

              <div className="text-5xl">
                📚
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                {search
                  ? "No courses found"
                  : "No published courses yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {search
                  ? "Try searching with a different keyword."
                  : "Published courses created by teachers will appear here."}
              </p>

            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {filteredCourses.map((course) => (

                <article
                  key={course.id}
                  className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl"
                >

                  {/* Cover */}
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-600/30 via-slate-900 to-slate-950">
                    <div className="text-6xl transition group-hover:scale-110">
                      📘
                    </div>
                  </div>

                  <div className="p-6">

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">

                      {course.category && (
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                          {course.category}
                        </span>
                      )}

                      {course.level && (
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                          {course.level}
                        </span>
                      )}

                    </div>

                    {/* Title */}
                    <h4 className="mt-4 line-clamp-2 text-xl font-bold">
                      {course.title}
                    </h4>

                    {/* Description */}
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {course.description ||
                        "Start learning this course with SKILLX."}
                    </p>

                    {/* Course info */}
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

                      {course.duration && (
                        <span>
                          ⏱ {course.duration}
                        </span>
                      )}

                      {course.estimated_hours && (
                        <span>
                          📖 {course.estimated_hours} hours
                        </span>
                      )}

                    </div>

                    {/* Access */}
                    <div className="mt-4">

                      {course.access_type === "free" ? (
                        <span className="text-sm font-semibold text-emerald-400">
                          Free
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-blue-400">
                          {course.price
                            ? `$${course.price}`
                            : "Premium"}
                        </span>
                      )}

                    </div>

                    {/* Button */}
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/courses/${course.id}`
                        )
                      }
                      className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500"
                    >
                      View Course
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}