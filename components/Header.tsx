import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t, lang, setLang } = useTranslation();

  const handleLogout = () => {
    signOut({ callbackUrl: "/home" });
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-white/80 rounded-lg transition-colors hover:text-white hover:bg-white/10"
    >
      {label}
    </Link>
  );

  // The register/login page stays clean: just the logo and name.
  const isAuthPage = router.pathname === "/register";

  const LangToggle = () => (
    <button
      onClick={() => setLang(lang === "en" ? "ms" : "en")}
      title="Switch language"
      className="px-2.5 py-1.5 text-xs font-semibold text-white/80 rounded-lg border border-white/15 bg-white/5 transition-colors hover:bg-white/15"
    >
      {lang === "en" ? "EN" : "BM"}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-white/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/home" className="flex items-center gap-3 group">
          <img
            src="/usm-logo.png"
            alt="USM Logo"
            className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-display text-lg font-bold tracking-tight gradient-text">
            USM Evently
          </span>
        </Link>

        {!isAuthPage && (
          <nav className="flex items-center gap-1 sm:gap-2">
            {router.pathname !== "/home" && (
              <NavLink href="/home" label={t("home")} />
            )}
            {session ? (
              <>
                {router.pathname !== "/tickets" && (
                  <NavLink href="/tickets" label={t("myTickets")} />
                )}
                {router.pathname !== "/profile" && (
                  <NavLink href="/profile" label={t("profile")} />
                )}
                {session.user.role !== "ADMIN" &&
                  router.pathname !== "/organizer" && (
                    <NavLink href="/organizer" label={t("organizer")} />
                  )}
                {session.user.role === "ADMIN" &&
                  router.pathname !== "/admin" && (
                    <NavLink href="/admin" label={t("admin")} />
                  )}
                <LangToggle />
                <button
                  onClick={handleLogout}
                  className="ml-1 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-white/10 border border-white/15 backdrop-blur transition-all hover:bg-white/20 hover:-translate-y-0.5"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <LangToggle />
                <Link
                  href="/register"
                  className="ml-1 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-brand-violet to-brand-indigo shadow-glow transition-all hover:-translate-y-0.5 hover:brightness-110"
                >
                  {t("login")}
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
