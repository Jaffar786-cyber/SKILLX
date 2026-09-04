"use client";

import { useEffect, useMemo, useState } from "react";
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

type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  progress: number | null;
  completed: boolean | null;
  enrolled_at: string | null;
  completed_at: string | null;
};

type LessonRow = {
  id: string;
  course_id: string;
};

type CompletedLessonRow = {
  lesson_id: string;
};

type ModalType =
  | "profile"
  | "help"
  | "certificates"
  | "premium"
  | null;

export default function StudentDashboardPage() {
  const router = useRouter();

  const [name, setName] = useState("Student");
  const [email, setEmail] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [lessonCounts, setLessonCounts] =
    useState<Record<string, number>>({});

  const [searchQuery, setSearchQuery] = useState("");

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const [modal, setModal] =
    useState<ModalType>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      /*
       * AUTH
       */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email || "");

      /*
       * PROFILE
       */
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "PROFILE ERROR:",
          profileError
        );

        setError(
          "Unable to load your student profile."
        );

        setLoading(false);
        return;
      }

      if (profile?.role !== "student") {
        router.replace(
          "/dashboard/teacher"
        );
        return;
      }

      setName(
        profile.full_name || "Student"
      );

      /*
       * COURSES
       */
      const {
        data: courseData,
        error: courseError,
      } = await supabase
        .from("courses")
        .select(
          "id, title, category, level, description, duration, estimated_hours, status, access_type, price"
        )
        .eq("status", "published")
        .order("created_at", {
          ascending: false,
        });

      if (courseError) {
        console.error(
          "COURSE ERROR:",
          courseError
        );

        setError(
          "Unable to load courses."
        );

        setLoading(false);
        return;
      }

      const publishedCourses: Course[] =
        courseData || [];

      setCourses(publishedCourses);

      /*
       * ENROLLMENTS
       */
      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await supabase
        .from("enrollments")
        .select(
          "id, student_id, course_id, progress, completed, enrolled_at, completed_at"
        )
        .eq("student_id", user.id)
        .order("enrolled_at", {
          ascending: false,
        });

      if (enrollmentError) {
        console.error(
          "ENROLLMENT ERROR:",
          enrollmentError
        );

        setError(
          "Unable to load your learning progress."
        );

        setLoading(false);
        return;
      }

      const currentEnrollments: Enrollment[] =
        enrollmentData || [];

      /*
       * ALL LESSONS
       */
      let allLessons: LessonRow[] = [];

      if (publishedCourses.length > 0) {
        const courseIds =
          publishedCourses.map(
            (course) => course.id
          );

        const {
          data: lessonData,
          error: lessonError,
        } = await supabase
          .from("lessons")
          .select("id, course_id")
          .in("course_id", courseIds);

        if (lessonError) {
          console.error(
            "LESSON LOAD ERROR:",
            lessonError
          );
        } else {
          allLessons =
            lessonData || [];
        }
      }

      /*
       * LESSON COUNTS
       */
      const counts: Record<
        string,
        number
      > = {};

      allLessons.forEach((lesson) => {
        counts[lesson.course_id] =
          (counts[lesson.course_id] ||
            0) + 1;
      });

      setLessonCounts(counts);

      /*
       * COMPLETED LESSONS
       */
      let completedRows: CompletedLessonRow[] =
        [];

      const lessonIds =
        allLessons.map(
          (lesson) => lesson.id
        );

      if (lessonIds.length > 0) {
        const {
          data: completedData,
          error: completedError,
        } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("student_id", user.id)
          .eq("completed", true)
          .in("lesson_id", lessonIds);

        if (completedError) {
          console.error(
            "COMPLETED LESSON ERROR:",
            completedError
          );
        } else {
          completedRows =
            completedData || [];
        }
      }

      const completedLessonIds =
        new Set(
          completedRows.map(
            (row) => row.lesson_id
          )
        );

      /*
       * AUTO SYNC ENROLLMENTS
       */
      const syncedEnrollments: Enrollment[] =
        [];

      for (const enrollment of currentEnrollments) {
        const courseLessons =
          allLessons.filter(
            (lesson) =>
              lesson.course_id ===
              enrollment.course_id
          );

        const totalLessons =
          courseLessons.length;

        const completedLessons =
          courseLessons.filter(
            (lesson) =>
              completedLessonIds.has(
                lesson.id
              )
          ).length;

        const syncedProgress =
          totalLessons > 0
            ? Math.min(
                100,
                Math.round(
                  (completedLessons /
                    totalLessons) *
                    100
                )
              )
            : 0;

        const syncedCompleted =
          totalLessons > 0 &&
          completedLessons >=
            totalLessons;

        let syncedCompletedAt =
          enrollment.completed_at;

        if (
          syncedCompleted &&
          !syncedCompletedAt
        ) {
          syncedCompletedAt =
            new Date().toISOString();
        }

        if (!syncedCompleted) {
          syncedCompletedAt = null;
        }

        const oldProgress =
          Number(
            enrollment.progress
          ) || 0;

        const oldCompleted =
          enrollment.completed === true;

        const needsUpdate =
          oldProgress !==
            syncedProgress ||
          oldCompleted !==
            syncedCompleted ||
          enrollment.completed_at !==
            syncedCompletedAt;

        if (needsUpdate) {
          const { error: syncError } =
            await supabase
              .from("enrollments")
              .update({
                progress:
                  syncedProgress,
                completed:
                  syncedCompleted,
                completed_at:
                  syncedCompletedAt,
              })
              .eq(
                "id",
                enrollment.id
              );

          if (syncError) {
            console.error(
              "AUTO SYNC ERROR:",
              syncError
            );
          }
        }

        syncedEnrollments.push({
          ...enrollment,
          progress: syncedProgress,
          completed:
            syncedCompleted,
          completed_at:
            syncedCompletedAt,
        });
      }

      setEnrollments(
        syncedEnrollments
      );

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/login");
  }

  function openCourse(
    courseId: string
  ) {
    router.push(
      `/dashboard/courses/${courseId}`
    );
  }

  function scrollTo(
    sectionId: string
  ) {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  /*
   * DERIVED DATA
   */

  const activeEnrollments =
    useMemo(
      () =>
        enrollments.filter(
          (item) =>
            item.completed !== true
        ),
      [enrollments]
    );

  const completedEnrollments =
    useMemo(
      () =>
        enrollments.filter(
          (item) =>
            item.completed === true
        ),
      [enrollments]
    );

  const enrolledIds =
    useMemo(
      () =>
        new Set(
          enrollments.map(
            (item) =>
              item.course_id
          )
        ),
      [enrollments]
    );

  const exploreCourses =
    useMemo(
      () =>
        courses.filter(
          (course) =>
            !enrolledIds.has(
              course.id
            )
        ),
      [courses, enrolledIds]
    );

  const totalAvailableLessons =
    useMemo(
      () =>
        Object.values(
          lessonCounts
        ).reduce(
          (total, count) =>
            total + count,
          0
        ),
      [lessonCounts]
    );

  function getCourse(
    courseId: string
  ) {
    return courses.find(
      (course) =>
        course.id === courseId
    );
  }

  function matchesSearch(
    course: Course
  ) {
    const query =
      searchQuery
        .trim()
        .toLowerCase();

    if (!query) {
      return true;
    }

    return [
      course.title,
      course.category,
      course.level,
      course.description,
    ].some((value) =>
      value
        ?.toLowerCase()
        .includes(query)
    );
  }

  const filteredActive =
    useMemo(
      () =>
        activeEnrollments.filter(
          (enrollment) => {
            const course =
              getCourse(
                enrollment.course_id
              );

            return (
              course &&
              matchesSearch(course)
            );
          }
        ),
      [
        activeEnrollments,
        courses,
        searchQuery,
      ]
    );

  const filteredCompleted =
    useMemo(
      () =>
        completedEnrollments.filter(
          (enrollment) => {
            const course =
              getCourse(
                enrollment.course_id
              );

            return (
              course &&
              matchesSearch(course)
            );
          }
        ),
      [
        completedEnrollments,
        courses,
        searchQuery,
      ]
    );

  const filteredExplore =
    useMemo(
      () =>
        exploreCourses.filter(
          matchesSearch
        ),
      [
        exploreCourses,
        searchQuery,
      ]
    );

  const totalSearchResults =
    filteredActive.length +
    filteredCompleted.length +
    filteredExplore.length;

  function runSearch() {
    if (
      !searchQuery.trim()
    ) {
      scrollTo(
        "explore-courses"
      );
      return;
    }

    if (
      filteredActive.length > 0
    ) {
      scrollTo("my-learning");
      return;
    }

    if (
      filteredCompleted.length >
      0
    ) {
      scrollTo(
        "completed-courses"
      );
      return;
    }

    scrollTo(
      "explore-courses"
    );
  }

  function continueLearning() {
    if (
      activeEnrollments.length >
      0
    ) {
      openCourse(
        activeEnrollments[0]
          .course_id
      );
      return;
    }

    if (
      exploreCourses.length > 0
    ) {
      scrollTo(
        "explore-courses"
      );
      return;
    }

    if (
      completedEnrollments.length >
      0
    ) {
      openCourse(
        completedEnrollments[0]
          .course_id
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020817] text-white">

        <div className="text-center">

          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading your dashboard...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#020817]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[82px] max-w-[1600px] items-center justify-between px-5 sm:px-8">

          {/* LOGO */}
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-bold shadow-[0_0_30px_rgba(37,99,235,.45)]">
              S
            </div>

            <div className="text-left">

              <p className="font-bold">
                SKILLX
              </p>

              <p className="text-xs text-slate-500">
                Student Portal
              </p>

            </div>

          </button>

          {/* NAV */}
          <nav className="hidden items-center gap-10 lg:flex">

            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior:
                    "smooth",
                })
              }
              className="relative text-sm font-semibold text-white"
            >
              Dashboard

              <span className="absolute -bottom-[31px] left-0 h-[2px] w-full bg-blue-500" />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollTo(
                  "my-learning"
                )
              }
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              My Learning
            </button>

            <button
              type="button"
              onClick={() =>
                scrollTo(
                  "explore-courses"
                )
              }
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Explore
            </button>

          </nav>

          {/* RIGHT NAV */}
          <div className="flex items-center gap-3">

            {/* SEARCH */}
            <div className="relative hidden xl:block">

              <div className="flex w-[300px] items-center gap-3 rounded-xl border border-white/[0.09] bg-[#0b1528] px-4 py-2.5 transition focus-within:border-blue-500/40">

                <SearchIcon />

                <input
                  type="text"
                  value={
                    searchQuery
                  }
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      runSearch();
                    }
                  }}
                  placeholder="Search courses, lessons..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery(
                        ""
                      )
                    }
                    className="text-xs text-slate-500 hover:text-white"
                  >
                    ✕
                  </button>
                )}

              </div>

              {searchQuery && (
                <div className="absolute left-0 top-[50px] z-50 w-full rounded-xl border border-white/[0.09] bg-[#091523] px-4 py-3 text-xs shadow-2xl">

                  {totalSearchResults >
                  0 ? (
                    <span className="text-slate-400">
                      {
                        totalSearchResults
                      }{" "}
                      course result
                      {totalSearchResults ===
                      1
                        ? ""
                        : "s"}{" "}
                      found
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      No matching courses
                    </span>
                  )}

                </div>
              )}

            </div>

            {/* NOTIFICATION */}
            <div className="relative">

              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(
                    (current) =>
                      !current
                  );

                  setProfileMenuOpen(
                    false
                  );
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >

                <BellIcon />

                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#020817] bg-red-500" />

              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-14 z-50 w-[320px] rounded-2xl border border-white/[0.09] bg-[#091523] p-4 shadow-2xl">

                  <div className="flex items-center justify-between">

                    <h3 className="font-semibold">
                      Notifications
                    </h3>

                    <span className="text-xs text-blue-400">
                      SKILLX
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(
                        false
                      );

                      scrollTo(
                        "my-learning"
                      );
                    }}
                    className="mt-4 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-left hover:bg-white/[0.05]"
                  >

                    <p className="text-sm font-medium">
                      {
                        activeEnrollments.length
                      }{" "}
                      course
                      {activeEnrollments.length ===
                      1
                        ? ""
                        : "s"}{" "}
                      in progress
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Continue your
                      learning journey.
                    </p>

                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(
                        false
                      );

                      if (
                        completedEnrollments.length >
                        0
                      ) {
                        scrollTo(
                          "completed-courses"
                        );
                      }
                    }}
                    className="mt-2 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-left hover:bg-white/[0.05]"
                  >

                    <p className="text-sm font-medium">
                      {
                        completedEnrollments.length
                      }{" "}
                      completed
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      View your completed
                      courses.
                    </p>

                  </button>

                </div>
              )}

            </div>

            {/* PROFILE */}
            <div className="relative">

              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(
                    (current) =>
                      !current
                  );

                  setNotificationsOpen(
                    false
                  );
                }}
                className="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-white/[0.04]"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-slate-700 font-semibold shadow-[0_0_24px_rgba(99,102,241,.25)]">
                  {name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="hidden text-left sm:block">

                  <p className="text-sm font-semibold">
                    {name}
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Student
                  </p>

                </div>

                <span className="hidden text-xs text-slate-500 sm:block">
                  ▾
                </span>

              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-14 z-50 w-[260px] rounded-2xl border border-white/[0.09] bg-[#091523] p-4 shadow-2xl">

                  <p className="font-semibold">
                    {name}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {email}
                  </p>

                  <div className="my-4 border-t border-white/[0.07]" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(
                        false
                      );

                      setModal(
                        "profile"
                      );
                    }}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.05]"
                  >
                    Profile Settings
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

      </header>

      {/* MAIN PAGE */}
      <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8">

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">

          {/* LEFT */}
          <div className="min-w-0 space-y-6">

            {/* HERO */}
            <section className="relative overflow-hidden rounded-[32px] border border-blue-500/20 bg-gradient-to-br from-[#0d1b31] via-[#07162c] to-[#05101e] p-8 shadow-[0_0_60px_rgba(37,99,235,.12)]">

              <div className="absolute -right-12 -top-12 h-80 w-80 rounded-full bg-blue-600/20 blur-[100px]" />

              <div className="absolute -bottom-24 right-44 h-64 w-64 rounded-full bg-violet-600/20 blur-[90px]" />

              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
                    Student Dashboard
                  </p>

                  <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">

                    Welcome back,{" "}

                    <span className="text-blue-400">
                      {name}
                    </span>{" "}

                    👋

                  </h1>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                    Keep learning. Keep
                    growing. Your future
                    skills start here.
                  </p>

                  <div className="mt-6 inline-flex rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-slate-300">

                    <span className="mr-3 text-blue-400">
                      ❝
                    </span>

                    Small steps every day
                    lead to big results.

                  </div>

                  <div className="mt-7 flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={
                        continueLearning
                      }
                      className="rounded-xl bg-blue-600 px-6 py-3 font-semibold shadow-[0_0_30px_rgba(37,99,235,.3)] transition hover:bg-blue-500"
                    >
                      Continue Learning →
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scrollTo(
                          "explore-courses"
                        )
                      }
                      className="rounded-xl border border-white/[0.1] bg-white/[0.02] px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/[0.05]"
                    >
                      Explore Courses
                    </button>

                  </div>

                </div>

                <div className="relative flex h-[270px] items-center justify-center">

                  <HeroLearningArt />

                </div>

              </div>

            </section>

            {/* STATS */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                icon={<BookIcon />}
                value={
                  enrollments.length
                }
                label="Enrolled Courses"
                helper="Courses in your library"
                glow="blue"
              />

              <StatCard
                icon={<PlayIcon />}
                value={
                  activeEnrollments.length
                }
                label="In Progress"
                helper="Continue where you left off"
                glow="purple"
              />

              <StatCard
                icon={<CheckIcon />}
                value={
                  completedEnrollments.length
                }
                label="Completed"
                helper="Courses successfully completed"
                glow="green"
              />

              <StatCard
                icon={<LayersIcon />}
                value={
                  totalAvailableLessons
                }
                label="Available Lessons"
                helper="Published learning content"
                glow="orange"
              />

            </section>

            {/* SEARCH MOBILE */}
            <section className="xl:hidden">

              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#091523] p-4">

                <SearchIcon />

                <input
                  type="text"
                  value={
                    searchQuery
                  }
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search courses..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery(
                        ""
                      )
                    }
                  >
                    ✕
                  </button>
                )}

              </div>

            </section>

            {/* MY LEARNING */}
            <section
              id="my-learning"
              className="scroll-mt-28 rounded-[30px] border border-white/[0.08] bg-gradient-to-b from-[#0b1728] to-[#07111e] p-7"
            >

              <p className="text-sm font-semibold text-blue-400">
                My Learning
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Continue Learning
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pick up where you left
                off and keep making
                progress.
              </p>

              {filteredActive.length ===
              0 ? (

                <EmptyState
                  text={
                    searchQuery
                      ? "No active courses match your search."
                      : "No active courses right now."
                  }
                />

              ) : (

                <div className="mt-6 grid gap-5 lg:grid-cols-2">

                  {filteredActive.map(
                    (
                      enrollment,
                      index
                    ) => {
                      const course =
                        getCourse(
                          enrollment.course_id
                        );

                      if (!course) {
                        return null;
                      }

                      return (
                        <LearningCard
                          key={
                            enrollment.id
                          }
                          course={
                            course
                          }
                          progress={Math.min(
                            100,
                            Math.max(
                              0,
                              Number(
                                enrollment.progress
                              ) ||
                                0
                            )
                          )}
                          lessonCount={
                            lessonCounts[
                              course.id
                            ] || 0
                          }
                          visual={
                            index % 2 ===
                            0
                              ? "web"
                              : "tech"
                          }
                          onOpen={() =>
                            openCourse(
                              course.id
                            )
                          }
                        />
                      );
                    }
                  )}

                </div>

              )}

            </section>

            {/* COMPLETED */}
            {completedEnrollments.length >
              0 && (

              <section
                id="completed-courses"
                className="scroll-mt-28 rounded-[30px] border border-emerald-500/15 bg-gradient-to-br from-[#071b1d] via-[#071823] to-[#07111e] p-7"
              >

                <p className="text-sm font-semibold text-emerald-400">
                  Achievements
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Completed Courses
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Courses you have
                  successfully completed.
                </p>

                {filteredCompleted.length ===
                0 ? (

                  <EmptyState text="No completed courses match your search." />

                ) : (

                  <div className="mt-6 grid gap-5 lg:grid-cols-2">

                    {filteredCompleted.map(
                      (
                        enrollment
                      ) => {
                        const course =
                          getCourse(
                            enrollment.course_id
                          );

                        if (!course) {
                          return null;
                        }

                        return (
                          <CompletedCard
                            key={
                              enrollment.id
                            }
                            course={
                              course
                            }
                            lessonCount={
                              lessonCounts[
                                course
                                  .id
                              ] || 0
                            }
                            onOpen={() =>
                              openCourse(
                                course.id
                              )
                            }
                          />
                        );
                      }
                    )}

                  </div>

                )}

              </section>

            )}

            {/* EXPLORE */}
            <section
              id="explore-courses"
              className="scroll-mt-28 rounded-[30px] border border-white/[0.08] bg-gradient-to-b from-[#0a1627] to-[#07111e] p-7"
            >

              <p className="text-sm font-semibold text-blue-400">
                Discover
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Explore Courses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Discover new courses
                and expand your skills.
              </p>

              {filteredExplore.length ===
              0 ? (

                <EmptyState
                  text={
                    searchQuery
                      ? "No available courses match your search."
                      : "No new courses available right now."
                  }
                />

              ) : (

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                  {filteredExplore.map(
                    (
                      course,
                      index
                    ) => (

                      <ExploreCard
                        key={
                          course.id
                        }
                        course={
                          course
                        }
                        lessonCount={
                          lessonCounts[
                            course.id
                          ] || 0
                        }
                        index={
                          index
                        }
                        onOpen={() =>
                          openCourse(
                            course.id
                          )
                        }
                      />

                    )
                  )}

                </div>

              )}

            </section>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">

            {/* PROFILE */}
            <section className="rounded-[30px] border border-white/[0.09] bg-[#091523] p-6">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-slate-700 text-xl font-bold shadow-[0_0_30px_rgba(99,102,241,.3)]">
                    {name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <p className="text-lg font-semibold">
                      {name}
                    </p>

                    <p className="text-sm text-slate-500">
                      Learner
                    </p>

                  </div>

                </div>

                <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
                  Keep Going 🚀
                </span>

              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">

                <MiniStat
                  value={
                    enrollments.length
                  }
                  label="Enrolled"
                />

                <MiniStat
                  value={
                    activeEnrollments.length
                  }
                  label="Learning"
                />

                <MiniStat
                  value={
                    completedEnrollments.length
                  }
                  label="Completed"
                />

              </div>

              <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-center text-sm text-slate-400">
                “Discipline today,
                success tomorrow.”
              </div>

            </section>

            {/* STREAK */}
            <section className="rounded-[30px] border border-white/[0.09] bg-[#091523] p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl">
                  🔥
                </div>

                <div>

                  <h3 className="font-bold">
                    Learning Streak
                  </h3>

                  <p className="text-sm text-slate-500">
                    Streak tracking
                    coming soon.
                  </p>

                </div>

              </div>

              <div className="mt-6 grid grid-cols-7 gap-2 text-center">

                {[
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                  "Sun",
                ].map(
                  (
                    day,
                    index
                  ) => (

                    <div
                      key={day}
                    >

                      <div
                        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${
                          index === 2
                            ? "bg-blue-600 shadow-[0_0_25px_rgba(37,99,235,.55)]"
                            : "bg-white/[0.04]"
                        }`}
                      >
                        {index ===
                        2
                          ? "•"
                          : ""}
                      </div>

                      <p
                        className={`mt-2 text-[10px] ${
                          index ===
                          2
                            ? "text-blue-400"
                            : "text-slate-600"
                        }`}
                      >
                        {day}
                      </p>

                    </div>

                  )
                )}

              </div>

            </section>

            {/* QUICK ACTIONS */}
            <section className="rounded-[30px] border border-white/[0.09] bg-[#091523] p-6">

              <h3 className="text-xl font-bold">
                Quick Actions
              </h3>

              <div className="mt-5 space-y-3">

                <QuickAction
                  icon={<SearchIcon />}
                  title="Browse Courses"
                  subtitle="Explore new skills"
                  tone="blue"
                  onClick={() =>
                    scrollTo(
                      "explore-courses"
                    )
                  }
                />

                <QuickAction
                  icon={<AwardIcon />}
                  title="Certificates"
                  subtitle="Your achievements"
                  tone="purple"
                  onClick={() => {
                    if (
                      completedEnrollments.length >
                      0
                    ) {
                      scrollTo(
                        "completed-courses"
                      );
                    } else {
                      setModal(
                        "certificates"
                      );
                    }
                  }}
                />

                <QuickAction
                  icon={<UserIcon />}
                  title="Profile Settings"
                  subtitle="Manage your account"
                  tone="green"
                  onClick={() =>
                    setModal(
                      "profile"
                    )
                  }
                />

                <QuickAction
                  icon={<HelpIcon />}
                  title="Help & Support"
                  subtitle="Get assistance"
                  tone="orange"
                  onClick={() =>
                    setModal(
                      "help"
                    )
                  }
                />

              </div>

            </section>

            {/* PREMIUM */}
            <section className="overflow-hidden rounded-[30px] border border-violet-500/30 bg-gradient-to-br from-[#311677] via-[#281069] to-[#18094a] p-6 shadow-[0_0_45px_rgba(124,58,237,.18)]">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">

                  <CrownIcon />

                </div>

                <div>

                  <h3 className="text-lg font-bold">
                    Upgrade Your
                    Learning
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-violet-200/70">
                    Explore future
                    premium learning
                    features.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setModal(
                    "premium"
                  )
                }
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-3 font-semibold shadow-[0_0_30px_rgba(139,92,246,.25)] transition hover:brightness-110"
              >
                View Premium →
              </button>

            </section>

            {/* QUOTE */}
            <section className="rounded-[30px] border border-white/[0.09] bg-[#091523] p-6">

              <div className="text-3xl text-blue-500">
                ❝
              </div>

              <p className="mt-4 text-center text-base leading-7 text-slate-300">
                “The expert in
                anything was once a
                beginner.”
              </p>

              <p className="mt-3 text-right text-sm text-slate-500">
                — Helen Hayes
              </p>

            </section>

          </aside>

        </div>

        {/* BOTTOM */}
        <section className="relative mt-7 overflow-hidden rounded-[30px] border border-blue-500/20 bg-gradient-to-r from-[#0b1830] via-[#0c1b36] to-[#06111f] p-7">

          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-600/15 to-transparent" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">

                <TrophyIcon />

              </div>

              <div>

                <h3 className="text-xl font-bold">
                  Keep Going,{" "}
                  {name}!
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Keep learning and
                  building new skills.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                scrollTo(
                  "explore-courses"
                )
              }
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Explore All Courses →
            </button>

          </div>

        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            ✕ {error}
          </div>
        )}

      </div>

      {/* MODAL */}
      {modal && (
        <Modal
          type={modal}
          name={name}
          email={email}
          completedCount={
            completedEnrollments.length
          }
          onClose={() =>
            setModal(null)
          }
          onLogout={logout}
        />
      )}

    </main>
  );
}

/* ==============================
   COMPONENTS
============================== */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-white/[0.1] p-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  helper,
  glow,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  helper: string;
  glow:
    | "blue"
    | "purple"
    | "green"
    | "orange";
}) {
  const map = {
    blue:
      "from-blue-500 to-blue-700 shadow-blue-500/20",
    purple:
      "from-violet-500 to-purple-700 shadow-violet-500/20",
    green:
      "from-emerald-400 to-emerald-700 shadow-emerald-500/20",
    orange:
      "from-orange-400 to-amber-600 shadow-orange-500/20",
  };

  return (
    <div className="rounded-[25px] border border-white/[0.08] bg-[#0a1627] p-5 transition hover:-translate-y-1 hover:border-blue-500/25">

      <div className="flex items-center gap-4">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${map[glow]} shadow-lg`}
        >
          {icon}
        </div>

        <div>

          <p className="text-2xl font-bold">
            {value}
          </p>

          <p className="text-sm text-slate-300">
            {label}
          </p>

        </div>

      </div>

      <p className="mt-4 text-xs text-slate-500">
        {helper}
      </p>

    </div>
  );
}

function MiniStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-center">

      <p className="text-xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>

    </div>
  );
}

