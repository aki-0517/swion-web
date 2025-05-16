import type { ReactNode } from "react";

export default function LpLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: '"Comic Sans MS", "Rounded Mplus 1c", "Arial", sans-serif', background: '#f7efda' }}>
      {children}
    </div>
  );
} 