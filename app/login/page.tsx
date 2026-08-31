"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setMessage("Login successful! ✓");

    setTimeout(() => {
      if (profile?.role === "teacher") {
        router.replace("/dashboard/teacher");
      } else {
        router.replace("/dashboard");
      }
    }, 500);
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="mb-8 text-center">

          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-600/30">
            S
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="mt-2 text-slate-400">
            Login to continue your SKILLX journey.
          </p>

        </div>

        {/* LOGIN CARD */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-2xl">

          <div className="mb-6">

            <h2 className="text-xl font-semibold text-white">
              Login to SKILLX
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Student and Teacher accounts can login here.
            </p>

          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email Address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />

            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                ✕ {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                ✓ {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Login"}
            </button>

          </form>

          {/* SIGNUP SECTION */}
          <div className="mt-7 border-t border-slate-800 pt-6">

            <p className="mb-4 text-center text-sm text-slate-400">
              Don&apos;t have an account?
            </p>

            <div className="grid gap-3">

              <button
                type="button"
                onClick={() => router.push("/signup/student")}
                className="w-full rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
              >
                Create Student Account
              </button>

              <button
                type="button"
                onClick={() => router.push("/signup/teacher")}
                className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
              >
                Create Teacher Account
              </button>

            </div>

          </div>

          {/* HOME */}
          <div className="mt-6 text-center">

            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sm text-slate-500 transition hover:text-slate-300"
            >
              ← Back to Home
            </button>

          </div>

        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          © 2026 SKILLX · Learn. Teach. Grow.
        </p>

      </div>
    </main>
  );
}