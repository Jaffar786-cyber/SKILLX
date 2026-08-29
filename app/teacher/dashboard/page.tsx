"use client";

import { useState } from "react";

export default function TeacherDashboard() {
  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    "Dashboard",
    "My Courses",
    "Create Course",
    "Students",
    "Assignments",
    "Assessments",
    "Reviews",
    "Earnings",
    "My Profile",
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* SIDEBAR */}
      <aside className="fixed hidden h-screen w-64 border-r border-slate-200 bg-white p-6 md:block">

        <div className="mb-10">
          <h1 className="text-2xl font-bold">
            SKILL<span className="text-blue-600">X</span>
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Teacher Portal
          </p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
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

        {/* TOP BAR */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 md:px-10">

          <div>
            <p className="text-sm text-slate-500">
              Teacher Dashboard
            </p>

            <h2 className="text-xl font-bold">
              Welcome, Teacher 👋
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
            T
          </div>

        </header>


        <div className="p-6 md:p-10">

          {/* WELCOME */}
          <div className="rounded-3xl bg-blue-600 p-8 text-white">

            <p className="text-sm text-blue-100">
              Share your knowledge with SKILLX learners.
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Teach. Inspire. Grow.
            </h1>

            <p className="mt-4 max-w-xl text-blue-100">
              Create high-quality courses, teach students,
              assess their skills and build your teaching reputation.
            </p>

            <button
              onClick={() => setActive("Create Course")}
              className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-blue-600"
            >
              + Create New Course
            </button>

          </div>


          {/* STATS */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Total Students"
              value="124"
            />

            <StatCard
              title="Active Courses"
              value="6"
            />

            <StatCard
              title="Completed Courses"
              value="87"
            />

            <StatCard
              title="Average Rating"
              value="4.8 ⭐"
            />

          </div>


          {/* COURSES */}
          <section className="mt-10">

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                My Courses
              </h2>

              <button
                onClick={() => setActive("My Courses")}
                className="text-sm font-semibold text-blue-600"
              >
                View All
              </button>
            </div>


            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              <CourseCard
                title="English Communication"
                students={48}
                status="Published"
              />

              <CourseCard
                title="Professional Writing"
                students={31}
                status="Published"
              />

              <CourseCard
                title="Digital Skills"
                students={45}
                status="Pending Approval"
              />

            </div>

          </section>


          {/* LOWER SECTION */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">

            {/* RECENT STUDENTS */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                Recent Students
              </h2>

              <div className="mt-5 space-y-4">

                <Student
                  name="Ahmed Khan"
                  course="English Communication"
                />

                <Student
                  name="Sara Ali"
                  course="Professional Writing"
                />

                <Student
                  name="Usman Ahmed"
                  course="Digital Skills"
                />

              </div>

            </div>


            {/* RECENT ACTIVITY */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                Recent Activity
              </h2>

              <div className="mt-5 space-y-4">

                <Activity
                  icon="📝"
                  title="New assignment submitted"
                  text="Ahmed Khan submitted an assignment."
                />

                <Activity
                  icon="⭐"
                  title="New review received"
                  text="Your course received a 5-star review."
                />

                <Activity
                  icon="🎓"
                  title="Course completed"
                  text="Sara Ali completed your course."
                />

              </div>

            </div>

          </div>


          {/* TEACHER PROFILE */}
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

              <div>
                <p className="text-sm text-slate-500">
                  Teacher Profile
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Build Your Professional Reputation
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Complete your profile to help students understand
                  your expertise and experience.
                </p>
              </div>

              <button
                onClick={() => setActive("My Profile")}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
              >
                Complete Profile
              </button>

            </div>

          </div>

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
  value: string;
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


/* COURSE CARD */

function CourseCard({
  title,
  students,
  status,
}: {
  title: string;
  students: number;
  status: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-sm font-medium text-blue-600">
            SKILLX Course
          </p>

          <h3 className="mt-2 text-lg font-bold">
            {title}
          </h3>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
          {status}
        </span>

      </div>

      <div className="mt-6 flex items-center justify-between text-sm">

        <span className="text-slate-500">
          👨‍🎓 {students} students
        </span>

        <button className="font-semibold text-blue-600">
          Manage
        </button>

      </div>

    </div>
  );
}


/* STUDENT */

function Student({
  name,
  course,
}: {
  name: string;
  course: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
        {name.charAt(0)}
      </div>

      <div>
        <p className="font-semibold">
          {name}
        </p>

        <p className="text-sm text-slate-500">
          {course}
        </p>
      </div>

    </div>
  );
}


/* ACTIVITY */

function Activity({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl bg-slate-50 p-4">

      <div className="text-xl">
        {icon}
      </div>

      <div>
        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {text}
        </p>
      </div>

    </div>
  );
}