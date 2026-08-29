export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b border-slate-200 px-8 py-5">
        <div className="text-2xl font-bold tracking-tight">
          SKILL<span className="text-blue-600">X</span>
        </div>

        <div className="hidden gap-8 md:flex">
          <a href="#" className="hover:text-blue-600">Home</a>
          <a href="#skills" className="hover:text-blue-600">Explore Skills</a>
          <a href="#teachers" className="hover:text-blue-600">For Teachers</a>
          <a href="#about" className="hover:text-blue-600">About</a>
        </div>

        <div className="flex gap-3">
          <button className="rounded-lg px-4 py-2 hover:bg-slate-100">
            Login
          </button>

          <button className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700">
            Get Started
          </button>
        </div>
      </nav>


      {/* HERO */}
      <section className="px-8 py-24 text-center">

        <div className="mx-auto max-w-4xl">

          <div className="mb-6 inline-block rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Learn • Prove • Grow
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Turn Your Skills
            <br />
            Into Your Future.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Learn practical skills, connect with great teachers,
            prove what you can do, and build your path toward
            new opportunities.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

            <button className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg hover:bg-blue-700">
              Start Learning
            </button>

            <button className="rounded-xl border border-slate-300 px-8 py-4 font-semibold hover:bg-slate-50">
              Become a Teacher
            </button>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section className="bg-slate-50 px-8 py-20">

        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              How SKILLX Works
            </h2>

            <p className="mt-4 text-slate-600">
              A simple path from learning to real skills.
            </p>
          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-4xl">🎓</div>

              <h3 className="mt-5 text-xl font-bold">
                Learn
              </h3>

              <p className="mt-3 text-slate-600">
                Learn practical skills through structured courses
                and experienced teachers.
              </p>
            </div>


            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-4xl">🧪</div>

              <h3 className="mt-5 text-xl font-bold">
                Practice & Prove
              </h3>

              <p className="mt-3 text-slate-600">
                Complete quizzes, assignments and assessments
                to demonstrate your abilities.
              </p>
            </div>


            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-4xl">🚀</div>

              <h3 className="mt-5 text-xl font-bold">
                Grow
              </h3>

              <p className="mt-3 text-slate-600">
                Build your skill profile, achievements and
                future opportunities.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* STUDENTS */}
      <section className="px-8 py-20">

        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">

          <div>

            <p className="font-semibold text-blue-600">
              FOR STUDENTS
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              Your Skills.
              <br />
              Your Progress.
              <br />
              Your Future.
            </h2>

            <p className="mt-6 leading-7 text-slate-600">
              Learn at your own pace, practice what you learn,
              track your progress and build a profile that
              demonstrates your skills.
            </p>

            <button className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
              Explore Skills
            </button>

          </div>


          <div className="rounded-3xl bg-slate-100 p-8">

            <h3 className="text-xl font-bold">
              Student Skill Profile
            </h3>

            <div className="mt-6 space-y-4">

              <div className="rounded-xl bg-white p-4">
                ✓ English Communication
              </div>

              <div className="rounded-xl bg-white p-4">
                ✓ Graphic Design
              </div>

              <div className="rounded-xl bg-white p-4">
                ✓ Digital Marketing
              </div>

              <div className="rounded-xl bg-white p-4">
                🏆 5 Verified Skills
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* TEACHERS */}
      <section id="teachers" className="bg-slate-50 px-8 py-20">

        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">

          <div className="order-2 rounded-3xl bg-white p-8 shadow-sm md:order-1">

            <div className="space-y-4">

              <div className="rounded-xl bg-slate-50 p-4">
                📚 Create Courses
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                👨‍🎓 Teach Students
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                📝 Assess Skills
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                ⭐ Build Reputation
              </div>

            </div>

          </div>


          <div className="order-1 md:order-2">

            <p className="font-semibold text-blue-600">
              FOR TEACHERS
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              Your Knowledge
              <br />
              Can Make an Impact.
            </h2>

            <p className="mt-6 leading-7 text-slate-600">
              Create courses, teach students, share your expertise,
              mentor learners and build your professional reputation.
            </p>

            <button className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
              Start Teaching
            </button>

          </div>

        </div>

      </section>


      {/* SKILLS */}
      <section id="skills" className="px-8 py-20">

        <div className="mx-auto max-w-6xl text-center">

          <h2 className="text-3xl font-bold md:text-4xl">
            What Do You Want to Learn?
          </h2>

          <div className="mx-auto mt-8 max-w-2xl">

            <input
              type="text"
              placeholder="🔍 Search for a skill..."
              className="w-full rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-600"
            />

          </div>


          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">

            {[
              "English & Communication",
              "Programming",
              "Graphic Design",
              "Digital Marketing",
              "Business",
              "Mathematics",
              "Science",
              "Technology",
            ].map((skill) => (

              <button
                key={skill}
                className="rounded-xl border border-slate-200 p-5 text-left font-medium hover:border-blue-500 hover:bg-blue-50"
              >
                {skill}
              </button>

            ))}

          </div>

        </div>

      </section>


      {/* FINAL CTA */}
      <section className="bg-blue-600 px-8 py-20 text-center text-white">

        <h2 className="text-4xl font-bold">
          Start Your SKILLX Journey Today.
        </h2>

        <p className="mt-4 text-blue-100">
          Learn. Practice. Prove. Grow.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

          <button className="rounded-xl bg-white px-7 py-3 font-semibold text-blue-600 hover:bg-blue-50">
            I&apos;m a Student
          </button>

          <button className="rounded-xl border border-white px-7 py-3 font-semibold text-white hover:bg-blue-700">
            I&apos;m a Teacher
          </button>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-slate-200 px-8 py-10">

        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 md:flex-row">

          <div>
            <div className="text-2xl font-bold">
              SKILL<span className="text-blue-600">X</span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Learn • Prove • Grow
            </p>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 SKILLX. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}