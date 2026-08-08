"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthPanelProps {
  onSignIn: (email: string) => Promise<boolean>;
  error?: string | null;
}

export function AuthPanel({ onSignIn, error }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    const ok = await onSignIn(trimmed);
    setIsSubmitting(false);
    if (ok) setSent(true);
  };

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center gap-6 p-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Personal Calendar 로그인</h2>
        <p className="text-sm text-muted-foreground">
          이메일로 매직 링크를 보내드립니다. 링크를 열면 Supabase에 저장된
          일정을 사용할 수 있습니다.
        </p>
      </div>

      {sent ? (
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">{email}</strong> 로 로그인 링크를
          보냈습니다. 메일함을 확인해 주세요.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-email">이메일</Label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "전송 중..." : "매직 링크 받기"}
          </Button>
        </form>
      )}
    </div>
  );
}
