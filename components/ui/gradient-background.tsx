import { cn } from "@/utils/cn";

/**
 * Fundo ornamental da autenticação.
 * Receita 21st.dev “Jade Sky”, retintada para o teal (hue 160) e o ouro da logo.
 */
export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none overflow-hidden [container-type:size]",
        className,
      )}
    >
      <div
        className="absolute inset-[-8cqmin] blur-[8cqmin] motion-reduce:blur-[2cqmin] dark:hidden"
        style={{
          backgroundColor: "oklch(0.93 0.03 175)",
          backgroundImage: [
            "radial-gradient(circle at 65% 42%, oklch(0.97 0.02 160) 0%, transparent 38%)",
            "radial-gradient(circle at 22% 78%, oklch(0.78 0.08 160) 0%, transparent 48%)",
            "radial-gradient(circle at 48% 18%, oklch(0.82 0.07 155) 0%, transparent 52%)",
            "radial-gradient(circle at 86% 86%, oklch(0.90 0.07 95) 0%, transparent 42%)",
          ].join(", "),
        }}
      />
      <div
        className="absolute inset-[-8cqmin] hidden blur-[8cqmin] motion-reduce:blur-[2cqmin] dark:block"
        style={{
          backgroundColor: "oklch(0.145 0.02 160)",
          backgroundImage: [
            "radial-gradient(circle at 62% 38%, oklch(0.28 0.05 160) 0%, transparent 42%)",
            "radial-gradient(circle at 18% 82%, oklch(0.24 0.06 160) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 12%, oklch(0.22 0.04 175) 0%, transparent 48%)",
            "radial-gradient(circle at 88% 88%, oklch(0.32 0.06 90 / 0.45) 0%, transparent 40%)",
          ].join(", "),
        }}
      />
    </div>
  );
}
