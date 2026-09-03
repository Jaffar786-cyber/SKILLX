"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function StudentSignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "student",
        },
      },
    });

    // Auth error
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // No user returned
    if (!data.user) {
      setError("Account could not be created. Please try again.");
      setLoading(false);
      return;
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        full_name: fullName,
        email,
        role: "student",
      });

    if (profileError) {
      setError(
        `Account was created, but profile could not be saved: ${profileError.message}`
      );

      setLoading(false);
      return;
    }

    setMessage("Account created successfully! 🎉");

    setTimeout(() => {
      router.push("/login");
    }, 1500);

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-lg shadow-blue-600/30">
            S
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Join SKILLX
          </h1>

          <p className="mt-2 text-slate-400">
            Create your student account and start learning.
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-2xl">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Student Sign Up
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Create your SKILLX learning account.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Full Name
              </label>

              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Email */}
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <div className="font-semibold">✕ Signup Failed</div>
                <div className="mt-1">{error}</div>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                <div className="font-semibold">✓ Success</div>
                <div className="mt-1">{message}</div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Student Account"}
            </button>

          </form>

          {/* Login */}
          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Login
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