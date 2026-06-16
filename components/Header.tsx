import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();

  // Dynamic Header Styles Based on Page
  const headerStyles: Record<string, string> = {
    "/home": "bg-usmPurple text-white",
    "/profile": "bg-gold text-usmPurple",
    "/payment": "bg-yellow-500 text-black",
    "/admin": "bg-gray-900 text-white",
  };

  const currentStyle =
    headerStyles[router.pathname] || "bg-usmPurple text-white";

  const handleLogout = () => {
    signOut({ callbackUrl: "/register" });
  };

  const NavButton = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className="px-4 py-2 bg-white text-usmPurple font-semibold rounded-lg shadow hover:bg-gray-200"
    >
      {label}
    </Link>
  );

  // The register/login page stays clean — just the logo and name.
  const isAuthPage = router.pathname === "/register";

  return (
    <header className={`${currentStyle} p-4 shadow-md bg-opacity-50`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and App Name */}
        <div className="flex items-center">
          <Link href={session ? "/home" : "/register"}>
            <img
              src="/usm-logo.png"
              alt="USM Logo"
              className="h-10 w-auto mr-4 cursor-pointer"
            />
          </Link>
          <h1 className="text-xl font-extrabold">USM Evently</h1>
        </div>

        {/* Page-Specific / Auth-aware Buttons */}
        {!isAuthPage && session && (
          <div className="flex items-center space-x-4">
            {router.pathname !== "/home" && (
              <NavButton href="/home" label="Home" />
            )}
            {router.pathname !== "/profile" && (
              <NavButton href="/profile" label="Profile" />
            )}
            {session.user.role === "ADMIN" &&
              router.pathname !== "/admin" && (
                <NavButton href="/admin" label="Admin" />
              )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
