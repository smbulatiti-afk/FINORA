"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/AuthForms";

function LoginContent() {
  const searchParams = useSearchParams();
  return <LoginForm registered={searchParams.get("registered") === "1"} passwordReset={searchParams.get("passwordReset") === "1"} />;
}

export default function LoginPage() {
  return <Suspense fallback={<LoginForm />}><LoginContent /></Suspense>;
}
