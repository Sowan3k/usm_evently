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
        <div>
          <p className="font-display font-bold gradient-text">USM Evently</p>
          <p className="text-xs text-white/50">Connecting events at USM</p>
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

        {/* Credit */}
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
          <a
            href="https://sowan-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-brand-cyan"
          >
            Built by Noor Mohammad Sowan
          </a>
          <a
            href="https://github.com/Sowan3k/usm_evently"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-brand-cyan"
          >
            Source on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
