#!/usr/bin/env node
// Injects PWA tags into the exported web build. Expo's metro web export
// copies public/ into dist but offers no hook to extend <head> without
// expo-router, so we patch dist/index.html after `expo export -p web`.

const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "dist", "index.html");

if (!fs.existsSync(indexPath)) {
  console.error(`postbuild-web: ${indexPath} not found — did expo export run?`);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, "utf8");

const tags = [
  '<link rel="manifest" href="/manifest.json">',
  '<meta name="theme-color" content="#6366F1">',
  '<link rel="icon" type="image/svg+xml" href="/icon.svg">',
  '<link rel="apple-touch-icon" href="/icon.svg">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  '<meta name="apple-mobile-web-app-title" content="Rhetorio">'
].filter((tag) => !html.includes(tag));

if (tags.length) {
  html = html.replace("</head>", `${tags.join("\n")}\n</head>`);
  fs.writeFileSync(indexPath, html);
}

console.log(`postbuild-web: injected ${tags.length} PWA tag(s) into dist/index.html`);
