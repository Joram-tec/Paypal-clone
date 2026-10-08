import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicDir = resolve(process.cwd(), "public");
const manifest = JSON.parse(readFileSync(resolve(publicDir, "manifest.json"), "utf8"));
const html = readFileSync(resolve(process.cwd(), "pages", "index.html"), "utf8");
const document = new DOMParser().parseFromString(html, "text/html");

function expectPngSize(path: string, size: number) {
  const image = readFileSync(resolve(publicDir, path));
  expect(image.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(image.readUInt32BE(16)).toBe(size);
  expect(image.readUInt32BE(20)).toBe(size);
}

describe("Pesa Wallet PWA", () => {
  it("installs at the GitHub Pages URL in standalone mode", () => {
    expect(manifest).toMatchObject({
      id: "/Paypal-clone/",
      name: "Pesa Wallet",
      short_name: "Pesa Wallet",
      start_url: "/Paypal-clone/",
      scope: "/Paypal-clone/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#0070ba",
    });
  });

  it.each([192, 512])("provides a real %i pixel PNG app icon", (size) => {
    const icon = manifest.icons.find(
      (entry: { sizes: string }) => entry.sizes === `${size}x${size}`,
    );
    expect(icon).toMatchObject({ type: "image/png", purpose: "any" });
    expectPngSize(icon.src, size);
  });

  it("links installation metadata and an iOS home-screen icon", () => {
    expect(document.querySelector('link[rel="manifest"]')?.getAttribute("href")).toBe(
      "%BASE_URL%manifest.json",
    );
    for (const name of ["mobile-web-app-capable", "apple-mobile-web-app-capable"]) {
      expect(document.querySelector(`meta[name="${name}"]`)?.getAttribute("content")).toBe("yes");
    }
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      manifest.theme_color,
    );
    expect(document.querySelector('meta[name="viewport"]')?.getAttribute("content")).toBe(
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
    );
    expect(document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href")).toBe(
      "%BASE_URL%icons/apple-touch-icon.png",
    );
    expectPngSize("icons/apple-touch-icon.png", 180);
  });
});
