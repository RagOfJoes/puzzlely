import clsx from "clsx";
import Link from "next/link";
import { IoLogoDiscord, IoLogoGithub, IoLogoGoogle } from "react-icons/io5";

export function SignupContainer() {
  return (
    <>
      <div className="mt-6 flex flex-col items-start gap-4">
        {[
          {
            title: "Discord",
            icon: IoLogoDiscord,
            path: "/api/auth/discord/",
          },
          { title: "GitHub", icon: IoLogoGithub, path: "/api/auth/github" },
          { title: "Google", icon: IoLogoGoogle, path: "/api/auth/google" },
        ].map((p) => {
          return (
            <Link
              href={p.path}
              key={p.title}
              className={clsx(
                "relative flex h-12 w-full shrink-0 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-surface px-6 font-semibold shadow outline-none transition",

                "active:bg-muted/20",
                "focus-visible:ring",
                "hover:bg-muted/10"
              )}
            >
              {p.icon({ size: 20 })}
              Log in with {p.title}
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-sm font-medium text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className={clsx(
            "font-bold text-cyan outline-none transition",

            "focus-visible:ring focus-visible:ring-cyan/60",
            "hover:underline"
          )}
        >
          Log in
        </Link>
      </p>
    </>
  );
}
