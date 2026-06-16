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

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  // --- Log in as the admin so every page is reachable ---
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle0" });
  await sleep(900);
  await page.screenshot({ path: `${OUT}/05-login.png` });
  console.log("captured login");
  await page.type("input[name=email]", "admin@usm.my");
  await page.type("input[name=password]", "admin123");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {}),
    page.click("button[type=submit]"),
  ]);
  await page
    .waitForFunction(() => location.pathname === "/home", { timeout: 15000 })
    .catch(() => {});
  await sleep(1500);

  // 1. Home: upcoming & past events
  await page.goto(`${BASE}/home`, { waitUntil: "networkidle0" });
  await sleep(1800);
  await page.screenshot({ path: `${OUT}/01-home.png` });
  console.log("captured home");

  // 2. Event detail: campus/safety/cultural info
  const events = await page.evaluate(async () => {
    const r = await fetch("/api/events?type=upcoming");
    const d = await r.json();
    return d.events;
  });
  const target =
    events.find((e) => /hackathon/i.test(e.title)) ||
    events.find((e) => /career/i.test(e.title)) ||
    events[0];
  await page.goto(`${BASE}/events/${target.id}`, { waitUntil: "networkidle0" });
  await sleep(1000);
  await page.screenshot({ path: `${OUT}/02-event-detail.png`, fullPage: true });
  console.log("captured event detail");

  // 3. Admin: create-event form (clip to the form card)
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  await sleep(1000);
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
  console.log("captured admin");

  // 4. User Agreement
  await page.goto(`${BASE}/terms`, { waitUntil: "networkidle0" });
  await sleep(800);
  await page.screenshot({ path: `${OUT}/04-user-agreement.png`, fullPage: true });
  console.log("captured terms");

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
