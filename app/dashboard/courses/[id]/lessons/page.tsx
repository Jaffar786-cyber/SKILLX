"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentLessonsRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  useEffect(() => {
    if (courseId) {
      router.replace(`/dashboard/courses/${courseId}`);
    }
  }, [courseId, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
      Opening course lessons...
    </main>
  );
}
