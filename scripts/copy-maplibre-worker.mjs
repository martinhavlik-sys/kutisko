// Skopíruje web worker MapLibre GL do public/, odkiaľ ho mapa načíta (bundler ho sám nevie nájsť).
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const pkgDir = dirname(require.resolve("maplibre-gl/package.json"));
const version = require("maplibre-gl/package.json").version;
mkdirSync("public/vendor", { recursive: true });
copyFileSync(join(pkgDir, "dist/maplibre-gl-worker.mjs"), "public/vendor/maplibre-gl-worker.mjs");
console.log(`maplibre-gl ${version}: worker skopírovaný do public/vendor/`);
