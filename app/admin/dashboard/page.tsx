"use client";

import { useState } from "react";

type Teacher = {
  name: string;
  subject: string;
  qualification: string;
  experience: string;
};

type Course = {
  title: string;
  teacher: string;
  category: string;
  level: string;
};

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");

  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      name: "Ahmed Khan",
      subject: "English & Communication",
      qualification: "Master's",
      experience: "5 years",
    },
    {
      name: "Sara Ali",
      subject: "Programming",
      qualification: "Bachelor's",
      experience: "3 years",
    },
  ]);

  const [courses, setCourses] = useState<Course[]>([
    {
      title: "English Communication",
      teacher: "Ahmed Khan",
      category: "English & Communication",
      level: "Beginner",
    },
    {
      title: "Introduction to Programming",
      teacher: "Sara Ali",
      category: "Programming",
      level: "Intermediate",
    },
  ]);

  const approveTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const rejectTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const approveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const rejectCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* SIDEBAR */}
      <aside className="fixed hidden h-screen w-64 border-r border-slate-200 bg-white p-6 md:block">

        <div className="mb-10">
          <h1 className="text-2xl font-bold">
            SKILL<span className="text-blue-600">X</span>
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Admin Portal
          </p>
        </div>

        <nav className="space-y-2">

          {[
            "Dashboard",
            "Teacher Applications",
            "Course Approvals",
            "Students",
            "Teachers",
            "Courses",
            "Reports",
            "Settings",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                active === item
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item}
            </button>
          ))}

        </nav>

        <button className="absolute bottom-8 left-6 text-sm font-medium text-red-500">
          Logout
        </button>

      </aside>


      {/* MAIN */}
      <section className="md:ml-64">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 md:px-10">

          <div>
            <p className="text-sm text-slate-500">
              SKILLX Administration
            </p>

            <h2 className="text-xl font-bold">
              Admin Dashboard
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
            A
          </div>

        </header>


        <div className="p-6 md:p-10">

          {/* WELCOME */}
          <div className="rounded-3xl bg-blue-600 p-8 text-white">

            <p className="text-sm text-blue-100">
              Platform Management
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Welcome to SKILLX Admin 👋
            </h1>

            <p className="mt-4 max-w-2xl text-blue-100">
              Manage teachers, courses and students while keeping
              the learning platform organized and trustworthy.
            </p>

          </div>


          {/* STATISTICS */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Total Students"
              value="1,248"
            />

            <StatCard
              title="Total Teachers"
              value="86"
            />

            <StatCard
              title="Published Courses"
              value="142"
            />

            <StatCard
              title="Pending Reviews"
              value={teachers.length + courses.length}
            />

          </div>


          {/* TEACHER APPLICATIONS */}
          <section className="mt-10">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold">
                  Teacher Applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review teachers before giving them publishing access.
                </p>
              </div>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                {teachers.length} Pending
              </span>

            </div>


            <div className="mt-5 space-y-4">

              {teachers.length === 0 ? (

                <EmptyState text="No pending teacher applications." />

              ) : (

                teachers.map((teacher, index) => (

                  <div
                    key={index}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {teacher.name.charAt(0)}
                        </div>

                        <div>

                          <h3 className="font-bold">
                            {teacher.name}
                          </h3>

                          <p className="text-sm text-blue-600">
                            {teacher.subject}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {teacher.qualification} • {teacher.experience}
                          </p>

                        </div>

                      </div>


                      <div className="flex gap-3">

                        <button
                          onClick={() => approveTeacher(index)}
                          className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => rejectTeacher(index)}
                          className="rounded-xl bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                        >
                          Reject
                        </button>

                      </div>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>


          {/* COURSE APPROVALS */}
          <section className="mt-10">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold">
                  Course Approvals
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review courses before publishing them to students.
                </p>
              </div>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                {courses.length} Pending
              </span>

            </div>


            <div className="mt-5 space-y-4">

              {courses.length === 0 ? (

                <EmptyState text="No pending courses." />

              ) : (

                courses.map((course, index) => (

                  <div
                    key={index}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                      <div>

                        <p className="text-sm font-medium text-blue-600">
                          {course.category}
                        </p>

                        <h3 className="mt-1 text-xl font-bold">
                          {course.title}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          Teacher: {course.teacher}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Level: {course.level}
                        </p>

                      </div>


                      <div className="flex gap-3">

                        <button
                          onClick={() => approveCourse(index)}
                          className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => rejectCourse(index)}
                          className="rounded-xl bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                        >
                          Reject
                        </button>

                      </div>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>


          {/* PLATFORM OVERVIEW */}
          <section className="mt-10 grid gap-6 lg:grid-cols-2">

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                Platform Overview
              </h2>

              <div className="mt-6 space-y-5">

                <Overview
                  title="Student Growth"
                  value="+18%"
                />

                <Overview
                  title="Teacher Growth"
                  value="+12%"
                />

                <Overview
                  title="Course Completion"
                  value="76%"
                />

                <Overview
                  title="Average Rating"
                  value="4.7 ⭐"
                />

              </div>

            </div>


            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                Admin Responsibilities
              </h2>

              <div className="mt-5 space-y-3">

                <Responsibility text="Verify teacher applications" />

                <Responsibility text="Review submitted courses" />

                <Responsibility text="Monitor student activity" />

                <Responsibility text="Manage platform content" />

                <Responsibility text="Review reports and feedback" />

              </div>

            </div>

          </section>

        </div>

      </section>

    </main>
  );
}


/* STAT CARD */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}


/* EMPTY STATE */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

      <p className="text-slate-500">
        {text}
      </p>

    </div>
  );
}


/* OVERVIEW */

function Overview({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4">

      <span className="text-sm text-slate-500">
        {title}
      </span>

      <span className="font-bold">
        {value}
      </span>

    </div>
  );
}


/* RESPONSIBILITY */

function Responsibility({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">

      <span className="text-green-600">
        ✓
      </span>

      <span className="text-sm font-medium">
        {text}
      </span>

    </div>
  );
}