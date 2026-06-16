// Captures README screenshots of the main features against a running dev/prod
// server with seeded data.
//
// Requires Puppeteer (kept out of package.json to avoid a heavy Chromium
// download on every install):
//   npm i -D puppeteer
// Then, with the app running locally and seeded:
//   node scripts/screenshots.js
const puppeteer = require("puppeteer");
const fs = require("fs");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function login(page, email, password) {
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    document.querySelectorAll("input").forEach((i) => (i.value = ""));
  });
  await page.type("input[name=email]", email);
  await page.type("input[name=password]", password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {}),
    page.click("button[type=submit]"),
  ]);
  await page
    .waitForFunction(() => location.pathname === "/home", { timeout: 15000 })
    .catch(() => {});
  await sleep(1200);
}

async function shotEl(page, selector, path) {
  const el = await page.$(selector);
  if (!el) return false;
  await el.evaluate((n) => n.scrollIntoView());
  await sleep(500);
  await el.screenshot({ path });
  return true;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  // Login page
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle0" });
  await sleep(900);
  await page.screenshot({ path: `${OUT}/05-login.png` });
  console.log("login");

  // Student: profile, payment, tickets
  await login(page, "noormohammadsowan@student.usm.my", "student123");
  await page.goto(`${BASE}/profile`, { waitUntil: "networkidle0" });
  await sleep(800);
  await page.screenshot({ path: `${OUT}/06-profile.png`, fullPage: true });
  console.log("profile");

  await page.goto(
    `${BASE}/payment?amount=25&description=${encodeURIComponent("Career Fair 2026 Ticket")}`,
    { waitUntil: "networkidle0" }
  );
  await sleep(800);
  await page.screenshot({ path: `${OUT}/07-payment.png`, fullPage: true });
  console.log("payment");

  await page.goto(`${BASE}/tickets`, { waitUntil: "networkidle0" });
  await sleep(1000);
  await page.screenshot({ path: `${OUT}/10-tickets.png`, fullPage: true });
  console.log("tickets");

  // Organizer (approved): submission form + my submissions
  await login(page, "limwei@student.usm.my", "organizer123");
  await page.goto(`${BASE}/organizer`, { waitUntil: "networkidle0" });
  await sleep(800);
  await page.screenshot({ path: `${OUT}/11-organizer.png`, fullPage: true });
  console.log("organizer");

  // Admin views
  await login(page, "admin@usm.my", "admin123");

  await page.goto(`${BASE}/home`, { waitUntil: "networkidle0" });
  await sleep(1800);
  await page.screenshot({ path: `${OUT}/01-home.png` });
  console.log("home");

  const events = await page.evaluate(async () => {
    const r = await fetch("/api/events?type=upcoming");
    return (await r.json()).events;
  });
  const target =
    events.find((e) => /hackathon/i.test(e.title)) || events[0];
  await page.goto(`${BASE}/events/${target.id}`, { waitUntil: "networkidle0" });
  await sleep(900);
  await page.screenshot({ path: `${OUT}/02-event-detail.png`, fullPage: true });
  console.log("event detail");

  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  await sleep(900);
  const formCard = await page.$("form");
  const box = await formCard.boundingBox();
  await page.screenshot({
    path: `${OUT}/03-admin-create-event.png`,
    clip: {
      x: 0,
      y: 0,
      width: 1280,
      height: Math.min(Math.ceil(box.y + box.height + 120), 2200),
    },
  });
  console.log("admin create");
  await shotEl(page, "#pending-events", `${OUT}/12-admin-queues.png`);
  console.log("admin queues");
  await shotEl(page, "#moderation", `${OUT}/08-admin-moderation.png`);
  console.log("moderation");

  await page.goto(`${BASE}/admin/analytics`, { waitUntil: "networkidle0" });
  await page
    .waitForSelector("svg.recharts-surface", { timeout: 10000 })
    .catch(() => {});
  await sleep(1500);
  await page.screenshot({ path: `${OUT}/09-analytics.png`, fullPage: true });
  console.log("analytics");

  await page.goto(`${BASE}/terms`, { waitUntil: "networkidle0" });
  await sleep(700);
  await page.screenshot({ path: `${OUT}/04-user-agreement.png`, fullPage: true });
  console.log("terms");

  // Bahasa Malaysia home (i18n)
  await page.setCookie({ name: "lang", value: "ms", url: BASE });
  await page.goto(`${BASE}/home`, { waitUntil: "networkidle0" });
  await sleep(1500);
  await page.screenshot({ path: `${OUT}/13-home-bm.png` });
  console.log("home BM");

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
