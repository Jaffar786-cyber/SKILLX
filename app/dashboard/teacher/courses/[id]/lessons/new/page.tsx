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
  const [lessonOrder, setLessonOrder] = useState("");
  const [contentUrl, setContentUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

      // Verify teacher
      const { data: profile, error: profileError } = await supabase
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

      // Verify teacher owns this course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .eq("teacher_id", user.id)
        .single();

      if (courseError || !course) {
        console.error("COURSE ERROR:", courseError);
        setError("Course not found or you are not the owner.");
        setLoading(false);
        return;
      }

      setCourseTitle(course.title);

      // Automatically suggest next lesson number
      const { data: lessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("lesson_order")
        .eq("course_id", courseId)
        .order("lesson_order", {
          ascending: false,
        })
        .limit(1);

      if (lessonsError) {
        console.error("LESSON ORDER ERROR:", lessonsError);
      }

      const lastOrder =
        lessons && lessons.length > 0
          ? Number(lessons[0].lesson_order) || 0
          : 0;

      setLessonOrder(String(lastOrder + 1));

      setLoading(false);
    }

    loadPage();
  }, [courseId, router]);

  async function createLesson(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanDuration = duration.trim();
    const cleanContentUrl = contentUrl.trim();

    if (!cleanTitle) {
      setError("Lesson title is required.");
      setSaving(false);
      return;
    }

    if (!lessonOrder || Number(lessonOrder) < 1) {
      setError("Please enter a valid lesson order.");
      setSaving(false);
      return;
    }

    if (lessonType === "video" && !cleanContentUrl) {
      setError("Please enter a YouTube or video URL.");
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

    // Re-check course ownership before saving
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .eq("teacher_id", user.id)
      .single();

    if (courseError || !course) {
      setError("You are not allowed to add lessons to this course.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        title: cleanTitle,
        description: cleanDescription || null,
        lesson_type: lessonType,
        duration: cleanDuration || null,
        lesson_order: Number(lessonOrder),
        content_url: cleanContentUrl || null,
      });

    if (insertError) {
      console.error("CREATE LESSON ERROR:", insertError);
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setMessage("Lesson created successfully! 🎉");

    setTimeout(() => {
      router.push(
        `/dashboard/teacher/courses/${courseId}/lessons`
      );
    }, 1000);
  }

  function backToLessons() {
    router.push(
      `/dashboard/teacher/courses/${courseId}/lessons`
    );
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

  if (error && !courseTitle) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            {error}
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/teacher")
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            ← Teacher Dashboard
          </button>

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
            onClick={backToLessons}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            ← Lessons
          </button>

        </div>

      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-4xl px-6 py-10">

        <div className="mb-8">

          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            {courseTitle}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Create New Lesson
          </h2>

          <p className="mt-2 text-slate-400">
            Add lesson content for your students.
          </p>

        </div>

        <form
          onSubmit={createLesson}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-7"
        >

          <div className="grid gap-6 md:grid-cols-2">

            {/* LESSON TITLE */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm text-slate-300">
                Lesson Title
              </label>

              <input
                type="text"
                required
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Introduction to HTML"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* LESSON TYPE */}
            <div>

              <label className="mb-2 block text-sm text-slate-300">
                Lesson Type
              </label>

              <select
                value={lessonType}
                onChange={(e) =>
                  setLessonType(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="video">
                  Video
                </option>

                <option value="article">
                  Article / Link
                </option>

                <option value="document">
                  Document
                </option>
              </select>

            </div>

            {/* LESSON ORDER */}
            <div>

              <label className="mb-2 block text-sm text-slate-300">
                Lesson Number
              </label>

              <input
                type="number"
                min="1"
                required
                value={lessonOrder}
                onChange={(e) =>
                  setLessonOrder(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* DURATION */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm text-slate-300">
                Duration
              </label>

              <input
                type="text"
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
                placeholder="e.g. 15 minutes"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm text-slate-300">
                Description
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="What will students learn in this lesson?"
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* CONTENT URL */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm text-slate-300">
                {lessonType === "video"
                  ? "YouTube / Video URL"
                  : "Content URL"}
              </label>

              <input
                type="url"
                value={contentUrl}
                onChange={(e) =>
                  setContentUrl(e.target.value)
                }
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
                  Normal YouTube share link is supported.
                  Example: https://youtu.be/VIDEO_ID
                </p>
              )}

            </div>

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

          {/* CREATE BUTTON */}
          <button
            type="submit"
            disabled={saving}
            className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Creating Lesson..."
              : "Create Lesson"}
          </button>

        </form>

      </div>

    </main>
  );
}