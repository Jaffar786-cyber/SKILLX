"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewLessonPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [courseTitle, setCourseTitle] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessonType, setLessonType] = useState("video");
  const [duration, setDuration] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [lessonOrder, setLessonOrder] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPage() {
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

      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .eq("teacher_id", user.id)
        .single();

      if (courseError || !course) {
        setError("Course not found or you are not the owner.");
        setLoading(false);
        return;
      }

      setCourseTitle(course.title);

      const { data: latestLesson } = await supabase
        .from("lessons")
        .select("lesson_order")
        .eq("course_id", courseId)
        .order("lesson_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLessonOrder((latestLesson?.lesson_order || 0) + 1);
      setLoading(false);
    }

    loadPage();
  }, [courseId, router]);

  async function createLesson(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Please enter a lesson title.");
      setSaving(false);
      return;
    }

    if (lessonType === "video" && !contentUrl.trim()) {
      setError("Please enter a YouTube or video URL.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("lessons").insert({
      course_id: courseId,
      title: title.trim(),
      description: description.trim() || null,
      lesson_type: lessonType,
      duration: duration.trim() || null,
      lesson_order: lessonOrder,
      content_url: contentUrl.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setMessage("Lesson created successfully.");
    setSaving(false);

    setTimeout(() => {
      router.push(`/dashboard/teacher/courses/${courseId}/lessons`);
    }, 700);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading lesson builder...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-bold">SKILLX</h1>
            <p className="text-xs text-slate-500">Teacher Portal</p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/teacher/courses/${courseId}/lessons`)
            }
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Back to Lessons
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            {courseTitle}
          </p>
          <h2 className="mt-2 text-3xl font-bold">Create New Lesson</h2>
          <p className="mt-2 text-slate-400">
            Add a video or learning resource to this course.
          </p>
        </div>

        <form
          onSubmit={createLesson}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-7"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                Lesson Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to HTML"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Lesson Type
              </label>
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="video">Video</option>
                <option value="article">Article / Link</option>
                <option value="document">Document</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Lesson Number
              </label>
              <input
                type="number"
                min="1"
                required
                value={lessonOrder}
                onChange={(e) => setLessonOrder(Number(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">Duration</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 15 minutes"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn in this lesson?"
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                {lessonType === "video" ? "YouTube / Video URL" : "Content URL"}
              </label>
              <input
                type="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                required={lessonType === "video"}
                placeholder={
                  lessonType === "video"
                    ? "https://youtu.be/..."
                    : "https://example.com/..."
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
              {lessonType === "video" && (
                <p className="mt-2 text-xs text-slate-500">
                  Normal YouTube share links are supported.
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating Lesson..." : "Create Lesson"}
          </button>
        </form>
      </div>
    </main>
  );
}
