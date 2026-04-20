"use client";

import { signIn } from "next-auth/react";

export function LoginButton({ children, className }) {
  return (
    <button className={className} onClick={() => signIn('linkedin')}>
      {children}
    </button>
  );
}
