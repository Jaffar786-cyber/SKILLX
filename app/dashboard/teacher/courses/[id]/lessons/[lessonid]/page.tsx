"use client";

import { useEffect, useState } from "react";
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

function isYouTubeUrl(url: string) {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  );
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const cleanUrl = url.trim();

    // youtu.be/VIDEO_ID
    if (cleanUrl.includes("youtu.be/")) {
      const parsedUrl = new URL(cleanUrl);
      const videoId = parsedUrl.pathname.replace("/", "");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // youtube.com/watch?v=VIDEO_ID
    if (cleanUrl.includes("youtube.com/watch")) {
      const parsedUrl = new URL(cleanUrl);
      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // youtube.com/shorts/VIDEO_ID
    if (cleanUrl.includes("youtube.com/shorts/")) {
      const parsedUrl = new URL(cleanUrl);
      const parts = parsedUrl.pathname.split("/");
      const videoId = parts[2];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Already embed format
    if (cleanUrl.includes("youtube.com/embed/")) {
      return cleanUrl;
    }

    return cleanUrl;
  } catch (error) {
    console.error("VIDEO URL ERROR:", error);
    return url;
  }
}

export default function LessonLearningPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const lessonId = (
    params.lessonId ??
    params.lessonid
  ) as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [courseTitle, setCourseTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      setError("");

      if (!courseId || !lessonId) {
        setError("Invalid course or lesson.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // CHECK TEACHER PROFILE
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

      // LOAD COURSE OWNED BY TEACHER
      const { data: course, error: courseError } =
        await supabase
          .from("courses")
          .select("id, title")
          .eq("id", courseId)
          .eq("teacher_id", user.id)
          .single();

      if (courseError || !course) {
        console.error("COURSE ERROR:", courseError);

        setError(
          "Course not found or you are not the owner."
        );

        setLoading(false);
        return;
      }

      setCourseTitle(course.title);

      // LOAD LESSON
      const { data: lessonData, error: lessonError } =
        await supabase
          .from("lessons")
          .select(
            "id, title, description, lesson_type, duration, lesson_order, content_url"
          )
          .eq("id", lessonId)
          .eq("course_id", courseId)
          .single();

      if (lessonError || !lessonData) {
        console.error("LESSON ERROR:", lessonError);
        setError("Lesson not found.");
        setLoading(false);
        return;
      }

      setLesson(lessonData);
      setLoading(false);
    }

    loadLesson();
  }, [courseId, lessonId, router]);

  function goToLessons() {
    router.push(
      `/dashboard/teacher/courses/${courseId}/lessons`
    );
  }

  function goToCourse() {
    router.push(
      `/dashboard/teacher/courses/${courseId}`
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4">
            Loading lesson...
          </p>

        </div>

      </main>
    );
  }

  if (error || !lesson) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">

        <div className="max-w-md text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            {error || "Lesson not found."}
          </h1>

          <p className="mt-3 text-slate-500">
            Something went wrong while loading this lesson.
          </p>

          <button
            type="button"
            onClick={goToLessons}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            ← Back to Lessons
          </button>

        </div>

      </main>
    );
  }

  const contentUrl =
    lesson.content_url?.trim() || "";

  const embedUrl =
    contentUrl && isYouTubeUrl(contentUrl)
      ? getYouTubeEmbedUrl(contentUrl)
      : contentUrl;

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
              type="button"
              onClick={goToLessons}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              ← Lessons
            </button>

            <button
              type="button"
              onClick={goToCourse}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
            >
              Course View
            </button>

          </div>

        </div>

      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* COURSE + LESSON INFO */}
        <section className="mb-8">

          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            {courseTitle}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
              Lesson {lesson.lesson_order}
            </span>

            {lesson.lesson_type && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {lesson.lesson_type}
              </span>
            )}

            {lesson.duration && (
              <span className="text-xs text-slate-500">
                Duration: {lesson.duration}
              </span>
            )}

          </div>

          <h2 className="mt-4 text-3xl font-bold">
            {lesson.title}
          </h2>

          {lesson.description && (
            <p className="mt-3 text-slate-400">
              {lesson.description}
            </p>
          )}

        </section>

        {/* CONTENT */}
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

          {contentUrl ? (

            lesson.lesson_type?.toLowerCase() === "video" ? (

              isYouTubeUrl(contentUrl) ? (

                <div className="aspect-video bg-black">

                  <iframe
                    src={embedUrl}
                    title={lesson.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />

                </div>

              ) : (

                <div className="bg-black">

                  <video
                    src={contentUrl}
                    controls
                    className="aspect-video h-full w-full"
                  >
                    Your browser does not support the video tag.
                  </video>

                </div>

              )

            ) : (

              <div className="p-12 text-center">

                <div className="text-5xl">
                  📖
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  Lesson Content
                </h3>

                <p className="mt-2 text-slate-400">
                  Open the lesson content to continue.
                </p>

                <a
                  href={contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
                >
                  Open Content →
                </a>

              </div>

            )

          ) : (

            <div className="p-12 text-center">

              <div className="text-5xl">
                📝
              </div>

              <h3 className="mt-5 text-xl font-bold">
                No Content Added
              </h3>

              <p className="mt-2 text-slate-500">
                This lesson does not have content yet.
              </p>

              <button
                type="button"
                onClick={goToLessons}
                className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
              >
                ← Back to Lessons
              </button>

            </div>

          )}

        </section>

        {/* BOTTOM ACTIONS */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={goToLessons}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold hover:bg-slate-800"
          >
            ← All Lessons
          </button>

          <button
            type="button"
            onClick={goToCourse}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
          >
            Course View →
          </button>

        </div>

      </div>

    </main>
  );
}