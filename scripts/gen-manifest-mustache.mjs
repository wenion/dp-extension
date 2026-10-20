import fs from "node:fs/promises";
import { fileURLToPath } from "url";
import path from "node:path";
import Mustache from "mustache";
import "dotenv/config";

// .env > .env.local

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function main() {
  const version = process.env.VERSION || "1.0.0";
  const externallyConnectableMatches = (process.env.EXTERNALLY_CONNECTABLE_MATCHES ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const default_popup = process.env.DEFAULT_POPUP ?? "popup.html";
  const xhr_interceptor_resources = (process.env.XHR_INTERCEPTOR_RESOURCES ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const xhr_interceptor_matches = (process.env.XHR_INTERCEPTOR_MATCHES ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const fetch_interceptor_resources = (process.env.FETCH_INTERCEPTOR_RESOURCES ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const fetch_interceptor_matches = (process.env.FETCH_INTERCEPTOR_MATCHES ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const host_permissions = (process.env.HOST_PERMISSIONS ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const permissions = (process.env.PERMISSIONS ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const contentScriptMatches = (process.env.CONTENT_SCRIPT_MATCHES ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const templatePath = path.resolve(__dirname, "manifest.template.json.mustache");
  const template = await fs.readFile(templatePath, "utf8");

  const data = {
    version: version,
    default_popup: default_popup,
    externally_connectable_matches: JSON.stringify(externallyConnectableMatches),
    xhr_interceptor_resources: JSON.stringify(xhr_interceptor_resources),
    xhr_interceptor_matches: JSON.stringify(xhr_interceptor_matches),
    fetch_interceptor_resources: JSON.stringify(fetch_interceptor_resources),
    fetch_interceptor_matches: JSON.stringify(fetch_interceptor_matches),
    host_permissions: JSON.stringify(host_permissions),
    permissions: JSON.stringify(permissions),
    content_script_matches: JSON.stringify(contentScriptMatches),
  };

  const rendered = Mustache.render(template, data);

  // Optional: validate it’s valid JSON
  JSON.parse(rendered);

  const outDir = path.resolve(__dirname, "../public");
  await fs.mkdir(outDir, { recursive: true });

  const outPath = path.join(outDir, "manifest.json");
  await fs.writeFile(outPath, rendered, "utf8");

  console.log("✅ Wrote manifest to", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
