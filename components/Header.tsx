import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();

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

  // The register/login page stays clean — just the logo and name.
  const isAuthPage = router.pathname === "/register";

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-white/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo and App Name */}
        <Link
          href={session ? "/home" : "/home"}
          className="flex items-center gap-3 group"
        >
          <img
            src="/usm-logo.png"
            alt="USM Logo"
            className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-display text-lg font-bold tracking-tight gradient-text">
            USM Evently
          </span>
        </Link>

        {/* Auth-aware navigation */}
        {!isAuthPage && (
          <nav className="flex items-center gap-1 sm:gap-2">
            {router.pathname !== "/home" && (
              <NavLink href="/home" label="Home" />
            )}
            {session ? (
              <>
                {router.pathname !== "/profile" && (
                  <NavLink href="/profile" label="Profile" />
                )}
                {session.user.role === "ADMIN" &&
                  router.pathname !== "/admin" && (
                    <NavLink href="/admin" label="Admin" />
                  )}
                <button
                  onClick={handleLogout}
                  className="ml-1 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-white/10 border border-white/15 backdrop-blur transition-all hover:bg-white/20 hover:-translate-y-0.5"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/register"
                className="ml-1 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-brand-violet to-brand-indigo shadow-glow transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                Log in / Sign up
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
