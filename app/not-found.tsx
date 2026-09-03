import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md text-center">
        <div className="text-6xl font-black text-blue-500">404</div>
        <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-400">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-7 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
        >
          Back to SKILLX
        </Link>
      </div>
    </main>
  );
}
