import App, { AppContext, AppProps } from "next/app";
import { AnimatePresence, motion } from "framer-motion";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { LanguageProvider, getLangFromCookie, type Lang } from "@/lib/i18n";
import "../styles/globals.css";

type MyAppProps = AppProps<{ session: Session }> & { initialLang: Lang };

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
  router,
  initialLang,
}: MyAppProps) {
  return (
    <SessionProvider session={session}>
      <LanguageProvider initialLang={initialLang ?? "en"}>
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
      </LanguageProvider>
    </SessionProvider>
  );
}

// Read the language cookie on the server so the first render matches the
// user's choice (no hydration flash).
MyApp.getInitialProps = async (appCtx: AppContext) => {
  const appProps = await App.getInitialProps(appCtx);
  const initialLang = getLangFromCookie(appCtx.ctx.req?.headers.cookie);
  return { ...appProps, initialLang };
};
