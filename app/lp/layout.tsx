"use client";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function LpLayout({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ fontFamily: '"Comic Sans MS", "Rounded Mplus 1c", "Arial", sans-serif', background: '#f7efda' }}>
        {children}
      </div>
    </QueryClientProvider>
  );
} 