"use client";

import { FormEvent, useEffect, useState } from "react";
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

export default function TeacherCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [hours, setHours] = useState("");
  const [accessType, setAccessType] = useState("free");
  const [price, setPrice] = useState("0");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
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

      const { data, error: courseError } = await supabase
        .from("courses")
        .select(
          "id, title, category, level, description, duration, estimated_hours, status, access_type, price"
        )
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (courseError) {
        setError(courseError.message);
      } else {
        setCourses(data || []);
      }

      setLoading(false);
    }

    loadCourses();
  }, [router]);

  function openEdit(course: Course) {
    setEditingCourse(course);

    setTitle(course.title);
    setCategory(course.category || "");
    setLevel(course.level || "beginner");
    setDescription(course.description || "");
    setDuration(course.duration || "");
    setHours(
      course.estimated_hours != null
        ? String(course.estimated_hours)
        : ""
    );
    setAccessType(course.access_type || "free");
    setPrice(course.price != null ? String(course.price) : "0");

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeEdit() {
    setEditingCourse(null);

    setTitle("");
    setCategory("");
    setLevel("beginner");
    setDescription("");
    setDuration("");
    setHours("");
    setAccessType("free");
    setPrice("0");

    setError("");
    setMessage("");
  }

  async function updateCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editingCourse) return;

    setSaving(true);
    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Please enter a course title.");
      setSaving(false);
      return;
    }

    if (!category.trim()) {
      setError("Please enter a category.");
      setSaving(false);
      return;
    }

    if (!description.trim()) {
      setError("Please enter a course description.");
      setSaving(false);
      return;
    }

    const { data, error: updateError } = await supabase
      .from("courses")
      .update({
        title: title.trim(),
        category: category.trim(),
        level,
        description: description.trim(),
        duration: duration.trim() || null,
        estimated_hours: Number(hours) || 0,
        access_type: accessType,
        price:
          accessType === "free"
            ? 0
            : Number(price) || 0,
      })
      .eq("id", editingCourse.id)
      .select(
        "id, title, category, level, description, duration, estimated_hours, status, access_type, price"
      )
      .single();

    if (updateError) {
      console.error("UPDATE COURSE ERROR:", updateError);
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setCourses((current) =>
      current.map((course) =>
        course.id === editingCourse.id
          ? data
          : course
      )
    );

    setMessage("Course updated successfully! 🎉");

    setSaving(false);

    setTimeout(() => {
      closeEdit();
    }, 800);
  }

  async function deleteCourse(course: Course) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(course.id);
    setError("");
    setMessage("");

    // Delete lessons first
    const { error: lessonDeleteError } = await supabase
      .from("lessons")
      .delete()
      .eq("course_id", course.id);

    if (lessonDeleteError) {
      console.error(
        "DELETE LESSONS ERROR:",
        lessonDeleteError
      );

      setError(
        `Could not delete course lessons: ${lessonDeleteError.message}`
      );

      setDeleting(null);
      return;
    }

    // Delete course
    const { error: courseDeleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id);

    if (courseDeleteError) {
      console.error(
        "DELETE COURSE ERROR:",
        courseDeleteError
      );

      setError(courseDeleteError.message);
      setDeleting(null);
      return;
    }

    setCourses((current) =>
      current.filter(
        (item) => item.id !== course.id
      )
    );

    setMessage("Course deleted successfully.");

    setDeleting(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <p className="mt-4">
            Loading courses...
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

          <div className="flex gap-3">

            <button
              onClick={() =>
                router.push("/dashboard/teacher")
              }
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              ← Dashboard
            </button>

            <button
              onClick={() =>
                router.push(
                  "/dashboard/teacher/courses/new"
                )
              }
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
            >
              + New Course
            </button>

          </div>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* PAGE TITLE */}
        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            TEACHER PORTAL
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            My Courses
          </h2>

          <p className="mt-2 text-slate-400">
            Create, edit, delete and manage your courses.
          </p>

        </div>

        {/* EDIT FORM */}
        {editingCourse && (
          <section className="mb-8 rounded-3xl border border-blue-500/30 bg-slate-900 p-7">

            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-sm font-medium text-blue-400">
                  EDIT COURSE
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  {editingCourse.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
              >
                Cancel
              </button>

            </div>

            <form
              onSubmit={updateCourse}
              className="mt-7"
            >

              <div className="grid gap-5 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-slate-300">
                    Course Title
                  </label>

                  <input
                    required
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Category
                  </label>

                  <input
                    required
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Level
                  </label>

                  <select
                    value={level}
                    onChange={(e) =>
                      setLevel(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="beginner">
                      Beginner
                    </option>

                    <option value="intermediate">
                      Intermediate
                    </option>

                    <option value="advanced">
                      Advanced
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Duration
                  </label>

                  <input
                    value={duration}
                    onChange={(e) =>
                      setDuration(e.target.value)
                    }
                    placeholder="e.g. 8 Weeks"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Estimated Hours
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={hours}
                    onChange={(e) =>
                      setHours(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-slate-300">
                    Description
                  </label>

                  <textarea
                    required
                    rows={5}
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Access Type
                  </label>

                  <select
                    value={accessType}
                    onChange={(e) =>
                      setAccessType(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="free">
                      Free
                    </option>

                    <option value="paid">
                      Paid
                    </option>
                  </select>
                </div>

                {accessType === "paid" && (
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                )}

              </div>

              {error && (
                <div className="mt-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
                  ✕ {error}
                </div>
              )}

              {message && (
                <div className="mt-5 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400">
                  ✓ {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold hover:bg-blue-500 disabled:opacity-60"
              >
                {saving
                  ? "Updating Course..."
                  : "Save Changes"}
              </button>

            </form>

          </section>
        )}

        {/* GLOBAL MESSAGE */}
        {!editingCourse && error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400">
            ✕ {error}
          </div>
        )}

        {!editingCourse && message && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-400">
            ✓ {message}
          </div>
        )}

        {/* COURSES */}
        {courses.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center">

            <div className="text-5xl">
              📚
            </div>

            <h3 className="mt-5 text-xl font-semibold">
              No courses yet
            </h3>

            <p className="mt-2 text-slate-500">
              Create your first course.
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {courses.map((course) => (

              <div
                key={course.id}
                className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="text-xs uppercase text-blue-400">
                      {course.category || "Course"}
                    </p>

                    <h3 className="mt-2 text-xl font-bold">
                      {course.title}
                    </h3>

                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                      course.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {course.status || "draft"}
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
                      {course.duration}
                    </span>
                  )}

                  {course.estimated_hours != null && (
                    <span>
                      {course.estimated_hours} hours
                    </span>
                  )}

                  {course.access_type && (
                    <span>
                      {course.access_type}
                    </span>
                  )}

                </div>

                {/* MAIN ACTIONS */}
                <div className="mt-6 grid grid-cols-2 gap-3">

                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/teacher/courses/${course.id}`
                      )
                    }
                    className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold hover:bg-slate-800"
                  >
                    View Course
                  </button>

                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/teacher/courses/${course.id}/lessons`
                      )
                    }
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-500"
                  >
                    Lessons
                  </button>

                </div>

                {/* EDIT DELETE */}
                <div className="mt-3 grid grid-cols-2 gap-3">

                  <button
                    onClick={() =>
                      openEdit(course)
                    }
                    className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-400 hover:bg-blue-500/20"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteCourse(course)
                    }
                    disabled={deleting === course.id}
                    className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deleting === course.id
                      ? "Deleting..."
                      : "🗑 Delete"}
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </main>
  );
}