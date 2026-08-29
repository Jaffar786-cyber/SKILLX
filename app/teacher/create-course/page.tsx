"use client";

import { useState } from "react";

export default function CreateCourse() {
  const [submitted, setSubmitted] = useState(false);

  const [lessons, setLessons] = useState([
    {
      title: "",
      description: "",
    },
  ]);

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: "",
        description: "",
      },
    ]);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold">
              SKILL<span className="text-blue-600">X</span>
            </h1>

            <p className="text-sm text-slate-500">
              Teacher Portal
            </p>
          </div>

          <a
            href="/teacher/dashboard"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Dashboard
          </a>

        </div>
      </header>


      {/* CONTENT */}
      <div className="mx-auto max-w-4xl px-6 py-10">

        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Teacher Course Builder
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Create a New Course
          </h2>

          <p className="mt-2 text-slate-500">
            Create useful learning content that students can
            complete and build their skills with.
          </p>
        </div>


        {submitted ? (

          /* SUCCESS */
          <div className="rounded-2xl bg-white p-8 shadow-sm">

            <div className="rounded-xl bg-green-50 p-6">

              <h2 className="text-2xl font-bold text-green-700">
                Course Submitted Successfully! 🎉
              </h2>

              <p className="mt-3 text-sm text-green-700">
                Your course has been submitted to the SKILLX
                Admin team for review.
              </p>

              <div className="mt-5 rounded-xl bg-white p-5">

                <p className="text-sm text-slate-500">
                  Course Status
                </p>

                <p className="mt-1 font-semibold text-yellow-700">
                  🟡 Pending Admin Approval
                </p>

              </div>

              <a
                href="/teacher/dashboard"
                className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
              >
                Back to Dashboard
              </a>

            </div>

          </div>

        ) : (

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-8"
          >

            {/* COURSE INFORMATION */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">

              <h3 className="text-xl font-bold">
                1. Course Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Tell students what your course is about.
              </p>


              <div className="mt-6 space-y-5">

                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Course Title
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. English Communication for Beginners"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  />
                </div>


                {/* CATEGORY */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category
                  </label>

                  <select
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  >
                    <option value="">
                      Select category
                    </option>

                    <option>English & Communication</option>
                    <option>Programming</option>
                    <option>Graphic Design</option>
                    <option>Digital Marketing</option>
                    <option>Business</option>
                    <option>Mathematics</option>
                    <option>Science</option>
                    <option>Technology</option>
                    <option>Other</option>
                  </select>
                </div>


                {/* LEVEL */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Course Level
                  </label>

                  <select
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  >
                    <option value="">
                      Select level
                    </option>

                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>


                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Course Description
                  </label>

                  <textarea
                    required
                    rows={5}
                    placeholder="Explain what students will learn in this course..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  />
                </div>


                {/* DURATION */}
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Course Duration
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. 6 weeks"
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Estimated Hours
                    </label>

                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 20"
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    />
                  </div>

                </div>

              </div>

            </section>


            {/* LEARNING OUTCOMES */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">

              <h3 className="text-xl font-bold">
                2. Learning Outcomes
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                What will students be able to do after completing
                this course?
              </p>

              <div className="mt-6 space-y-4">

                <input
                  type="text"
                  placeholder="Learning outcome 1"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />

                <input
                  type="text"
                  placeholder="Learning outcome 2"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />

                <input
                  type="text"
                  placeholder="Learning outcome 3"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />

              </div>

            </section>


            {/* LESSONS */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-xl font-bold">
                    3. Course Lessons
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Organize your course into lessons.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addLesson}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  + Add Lesson
                </button>

              </div>


              <div className="mt-6 space-y-5">

                {lessons.map((lesson, index) => (

                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-5"
                  >

                    <div className="mb-4 flex items-center justify-between">

  <h4 className="font-bold">
    Lesson {index + 1}
  </h4>

  <button
    type="button"
    onClick={() => {
      setLessons(lessons.filter((_, i) => i !== index));
    }}
    disabled={lessons.length === 1}
    className="rounded-lg px-3 py-1 text-sm font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
  >
    Delete
  </button>

</div>


                    <div className="space-y-4">

                      <input
                        type="text"
                        placeholder="Lesson title"
                        required
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />

                      <textarea
                        rows={3}
                        placeholder="Lesson description"
                        required
                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />

                      <div className="grid gap-4 sm:grid-cols-2">

                        <select
                          required
                          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                        >
                          <option value="">
                            Lesson type
                          </option>

                          <option>Video</option>
                          <option>Article</option>
                          <option>Presentation</option>
                          <option>Live Class</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Duration e.g. 20 min"
                          required
                          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                        />

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </section>


            {/* ASSESSMENT */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">

              <h3 className="text-xl font-bold">
                4. Assessment
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add an assessment to measure student learning.
              </p>

              <div className="mt-6 space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Assessment Type
                  </label>

                  <select
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  >
                    <option value="">
                      Select assessment
                    </option>

                    <option>Quiz</option>
                    <option>Assignment</option>
                    <option>Project</option>
                    <option>Final Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Passing Score
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 70"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  />
                </div>

              </div>

            </section>


            {/* PRICING */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">

              <h3 className="text-xl font-bold">
                5. Course Access
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Choose how students will access your course.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <label className="cursor-pointer rounded-xl border border-slate-200 p-5 hover:border-blue-500">

                  <input
                    type="radio"
                    name="access"
                    value="free"
                    defaultChecked
                  />

                  <span className="ml-3 font-semibold">
                    Free Course
                  </span>

                  <p className="mt-2 text-sm text-slate-500">
                    Students can access the course for free.
                  </p>

                </label>


                <label className="cursor-pointer rounded-xl border border-slate-200 p-5 hover:border-blue-500">

                  <input
                    type="radio"
                    name="access"
                    value="paid"
                  />

                  <span className="ml-3 font-semibold">
                    Paid Course
                  </span>

                  <p className="mt-2 text-sm text-slate-500">
                    Paid courses can be monetized later.
                  </p>

                </label>

              </div>

            </section>


            {/* SUBMIT */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="rounded-xl bg-slate-50 p-5">

                <h3 className="font-bold">
                  Ready to submit?
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Your course will be reviewed by SKILLX Admin
                  before it becomes visible to students.
                </p>

              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700"
              >
                Submit Course for Admin Approval
              </button>

            </section>

          </form>

        )}

      </div>

    </main>
  );
}