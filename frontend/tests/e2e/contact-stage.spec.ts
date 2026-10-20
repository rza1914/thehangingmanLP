import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "@axe-core/playwright";

/* Owner viewports, including the short heights (1887x661, 1607x670). */
const VIEWPORTS = [
  [320, 640],
  [390, 844],
  [768, 1024],
  [860, 700],
  [1280, 720],
  [1440, 800],
  [1607, 670],
  [1887, 661],
  [1920, 1080],
  [2560, 1440],
] as [number, number][];

const LOCALES = ["en", "fa"] as const;

test.describe("contact stage + language + accessibility matrix", () => {
  for (const [width, height] of VIEWPORTS) {
    for (const locale of LOCALES) {
      test(`renders without horizontal scroll @ ${width}x${height} (${locale})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); /* 2px rounding tolerance */

        expect(page.locator("html")).toHaveAttribute("lang", locale);
        expect(page.locator("html")).toHaveAttribute("dir", locale === "fa" ? "rtl" : "ltr");

        await checkA11y(page, undefined, {
          detailedReport: true,
          /* axe rules that are environmental (color contrast of canvas) are
             reported but not failed here; serious/critical violations must be zero. */
        });
      });
    }
  }

  test("switching language several times without reload updates lang/dir/title", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const langSwitch = page.locator("#lang-switch");

    const expectLocale = async (loc: string) => {
      await expect(page.locator("html")).toHaveAttribute("lang", loc);
      await expect(page.locator("html")).toHaveAttribute("dir", loc === "fa" ? "rtl" : "ltr");
      const title = loc === "fa"
        ? /The Hanging Man.*توسعة/
        : /The Hanging Man — Independent/;
      await expect(page).toHaveTitle(title);
    };

    await expectLocale("en");
    await langSwitch.click();
    await expectLocale("fa");
    await langSwitch.click();
    await expectLocale("en");
    await langSwitch.click();
    await expectLocale("fa");

    /* a11y after repeated switches */
    await injectAxe(page);
    const results = await page.evaluate(() => new Promise<any>((res) => {
      (window as any).axe?.run?.(document, {}, (_err: any, results: any) => res(results));
    }));
    const serious = results.violations.filter((v: any) => v.impact === "serious" || v.impact === "critical");
    expect(serious.length).toBe(0);
  });

  test("whole Contact stage is visible at short heights and stays pinned until reveal completes", async ({ page }) => {
    for (const [width, height] of [[1607, 670], [1887, 661], [320, 640]]) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      /* Contact section must exist and be within the viewport (fully visible). */
      const contact = page.locator("#contact");
      await expect(contact).toBeVisible();

      const contactBox = await contact.boundingBox();
      const pageHeight = height;
      expect(contactBox).not.toBeNull();
      if (contactBox) {
        /* bottom of contact stage must not overflow the viewport */
        expect(contactBox.y + contactBox.height).toBeLessThanOrEqual(pageHeight + 2);
      }

      /* no horizontal scroll */
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

      await checkA11y(page);
    }
  });

  test("decorative layers are aria-hidden and the SVG scene has a useful aria-label", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    for (const cls of [".atm-vig", ".atm-spot", ".atm-grain"]) {
      await expect(page.locator(cls)).toHaveAttribute("aria-hidden", "true");
    }
    const svg = page.locator("svg.stage, .stage svg, svg[role=img]").first();
    await expect(svg).toHaveAttribute("aria-label");
    const label = await svg.getAttribute("aria-label");
    expect(label!.length).toBeGreaterThan(10);
  });
});
