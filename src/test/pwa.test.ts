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
    expect(icon).toMatchObject({
      src: `icons/paypal-${size}-v2.png`,
      type: "image/png",
      purpose: "any",
    });
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
      "width=device-width, initial-scale=1.0, viewport-fit=cover",
    );
    expect(document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href")).toBe(
      "%BASE_URL%icons/apple-touch-icon-v3.png",
    );
    expect(document.querySelector('link[rel="icon"]')?.getAttribute("href")).toBe(
      "%BASE_URL%icons/favicon-32.png",
    );
    expectPngSize("icons/favicon-32.png", 32);
    expectPngSize("icons/apple-touch-icon-v3.png", 180);
  });

  it("hides the preview status bar on mobile and standalone displays", () => {
    const style = globalThis.document.createElement("style");
    style.textContent = readFileSync(
      resolve(process.cwd(), "src", "components", "wallet", "wallet.css"),
      "utf8",
    );
    globalThis.document.head.append(style);
    try {
      const rules = Array.from(style.sheet!.cssRules);
      const mobileRule = rules.find(
        (rule): rule is CSSMediaRule =>
          rule instanceof CSSMediaRule && rule.conditionText.includes("(display-mode: standalone)"),
      );
      expect(mobileRule?.conditionText).toContain("(max-width: 640px)");
      expect(mobileRule?.conditionText).toContain("(hover: none) and (pointer: coarse)");
      const statusRule = Array.from(mobileRule!.cssRules).find(
        (rule): rule is CSSStyleRule =>
          rule instanceof CSSStyleRule && rule.selectorText === ".status-bar",
      );
      expect(statusRule?.style.getPropertyValue("display")).toBe("none");
      const appRule = rules.find(
        (rule): rule is CSSStyleRule =>
          rule instanceof CSSStyleRule && rule.selectorText === ".wallet-app",
      );
      expect(appRule?.style.getPropertyValue("box-sizing")).toBe("border-box");
      for (const side of ["top", "bottom", "left", "right"]) {
        expect(appRule?.style.getPropertyValue(`padding-${side}`)).toBe(
          `env(safe-area-inset-${side}, 0px)`,
        );
      }
    } finally {
      style.remove();
    }
  });
});
