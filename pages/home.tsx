import type { GetServerSideProps } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import { Prisma } from "@prisma/client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { prisma } from "@/lib/prisma";
import {
  serializeEvent,
  formatEventDate,
  type SerializedEvent,
} from "@/lib/events";
import { USM_CAMPUSES } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";

type Filters = { q: string; campus: string; category: string; cost: string };

type HomeProps = {
  upcoming: SerializedEvent[];
  past: SerializedEvent[];
  filters: Filters;
  categories: string[];
  campuses: string[];
};

// Public: anyone can browse upcoming & past (approved) events without signing in.
export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  ctx
) => {
  const q = (ctx.query.q as string | undefined)?.trim() ?? "";
  const campus = (ctx.query.campus as string) ?? "";
  const category = (ctx.query.category as string) ?? "";
  const cost = (ctx.query.cost as string) ?? "";
  const now = new Date();

  const base: Prisma.EventWhereInput = {
    status: "APPROVED",
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(campus ? { campus } : {}),
    ...(category ? { category } : {}),
    ...(cost === "free"
      ? { price: { lte: 0 } }
      : cost === "paid"
        ? { price: { gt: 0 } }
        : {}),
  };

  const [upcoming, past, categoryRows] = await Promise.all([
    prisma.event.findMany({
      where: { ...base, date: { gte: now } },
      orderBy: { date: "asc" },
    }),
    prisma.event.findMany({
      where: { ...base, date: { lt: now } },
      orderBy: { date: "desc" },
    }),
    prisma.event.findMany({
      where: { status: "APPROVED", category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  return {
    props: {
      upcoming: upcoming.map(serializeEvent),
      past: past.map(serializeEvent),
      filters: { q, campus, category, cost },
      categories: categoryRows.map((c) => c.category).filter(Boolean) as string[],
      campuses: [...USM_CAMPUSES],
    },
  };
};

function UpcomingTile({ event, i }: { event: SerializedEvent; i: number }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/events/${event.id}`} className="block h-full">
        <article className="group relative h-full overflow-hidden rounded-3xl glass-strong border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow">
          <div className="relative h-52 overflow-hidden">
            <img
              src={event.imageUrl ?? "/event1.jpg"}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/15">
                {event.price > 0 ? `RM ${event.price.toFixed(2)}` : t("free")}
              </span>
              {event.category && (
                <span className="rounded-full bg-brand-violet/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {event.category}
                </span>
              )}
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-display text-xl font-bold text-white transition-colors duration-300 group-hover:gradient-text">
              {event.title}
            </h3>
            <p className="mt-2 text-sm text-white/60">
              {formatEventDate(event.date)}
            </p>
            <p className="mt-1 text-xs text-white/40 truncate">{event.campus}</p>
            <div className="mt-4 flex items-center justify-between">
              {event.csdPoints > 0 ? (
                <span className="rounded-full bg-brand-gold/15 px-2.5 py-1 text-xs font-semibold text-brand-gold">
                  ★ {event.csdPoints} MyCSD
                </span>
              ) : (
                <span />
              )}
              <span className="translate-x-2 text-sm font-semibold text-brand-cyan opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                {t("viewDetails")} →
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function PastTile({ event, i }: { event: SerializedEvent; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: i * 0.05, duration: 0.5 }}
    >
      <Link href={`/events/${event.id}`} className="block h-full">
        <article className="group relative h-40 overflow-hidden rounded-2xl border border-white/10">
          <img
            src={event.imageUrl ?? "/past1.jpg"}
            alt={event.title}
            className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-semibold text-white/90 group-hover:text-white">
              {event.title}
            </h3>
            <p className="text-[11px] text-white/50">
              {formatEventDate(event.date)}
            </p>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

const fieldClass =
  "rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-brand-violet/60 focus:ring-2 focus:ring-brand-violet/40";

function FilterBar({
  filters,
  categories,
  campuses,
}: {
  filters: Filters;
  categories: string[];
  campuses: string[];
}) {
  const { t } = useTranslation();
  const hasFilters =
    filters.q || filters.campus || filters.category || filters.cost;
  return (
    <form
      method="get"
      action="/home"
      className="rounded-2xl glass p-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
    >
      <input
        type="text"
        name="q"
        defaultValue={filters.q}
        placeholder={t("searchPlaceholder")}
        className={`${fieldClass} flex-1 min-w-[180px]`}
      />
      <select name="campus" defaultValue={filters.campus} className={`${fieldClass} bg-ink-800`}>
        <option value="">{t("allCampuses")}</option>
        {campuses.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select name="category" defaultValue={filters.category} className={`${fieldClass} bg-ink-800`}>
        <option value="">{t("allCategories")}</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select name="cost" defaultValue={filters.cost} className={`${fieldClass} bg-ink-800`}>
        <option value="">{t("anyPrice")}</option>
        <option value="free">{t("free")}</option>
        <option value="paid">{t("paid")}</option>
      </select>
      <button
        type="submit"
        className="rounded-xl bg-gradient-to-r from-brand-violet to-brand-indigo px-5 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5"
      >
        {t("apply")}
      </button>
      {hasFilters && (
        <Link href="/home" className="px-3 py-2 text-sm text-white/60 hover:text-white">
          {t("clear")}
        </Link>
      )}
    </form>
  );
}

export default function Home({
  upcoming,
  past,
  filters,
  categories,
  campuses,
}: HomeProps) {
  const { t } = useTranslation();
  return (
    <div className="aurora-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-brand-violet/30 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-brand-cyan/20 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-brand-fuchsia/20 blur-3xl animate-float"
        style={{ animationDelay: "4s" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="flex-grow">
          <section className="container mx-auto px-4 sm:px-6 pt-16 pb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/80">
                <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse-glow" />
                {t("heroBadge")}
              </span>
              <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
                {t("heroTitlePre")} <span className="gradient-text">{t("heroTitleHi")}</span>{" "}
                {t("heroTitlePost")}
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-white/60 sm:text-lg">
                {t("heroSubtitle")}
              </p>
            </motion.div>
          </section>

          <div className="container mx-auto space-y-12 px-4 sm:px-6 pb-20">
            <FilterBar filters={filters} categories={categories} campuses={campuses} />

            <section id="upcoming-events" className="scroll-mt-24">
              <div className="mb-8 flex items-end justify-between">
                <h2 className="font-display text-3xl font-bold text-white">
                  {t("upcoming")} <span className="gradient-text">{t("events")}</span>
                </h2>
                <span className="text-sm text-white/40">
                  {upcoming.length} {t("results")}
                </span>
              </div>
              {upcoming.length === 0 ? (
                <p className="rounded-2xl glass p-8 text-center text-white/60">
                  {t("noUpcoming")}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((event, i) => (
                    <UpcomingTile key={event.id} event={event} i={i} />
                  ))}
                </div>
              )}
            </section>

            <section id="past-events">
              <h2 className="mb-8 font-display text-3xl font-bold text-white">
                {t("past")} <span className="gradient-text">{t("events")}</span>
              </h2>
              {past.length === 0 ? (
                <p className="rounded-2xl glass p-8 text-center text-white/60">
                  {t("noPast")}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {past.map((event, i) => (
                    <PastTile key={event.id} event={event} i={i} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
