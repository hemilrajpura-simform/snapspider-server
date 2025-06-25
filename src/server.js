const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { extractLinks } = require("./crawler");
const cloudinary = require("./cloudinary");

const app = express();
const PORT = 5000;
const screenshotDir = path.join(__dirname, "screenshots");

// Ensure screenshots folder exists
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

app.use(cors());
app.use(bodyParser.json());
app.use("/screenshots", express.static(screenshotDir));

app.post("/api/snapshots", async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const linksToVisit = await extractLinks(url);
    console.log(linksToVisit, "<-- linksToVisit");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const visited = new Set();
    const screenshots = [];

    for (let i = 0; i < linksToVisit.length; i++) {
      const link = linksToVisit[i];
      if (visited.has(link)) continue;

      try {
        await page.goto(link, { waitUntil: "networkidle2", timeout: 15000 });

        const { width, height } = await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        }));

        if (width === 0 || height === 0) {
          console.warn(`Skipping ${link}: Page has 0 dimensions`);
          continue;
        }

        const safeHost = new URL(link).hostname.replace(/\./g, "_");
        const filename = `${safeHost}_${i}.png`;
        const filepath = path.join(screenshotDir, filename);

        await page.screenshot({ path: filepath, fullPage: true });

        // ✅ Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filepath, {
          folder: "snapspider/screenshots",
          use_filename: true,
          unique_filename: false,
        });

        screenshots.push(result.secure_url); // Push cloud URL
        visited.add(link);

        // ✅ Optional: Delete local file
        fs.unlinkSync(filepath);
      } catch (err) {
        console.error(`Error capturing ${link}:`, err.message);
      }
    }

    await browser.close();
    res.json({ snapshots: screenshots });
  } catch (err) {
    console.error("Top-level error:", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while processing the URL." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