function LearningCard({
  course,
  progress,
  lessonCount,
  visual,
  onOpen,
}: {
  course: Course;
  progress: number;
  lessonCount: number;
  visual: "web" | "tech";
  onOpen: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[25px] border border-white/[0.08] bg-[#0b1728] transition hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_0_38px_rgba(37,99,235,.08)]">

      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#0a1b3c] via-[#15172f] to-[#20124a]">

        <CourseVisual
          type={visual}
        />

        <span className="absolute left-4 top-4 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
          {course.category ||
            "Course"}
        </span>

        <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold">
          In Progress
        </span>

      </div>

      <div className="p-5">

        <h3 className="text-xl font-bold">
          {course.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {course.description ||
            "Continue building practical skills."}
        </p>

        <div className="mt-5">

          <div className="flex justify-between text-xs">

            <span className="text-slate-500">
              Course progress
            </span>

            <span className="font-semibold">
              {progress}%
            </span>

          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        <div className="mt-5 flex gap-4 text-xs text-slate-500">

          <span>
            {capitalize(
              course.level ||
                "beginner"
            )}
          </span>

          <span>
            {lessonCount} lesson
            {lessonCount === 1
              ? ""
              : "s"}
          </span>

          {course.estimated_hours !=
            null && (
            <span>
              {course.estimated_hours}h
            </span>
          )}

        </div>

        <button
          type="button"
          onClick={onOpen}
          className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold shadow-[0_0_25px_rgba(37,99,235,.2)] transition hover:bg-blue-500"
        >
          Continue Learning →
        </button>

      </div>

    </article>
  );
}

function CompletedCard({
  course,
  lessonCount,
  onOpen,
}: {
  course: Course;
  lessonCount: number;
  onOpen: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[25px] border border-emerald-500/20 bg-[#071a1c]">

      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-emerald-950 via-[#091525] to-blue-950">

        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-5xl text-emerald-400 shadow-[0_0_45px_rgba(16,185,129,.15)]">
          ✓
        </div>

        <span className="absolute right-4 top-4 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
          Completed
        </span>

      </div>

      <div className="p-5">

        <p className="text-xs font-semibold uppercase text-emerald-400">
          {course.category ||
            "Course"}
        </p>

        <h3 className="mt-2 text-xl font-bold">
          {course.title}
        </h3>

        <div className="mt-5 h-2 rounded-full bg-slate-800">

          <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" />

        </div>

        <p className="mt-3 text-xs text-slate-500">
          {lessonCount} lesson
          {lessonCount === 1
            ? ""
            : "s"}{" "}
          completed • 100%
        </p>

        <button
          type="button"
          onClick={onOpen}
          className="mt-5 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
        >
          Review Course →
        </button>

      </div>

    </article>
  );
}

function ExploreCard({
  course,
  lessonCount,
  index,
  onOpen,
}: {
  course: Course;
  lessonCount: number;
  index: number;
  onOpen: () => void;
}) {
  const types = [
    "communication",
    "code",
    "creative",
  ] as const;

  return (
    <article className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0b1728] transition hover:-translate-y-1 hover:border-blue-500/30">

      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-[#0b1b3c] via-[#16182e] to-[#221344]">

        <ExploreIllustration
          type={
            types[
              index %
                types.length
            ]
          }
        />

        <span className="absolute left-4 top-4 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
          {course.access_type ===
          "free"
            ? "FREE"
            : "PAID"}
        </span>

      </div>

      <div className="p-5">

        <h3 className="font-bold">
          {course.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {course.description ||
            "Explore this course and build new skills."}
        </p>

        <div className="mt-4 flex gap-4 text-xs text-slate-500">

          <span>
            {capitalize(
              course.level ||
                "beginner"
            )}
          </span>

          <span>
            {lessonCount} lesson
            {lessonCount === 1
              ? ""
              : "s"}
          </span>

        </div>

        <button
          type="button"
          onClick={onOpen}
          className="mt-5 w-full rounded-xl border border-blue-500/50 px-4 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/10"
        >
          Explore Course →
        </button>

      </div>

    </article>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  tone,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone:
    | "blue"
    | "purple"
    | "green"
    | "orange";
  onClick: () => void;
}) {
  const map = {
    blue:
      "bg-blue-500/15 text-blue-400",
    purple:
      "bg-violet-500/15 text-violet-400",
    green:
      "bg-emerald-500/15 text-emerald-400",
    orange:
      "bg-orange-500/15 text-orange-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-blue-500/20 hover:bg-white/[0.05]"
    >

      <div className="flex items-center gap-3">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${map[tone]}`}
        >
          {icon}
        </div>

        <div>

          <p className="text-sm font-semibold">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>

        </div>

      </div>

      <span className="text-slate-500">
        ›
      </span>

    </button>
  );
}

/* MODAL */

function Modal({
  type,
  name,
  email,
  completedCount,
  onClose,
  onLogout,
}: {
  type: Exclude<
    ModalType,
    null
  >;
  name: string;
  email: string;
  completedCount: number;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-[28px] border border-white/[0.1] bg-[#091523] p-7 shadow-2xl">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-bold">
            {type === "profile" &&
              "Profile Settings"}

            {type === "help" &&
              "Help & Support"}

            {type ===
              "certificates" &&
              "Certificates"}

            {type ===
              "premium" &&
              "Premium Learning"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-slate-400 hover:text-white"
          >
            ✕
          </button>

        </div>

        {type === "profile" && (
          <div className="mt-6">

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

              <p className="text-xs text-slate-500">
                Full Name
              </p>

              <p className="mt-1 font-semibold">
                {name}
              </p>

              <p className="mt-5 text-xs text-slate-500">
                Email
              </p>

              <p className="mt-1 break-all text-sm">
                {email}
              </p>

              <p className="mt-5 text-xs text-slate-500">
                Role
              </p>

              <p className="mt-1 text-sm">
                Student
              </p>

            </div>

            <button
              type="button"
              onClick={onLogout}
              className="mt-5 w-full rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-semibold text-red-400 hover:bg-red-500/15"
            >
              Logout
            </button>

          </div>
        )}

        {type === "help" && (
          <div className="mt-6">

            <p className="text-sm leading-7 text-slate-400">
              Need help with your
              account, course or lesson?
              Support options will be
              connected here before
              launch.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
            >
              Got It
            </button>

          </div>
        )}

        {type ===
          "certificates" && (
          <div className="mt-6 text-center">

            <div className="text-5xl">
              🏆
            </div>

            <h3 className="mt-4 text-lg font-bold">
              Certificates
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              You currently have{" "}
              {completedCount}{" "}
              completed course
              {completedCount === 1
                ? ""
                : "s"}.
              Certificate generation
              will be added in the
              certificate phase.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
            >
              Close
            </button>

          </div>
        )}

        {type === "premium" && (
          <div className="mt-6 text-center">

            <div className="text-5xl">
              👑
            </div>

            <h3 className="mt-4 text-lg font-bold">
              Premium Features
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Paid courses, advanced
              certificates and premium
              learning features will be
              connected after the core
              launch system is complete.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
            >
              Close
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

/* ILLUSTRATIONS */

function HeroLearningArt() {
  return (
    <svg
      viewBox="0 0 340 260"
      className="w-[330px] max-w-full"
    >
      <defs>
        <linearGradient
          id="hero-cap"
          x1="0"
          x2="1"
        >
          <stop
            offset="0"
            stopColor="#2563eb"
          />

          <stop
            offset="1"
            stopColor="#7c3aed"
          />
        </linearGradient>
      </defs>

      <ellipse
        cx="180"
        cy="176"
        rx="110"
        ry="32"
        fill="none"
        stroke="#2563eb"
        strokeWidth="3"
        opacity=".5"
      />

      <path
        d="M95 96 180 58l85 38-85 38Z"
        fill="url(#hero-cap)"
      />

      <path
        d="M130 112v42c32 20 70 20 100 0v-42"
        fill="#111c46"
        stroke="#5b6df8"
        strokeWidth="3"
      />

      <path
        d="M264 96v55"
        stroke="#c084fc"
        strokeWidth="4"
      />

      <circle
        cx="264"
        cy="156"
        r="7"
        fill="#c084fc"
      />

      <rect
        x="55"
        y="120"
        width="70"
        height="38"
        rx="10"
        fill="#10234e"
        stroke="#2563eb"
      />

      <text
        x="90"
        y="144"
        textAnchor="middle"
        fill="#93c5fd"
        fontSize="14"
      >
        Learn
      </text>

      <rect
        x="226"
        y="120"
        width="76"
        height="38"
        rx="10"
        fill="#27134f"
        stroke="#8b5cf6"
      />

      <text
        x="264"
        y="144"
        textAnchor="middle"
        fill="#c4b5fd"
        fontSize="14"
      >
        Practice
      </text>

      <rect
        x="124"
        y="190"
        width="105"
        height="38"
        rx="10"
        fill="#063f36"
        stroke="#10b981"
      />

      <text
        x="176"
        y="214"
        textAnchor="middle"
        fill="#6ee7b7"
        fontSize="14"
      >
        Grow
      </text>
    </svg>
  );
}

function CourseVisual({
  type,
}: {
  type: "web" | "tech";
}) {
  if (type === "web") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">

        <svg
          viewBox="0 0 260 140"
          className="w-[240px]"
        >

          <rect
            x="35"
            y="20"
            width="190"
            height="105"
            rx="13"
            fill="#07111f"
            stroke="#2563eb"
          />

          <rect
            x="48"
            y="34"
            width="165"
            height="13"
            rx="4"
            fill="#172554"
          />

          <circle
            cx="56"
            cy="40"
            r="3"
            fill="#f87171"
          />

          <circle
            cx="66"
            cy="40"
            r="3"
            fill="#fbbf24"
          />

          <circle
            cx="76"
            cy="40"
            r="3"
            fill="#34d399"
          />

          <rect
            x="50"
            y="59"
            width="78"
            height="50"
            rx="8"
            fill="#102b58"
          />

          <rect
            x="138"
            y="59"
            width="70"
            height="10"
            rx="5"
            fill="#2563eb"
          />

          <rect
            x="138"
            y="78"
            width="58"
            height="7"
            rx="3"
            fill="#334155"
          />

          <rect
            x="138"
            y="93"
            width="65"
            height="7"
            rx="3"
            fill="#334155"
          />

        </svg>

      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">

      <div>

        <div className="flex h-24 w-40 items-center justify-center rounded-t-2xl border-4 border-slate-700 bg-gradient-to-br from-blue-600 to-violet-600 text-4xl font-bold shadow-[0_0_40px_rgba(124,58,237,.3)]">
          {"</>"}
        </div>

        <div className="h-3 w-44 -translate-x-2 rounded-b-xl bg-slate-600" />

      </div>

    </div>
  );
}

function ExploreIllustration({
  type,
}: {
  type:
    | "communication"
    | "code"
    | "creative";
}) {
  if (type === "communication") {
    return (
      <svg
        viewBox="0 0 180 100"
        className="w-[160px]"
      >

        <circle
          cx="60"
          cy="43"
          r="18"
          fill="#2563eb"
        />

        <circle
          cx="116"
          cy="43"
          r="18"
          fill="#7c3aed"
        />

        <path
          d="M31 87c4-23 17-31 29-31s25 8 29 31"
          fill="#1e40af"
        />

        <path
          d="M87 87c4-23 17-31 29-31s25 8 29 31"
          fill="#5b21b6"
        />

        <rect
          x="72"
          y="9"
          width="38"
          height="20"
          rx="10"
          fill="#06b6d4"
        />

      </svg>
    );
  }

  if (type === "code") {
    return (
      <div className="rounded-2xl border border-blue-500/30 bg-[#07111f] px-10 py-6 text-4xl font-bold text-blue-400 shadow-[0_0_35px_rgba(37,99,235,.2)]">
        {"</>"}
      </div>
    );
  }

  return (
    <div className="text-6xl">
      🎨
    </div>
  );
}

/* ICONS */

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

      <path d="M10 21h4" />
    </svg>
  );
}

function BookIcon() {
  return (
    <span className="text-xl">
      ▣
    </span>
  );
}

function PlayIcon() {
  return (
    <span className="text-lg">
      ▶
    </span>
  );
}

function CheckIcon() {
  return (
    <span className="text-xl">
      ✓
    </span>
  );
}

function LayersIcon() {
  return (
    <span className="text-xl">
      ◫
    </span>
  );
}

function AwardIcon() {
  return (
    <span className="text-xl">
      ◇
    </span>
  );
}

function UserIcon() {
  return (
    <span className="text-xl">
      ♙
    </span>
  );
}

function HelpIcon() {
  return (
    <span className="text-xl">
      ?
    </span>
  );
}

function CrownIcon() {
  return (
    <span className="text-2xl">
      👑
    </span>
  );
}

function TrophyIcon() {
  return (
    <span className="text-3xl">
      🏆
    </span>
  );
}

function capitalize(
  value: string
) {
  return (
    value
      .charAt(0)
      .toUpperCase() +
    value.slice(1)
  );
}