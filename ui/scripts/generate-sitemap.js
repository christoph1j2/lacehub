// scripts/generate-sitemap.js

import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";
import path from "path";

const links = [
  { url: "/", changefreq: "weekly", priority: 1.0 },
  { url: "/how-it-works", changefreq: "monthly", priority: 0.8 },
  { url: "/about-us", changefreq: "monthly", priority: 0.8 },
  { url: "/contacts", changefreq: "monthly", priority: 0.7 },
  { url: "/dashboard", changefreq: "weekly", priority: 0.6 }, // Protected
  { url: "/settings", changefreq: "monthly", priority: 0.6 }, // Protected
  { url: "/admin", changefreq: "monthly", priority: 0.5 }, // Admin
  { url: "/admin/users", changefreq: "monthly", priority: 0.5 },
];

const sitemap = new SitemapStream({ hostname: "https://www.lacehub.cz" }); // 🛠️ Replace with your real domain

const outputPath = path.resolve("public/sitemap.xml");
const writeStream = createWriteStream(outputPath);

sitemap.pipe(writeStream);

links.forEach((link) => sitemap.write(link));
sitemap.end();

streamToPromise(sitemap).then(() => {
  console.log("✅ Sitemap successfully written to:", outputPath);
});
