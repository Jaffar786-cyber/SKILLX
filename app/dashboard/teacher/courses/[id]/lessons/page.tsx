"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  lesson_type: string | null;
  duration: string | null;
  lesson_order: number;
  content_url: string | null;
};

export default function LessonsPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseTitle, setCourseTitle] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessonType, setLessonType] = useState("video");
  const [duration, setDuration] = useState("");
  const [contentUrl, setContentUrl] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "teacher") {
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

      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select(
          "id, title, description, lesson_type, duration, lesson_order, content_url"
        )
        .eq("course_id", courseId)
        .order("lesson_order", { ascending: true });

      if (lessonError) {
        setError(lessonError.message);
      } else {
        setLessons(lessonData || []);
      }

      setLoading(false);
    }

    loadData();
  }, [courseId, router]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setLessonType("video");
    setDuration("");
    setContentUrl("");
    setEditingId(null);
  }

  function editLesson(lesson: Lesson) {
    setEditingId(lesson.id);
    setTitle(lesson.title);
    setDescription(lesson.description || "");
    setLessonType(lesson.lesson_type || "video");
    setDuration(lesson.duration || "");
    setContentUrl(lesson.content_url || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveLesson(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Please enter a lesson title.");
      setSaving(false);
      return;
    }

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from("lessons")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          lesson_type: lessonType,
          duration: duration.trim() || null,
          content_url: contentUrl.trim() || null,
        })
        .eq("id", editingId)
        .eq("course_id", courseId)
        .select(
          "id, title, description, lesson_type, duration, lesson_order, content_url"
        )
        .single();

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setLessons((current) =>
        current.map((lesson) =>
          lesson.id === editingId ? data : lesson
        )
      );

      setMessage("Lesson updated successfully! 🎉");
      resetForm();
      setSaving(false);
      return;
    }

    const nextOrder =
      lessons.length > 0
        ? Math.max(
            ...lessons.map((lesson) => lesson.lesson_order)
          ) + 1
        : 1;

    const { data, error: insertError } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        title: title.trim(),
        description: description.trim() || null,
        lesson_type: lessonType,
        duration: duration.trim() || null,
        lesson_order: nextOrder,
        content_url: contentUrl.trim() || null,
      })
      .select(
        "id, title, description, lesson_type, duration, lesson_order, content_url"
      )
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setLessons((current) => [...current, data]);

    setMessage("Lesson created successfully! 🎉");

    resetForm();

    setSaving(false);
  }

  async function deleteLesson(id: string) {
    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("lessons")
      .delete()
      .eq("id", id)
      .eq("course_id", courseId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setLessons((current) =>
      current.filter((lesson) => lesson.id !== id)
    );

    setMessage("Lesson deleted successfully.");
  }

  function openLesson(lessonId: string) {
    router.push(
      `/dashboard/teacher/courses/${courseId}/lessons/${lessonId}`
    );
  }

  function courseView() {
    router.push(
      `/dashboard/teacher/courses/${courseId}`
    );
  }

  function dashboard() {
    router.push("/dashboard/teacher");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <p className="mt-4">Loading lessons...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

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
              onClick={dashboard}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              ← Dashboard
            </button>

            <button
              onClick={courseView}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
            >
              Course View
            </button>

          </div>

        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* TITLE */}
        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            COURSE LESSONS
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {courseTitle}
          </h2>

          <p className="mt-2 text-slate-400">
            Create and manage lessons for this course.
          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={saveLesson}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-7"
        >

          <div className="flex items-center justify-between gap-4">

            <h3 className="text-xl font-bold">
              {editingId ? "Edit Lesson" : "Add New Lesson"}
            </h3>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800"
              >
                Cancel Edit
              </button>
            )}

          </div>

          <div className="mt-6 space-y-5">

            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson title"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short lesson description"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="video">
                Video
              </option>

              <option value="article">
                Article
              </option>

              <option value="quiz">
                Quiz
              </option>

              <option value="assignment">
                Assignment
              </option>
            </select>

            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration e.g. 25 minutes"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Content / Video URL
              </label>

              <input
                type="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                For YouTube videos, use the embed URL.
              </p>
            </div>

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
              ? editingId
                ? "Updating Lesson..."
                : "Creating Lesson..."
              : editingId
              ? "Update Lesson"
              : "Create Lesson"}
          </button>

        </form>

        {/* LESSONS */}
        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">

            <h3 className="text-xl font-bold">
              Lessons ({lessons.length})
            </h3>

            <button
              onClick={courseView}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Course View →
            </button>

          </div>

          {lessons.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
              No lessons yet.
            </div>

          ) : (

            <div className="space-y-4">

              {lessons.map((lesson) => (

                <div
                  key={lesson.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <p className="text-xs font-medium text-blue-400">
                        LESSON {lesson.lesson_order}
                      </p>

                      <h4 className="mt-1 text-lg font-bold">
                        {lesson.title}
                      </h4>

                      {lesson.description && (
                        <p className="mt-2 text-sm text-slate-500">
                          {lesson.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">

                        {lesson.lesson_type && (
                          <span>
                            Type: {lesson.lesson_type}
                          </span>
                        )}

                        {lesson.duration && (
                          <span>
                            Duration: {lesson.duration}
                          </span>
                        )}

                        <span>
                          {lesson.content_url
                            ? "Content Added"
                            : "No Content"}
                        </span>

                      </div>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() => openLesson(lesson.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
                      >
                        Open Lesson
                      </button>

                      <button
                        onClick={() => editLesson(lesson)}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteLesson(lesson.id)}
                        className="rounded-lg px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </button>

                    </div>

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