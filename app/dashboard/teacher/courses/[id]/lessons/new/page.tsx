"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewCoursePage() {
  const router = useRouter();

  const [teacherId, setTeacherId] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [hours, setHours] = useState("");
  const [accessType, setAccessType] = useState("free");
  const [price, setPrice] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkTeacher() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (profileError) {
        console.error("PROFILE ERROR:", profileError);
        setError("Unable to verify your account.");
        setLoading(false);
        return;
      }

      if (profile?.role !== "teacher") {
        router.replace("/dashboard");
        return;
      }

      setTeacherId(user.id);
      setLoading(false);
    }

    checkTeacher();
  }, [router]);

  async function createCourse(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    if (!teacherId) {
      setError("Teacher account could not be verified.");
      setSaving(false);
      return;
    }

    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const cleanDescription = description.trim();
    const cleanDuration = duration.trim();

    if (!cleanTitle) {
      setError("Course title is required.");
      setSaving(false);
      return;
    }

    if (!cleanCategory) {
      setError("Course category is required.");
      setSaving(false);
      return;
    }

    if (!cleanDescription) {
      setError("Course description is required.");
      setSaving(false);
      return;
    }

    const { data: newCourse, error: createError } =
      await supabase
        .from("courses")
        .insert({
          teacher_id: teacherId,
          title: cleanTitle,
          category: cleanCategory,
          level,
          description: cleanDescription,
          duration: cleanDuration || null,
          estimated_hours: Number(hours) || 0,
          status: "published",
          access_type: accessType,
          price:
            accessType === "free"
              ? 0
              : Number(price) || 0,
        })
        .select("id")
        .single();

    if (createError) {
      console.error(
        "CREATE COURSE ERROR:",
        createError
      );

      setError(createError.message);
      setSaving(false);
      return;
    }

    if (!newCourse) {
      setError("Course could not be created.");
      setSaving(false);
      return;
    }

    setMessage("Course created successfully! 🎉");

    setTimeout(() => {
      router.push(
        `/dashboard/teacher/courses/${newCourse.id}`
      );
    }, 1000);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800">

        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="font-bold">
              SKILLX
            </h1>

            <p className="text-xs text-slate-500">
              Teacher Portal
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/teacher")
            }
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            ← Back
          </button>

        </div>

      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-4xl px-6 py-10">

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            TEACHER PORTAL
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Create New Course
          </h2>

          <p className="mt-2 text-slate-400">
            Build a course for SKILLX students.
          </p>

        </div>

        <form
          onSubmit={createCourse}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-7"
        >

          <div className="grid gap-6 md:grid-cols-2">

            {/* COURSE TITLE */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm text-slate-300">
                Course Title
              </label>

              <input
                type="text"
                required
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Complete Web Development"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* CATEGORY */}
            <div>

              <label className="mb-2 block text-sm text-slate-300">
                Category
              </label>

              <input
                type="text"
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

              <label className="mb-2 block text-sm text-slate-300">
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

              <label className="mb-2 block text-sm text-slate-300">
                Duration
              </label>

              <input
                type="text"
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
                placeholder="e.g. 8 Weeks"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* ESTIMATED HOURS */}
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
                placeholder="e.g. 40"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* DESCRIPTION */}
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
                placeholder="Describe what students will learn..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* ACCESS TYPE */}
            <div>

              <label className="mb-2 block text-sm text-slate-300">
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

          {/* CREATE */}
          <button
            type="submit"
            disabled={saving}
            className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Creating Course..."
              : "Create Course"}
          </button>

        </form>

      </div>

    </main>
  );
}