import Link from "next/link";
import { useRouter } from "next/router";

export default function Footer() {
  const router = useRouter();

  // Handle Events Anchor Click
  const handleEventsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (router.pathname === "/home") {
      // Scroll to #events if already on the homepage
      const eventsSection = document.getElementById("upcoming-events");
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to homepage and scroll after navigation
      router.push("/home").then(() => {
        const eventsSection = document.getElementById("upcoming-events");
        if (eventsSection) {
          eventsSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  };

  const footerStyles: Record<string, string> = {
    "/home": "bg-usmPurple text-white",
    "/profile": "bg-gold text-usmPurple",
    "/payment": "bg-yellow-500 text-black",
    "/events": "bg-gray-800 text-white",
  };

  const currentStyle = footerStyles[router.pathname] || "bg-usmPurple text-white";

  return (
    <footer className={`${currentStyle} p-4 shadow-md bg-opacity-50`}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Navigation Shortcuts */}
        <div className="flex space-x-6 mb-4 md:mb-0">
          <Link href="/home" className="hover:text-gold">
            Home
          </Link>
          <a
            href="#events"
            onClick={handleEventsClick}
            className="hover:text-gold cursor-pointer"
          >
            Events
          </a>
          <Link href="/payment" className="hover:text-gold">
            Payment
          </Link>
          <Link href="/terms" className="hover:text-gold">
            User Agreement
          </Link>
        </div>

        {/* Contact Information */}
        <p className="text-sm mb-4 md:mb-0 font-thin text-center">
          Contact us: info@usm.my | +60 14 520 2958
        </p>

        {/* Logo and Description */}
        <div className="flex items-center space-x-2">
          <img src="/usm-logo.png" alt="USM Logo" className="h-8 w-100" />
          <span className="text-center font-poppins">USM Evently - Connecting Events at USM</span>
        </div>
      </div>
    </footer>
  );
}
