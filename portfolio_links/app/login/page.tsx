import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="crt-overlay" />
      <div className="crt-vignette" />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
