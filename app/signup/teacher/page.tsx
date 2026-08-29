"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TeacherSignupPage() {
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
          role: "teacher",
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Teacher account could not be created.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        full_name: fullName,
        email,
        role: "teacher",
      });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setMessage("Teacher account created successfully! 🎉");

    setTimeout(() => {
      router.push("/login");
    }, 1500);

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
            S
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Join SKILLX as Teacher
          </h1>

          <p className="mt-2 text-slate-400">
            Create courses and help students learn.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7">

          <form onSubmit={handleSignup} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Full Name
              </label>

              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
                ✕ {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-400">
                ✓ {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Teacher Account"}
            </button>

          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="font-semibold text-blue-400"
            >
              Login
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}