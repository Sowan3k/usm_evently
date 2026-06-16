import { AppProps } from "next/app";
import { AnimatePresence, motion } from "framer-motion";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import "../styles/globals.css"; // Make sure this is your global CSS file

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
  router,
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </SessionProvider>
  );
}
