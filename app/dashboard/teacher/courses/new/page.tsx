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

      setTeacherId(user.id);
      setLoading(false);
    }

    checkTeacher();
  }, [router]);

  async function createCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const { error } = await supabase.from("courses").insert({
      teacher_id: teacherId,
      title: title.trim(),
      category: category.trim(),
      level,
      description: description.trim(),
      duration: duration.trim(),
      estimated_hours: Number(hours) || 0,
      status: "published",
      access_type: accessType,
      price: accessType === "free" ? 0 : Number(price) || 0,
    });

    if (error) {
      console.error("CREATE COURSE ERROR:", error);
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage("Course created successfully! 🎉");

    setTimeout(() => {
      router.push("/dashboard/teacher");
    }, 1200);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="font-bold">SKILLX</h1>
            <p className="text-xs text-slate-500">
              Teacher Portal
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/teacher")}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            ← Back
          </button>

        </div>
      </header>

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

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                Course Title
              </label>

              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Web Development"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Category
              </label>

              <input
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Web Development"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Level
              </label>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Duration
              </label>

              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 8 Weeks"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
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
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 40"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
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
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Access Type
              </label>

              <select
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
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
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
            )}

          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
              ✕ {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400">
              ✓ {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? "Creating Course..." : "Create Course"}
          </button>

        </form>
      </div>
    </main>
  );
}