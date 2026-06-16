import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "ms";

/**
 * Translation dictionaries. English is the source of truth; any key missing
 * from Bahasa Malaysia falls back to English, then to the key itself.
 */
const dict: Record<Lang, Record<string, string>> = {
  en: {
    // header / nav
    home: "Home",
    profile: "Profile",
    admin: "Admin",
    organizer: "Organizer",
    myTickets: "My Tickets",
    logout: "Log out",
    login: "Log in / Sign up",
    // hero
    heroBadge: "Live campus events at Universiti Sains Malaysia",
    heroTitlePre: "Discover what's",
    heroTitleHi: "happening",
    heroTitlePost: "at USM",
    heroSubtitle:
      "Orientation, career fairs, expos and more. Browse, register, and earn MyCSD points, all in one place.",
    // filters
    searchPlaceholder: "Search events...",
    allCampuses: "All campuses",
    allCategories: "All categories",
    anyPrice: "Any price",
    free: "Free",
    paid: "Paid",
    apply: "Apply",
    clear: "Clear",
    // sections
    upcoming: "Upcoming",
    past: "Past",
    events: "Events",
    results: "results",
    noUpcoming: "No events match your filters right now. Check back soon.",
    noPast: "No past events yet.",
    viewDetails: "View details",
    // event detail
    register: "Register",
    cancelRegistration: "Cancel Registration",
    addToCalendar: "Add to Calendar",
    shareEvent: "Share Event",
    loginToRegister: "Log in to register",
  },
  ms: {
    home: "Laman Utama",
    profile: "Profil",
    admin: "Pentadbir",
    organizer: "Penganjur",
    myTickets: "Tiket Saya",
    logout: "Log keluar",
    login: "Log masuk / Daftar",
    heroBadge: "Acara kampus secara langsung di Universiti Sains Malaysia",
    heroTitlePre: "Terokai apa yang",
    heroTitleHi: "berlaku",
    heroTitlePost: "di USM",
    heroSubtitle:
      "Orientasi, pameran kerjaya, ekspo dan banyak lagi. Layari, daftar, dan kumpul mata MyCSD, semuanya di satu tempat.",
    searchPlaceholder: "Cari acara...",
    allCampuses: "Semua kampus",
    allCategories: "Semua kategori",
    anyPrice: "Sebarang harga",
    free: "Percuma",
    paid: "Berbayar",
    apply: "Tapis",
    clear: "Kosongkan",
    upcoming: "Akan Datang",
    past: "Lepas",
    events: "Acara",
    results: "hasil",
    noUpcoming: "Tiada acara yang sepadan dengan tapisan anda. Sila kembali kemudian.",
    noPast: "Tiada acara lepas lagi.",
    viewDetails: "Lihat butiran",
    register: "Daftar",
    cancelRegistration: "Batal Pendaftaran",
    addToCalendar: "Tambah ke Kalendar",
    shareEvent: "Kongsi Acara",
    loginToRegister: "Log masuk untuk mendaftar",
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof document !== "undefined") {
      // Persist for one year so SSR renders in the chosen language.
      document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    }
  }, []);

  const t = useCallback(
    (key: string) => dict[lang][key] ?? dict.en[key] ?? key,
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

/** Reads the preferred language from a Cookie header (server-side). */
export function getLangFromCookie(cookieHeader?: string): Lang {
  if (!cookieHeader) return "en";
  const m = cookieHeader.match(/(?:^|;\s*)lang=(en|ms)/);
  return (m?.[1] as Lang) ?? "en";
}
