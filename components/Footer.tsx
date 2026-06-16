import Link from "next/link";
import { useRouter } from "next/router";

export default function Footer() {
  const router = useRouter();

  // Smooth-scroll to the events section when already on the home page,
  // otherwise navigate home first.
  const handleEventsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const scrollToEvents = () => {
      document
        .getElementById("upcoming-events")
        ?.scrollIntoView({ behavior: "smooth" });
    };
    if (router.pathname === "/home") {
      scrollToEvents();
    } else {
      router.push("/home").then(scrollToEvents);
    }
  };

  return (
    <footer className="glass-strong border-t border-white/10 text-white/80">
      <div className="container mx-auto flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="/usm-logo.png" alt="USM Logo" className="h-8 w-auto" />
          <div>
            <p className="font-display font-bold gradient-text">USM Evently</p>
            <p className="text-xs text-white/50">Connecting events at USM</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/home" className="transition-colors hover:text-brand-cyan">
            Home
          </Link>
          <a
            href="#events"
            onClick={handleEventsClick}
            className="cursor-pointer transition-colors hover:text-brand-cyan"
          >
            Events
          </a>
          <Link
            href="/payment"
            className="transition-colors hover:text-brand-cyan"
          >
            Payment
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-brand-cyan"
          >
            User Agreement
          </Link>
        </div>

        {/* Contact */}
        <p className="text-xs text-white/50">
          info@usm.my · +60 14 520 2958
        </p>
      </div>
    </footer>
  );
}
