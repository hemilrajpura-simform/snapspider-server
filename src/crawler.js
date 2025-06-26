const puppeteer = require("puppeteer");

async function extractLinks(inputUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const baseUrl = normalizeUrl(inputUrl);

  await page.goto(baseUrl, { waitUntil: "networkidle2" });

  const links = await page.$$eval(
    "a[href]",
    (elements) =>
      elements.map((el) => el.href).filter((href) => href.startsWith("http")) // filter full URLs only
  );

  await browser.close();
  return Array.from(new Set(links)).slice(0, 10);
}

function normalizeUrl(url) {
  return url.startsWith("http") ? url : `https://${url}`;
}

module.exports = { extractLinks };
