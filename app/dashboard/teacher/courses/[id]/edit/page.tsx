"use client";

import { FormEvent, useEffect, useState } from "react";
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

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [hours, setHours] = useState("");
  const [status, setStatus] = useState("published");
  const [accessType, setAccessType] = useState("free");
  const [price, setPrice] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

      const { data, error: courseError } = await supabase
        .from("courses")
        .select(
          "id, title, category, level, description, duration, estimated_hours, status, access_type, price"
        )
        .eq("id", courseId)
        .eq("teacher_id", user.id)
        .single();

      if (courseError || !data) {
        console.error("LOAD COURSE ERROR:", courseError);
        setError("Course not found or you are not the owner.");
        setLoading(false);
        return;
      }

      setCourse(data);

      setTitle(data.title || "");
      setCategory(data.category || "");
      setLevel(data.level || "beginner");
      setDescription(data.description || "");
      setDuration(data.duration || "");
      setHours(
        data.estimated_hours != null
          ? String(data.estimated_hours)
          : ""
      );
      setStatus(data.status || "published");
      setAccessType(data.access_type || "free");
      setPrice(
        data.price != null
          ? String(data.price)
          : "0"
      );

      setLoading(false);
    }

    loadCourse();
  }, [courseId, router]);

  async function updateCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Please enter a course title.");
      setSaving(false);
      return;
    }

    if (!category.trim()) {
      setError("Please enter a course category.");
      setSaving(false);
      return;
    }

    if (!description.trim()) {
      setError("Please enter a course description.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
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
        status,
        access_type: accessType,
        price:
          accessType === "free"
            ? 0
            : Number(price) || 0,
      })
      .eq("id", courseId)
      .eq("teacher_id", user.id)
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

    setCourse(data);

    setTitle(data.title || "");
    setCategory(data.category || "");
    setLevel(data.level || "beginner");
    setDescription(data.description || "");
    setDuration(data.duration || "");
    setHours(
      data.estimated_hours != null
        ? String(data.estimated_hours)
        : ""
    );
    setStatus(data.status || "published");
    setAccessType(data.access_type || "free");
    setPrice(
      data.price != null
        ? String(data.price)
        : "0"
    );

    setMessage("Course updated successfully! 🎉");

    setSaving(false);
  }

  function goBack() {
    router.push("/dashboard/teacher/courses");
  }

  function viewCourse() {
    router.push(
      `/dashboard/teacher/courses/${courseId}`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4">
            Loading course...
          </p>

        </div>
      </main>
    );
  }

  if (error && !course) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

        <div className="max-w-md text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            {error}
          </h1>

          <button
            onClick={goBack}
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

      {/* HEADER */}
      <header className="border-b border-slate-800">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

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
              onClick={goBack}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              ← My Courses
            </button>

            <button
              onClick={viewCourse}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
            >
              View Course
            </button>

          </div>

        </div>

      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-5xl px-6 py-10">

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            TEACHER PORTAL
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Edit Course
          </h2>

          <p className="mt-2 text-slate-400">
            Update your course information and settings.
          </p>

        </div>

        <form
          onSubmit={updateCourse}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-7"
        >

          <div className="grid gap-6 md:grid-cols-2">

            {/* TITLE */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Course Title
              </label>

              <input
                required
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Course title"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* CATEGORY */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Category
              </label>

              <input
                required
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="e.g. Web Development"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* LEVEL */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Level
              </label>

              <select
                value={level}
                onChange={(e) =>
                  setLevel(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
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

            {/* DURATION */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Duration
              </label>

              <input
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
                placeholder="e.g. 8 Weeks"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* HOURS */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Estimated Hours
              </label>

              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) =>
                  setHours(e.target.value)
                }
                placeholder="e.g. 40"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>

              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe what students will learn..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* STATUS */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Course Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>

              </select>

            </div>

            {/* ACCESS */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Access Type
              </label>

              <select
                value={accessType}
                onChange={(e) =>
                  setAccessType(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >

                <option value="free">
                  Free
                </option>

                <option value="paid">
                  Paid
                </option>

              </select>

            </div>

            {/* PRICE */}
            {accessType === "paid" && (

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium text-slate-300">
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
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

              </div>

            )}

          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              ✕ {error}
            </div>
          )}

          {/* SUCCESS */}
          {message && (
            <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
              ✓ {message}
            </div>
          )}

          {/* BUTTONS */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={goBack}
              disabled={saving}
              className="rounded-xl border border-slate-700 px-6 py-3.5 font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}