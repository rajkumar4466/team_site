// scripts/scrape-top-performers.js
// Target URLs:
//   Batting: https://stats.espncricinfo.com/ci/engine/records/batting/most_runs_career.html?id=335971;team=335971;type=team
//   Bowling: https://stats.espncricinfo.com/ci/engine/records/bowling/most_wickets_career.html?id=335971;team=335971;type=team
// Date: 2026-02-26
// Note: DOM selectors were determined by browser inspection of the live page.
//
// Purpose: Scrape KKR top performers (batting + bowling) from ESPNcricinfo.
// ESPNcricinfo returns 403 on plain fetch — Playwright with realistic User-Agent is required.
// Output:
//   scripts/scraped-top-performers-batting.json (raw batting data for human review)
//   scripts/scraped-top-performers-bowling.json (raw bowling data for human review)
//
// Run with: node scripts/scrape-top-performers.js
// DO NOT run with ts-node or any TypeScript runner — this is plain JavaScript.
// IMPORTANT: Uses 'playwright' (standalone library), NOT '@playwright/test' (test runner).
//
// Pattern: verify-then-apply — this script writes JSON, never overwrites src/data/stats.ts directly.
// A human reviews both JSON files before applying changes to stats.ts.

const { chromium } = require('playwright');
const fs = require('fs');

const BATTING_URL =
  'https://stats.espncricinfo.com/ci/engine/records/batting/most_runs_career.html?id=335971;team=335971;type=team';
const BOWLING_URL =
  'https://stats.espncricinfo.com/ci/engine/records/bowling/most_wickets_career.html?id=335971;team=335971;type=team';

// Scrape a single ESPNcricinfo stats page and return rows
async function scrapePage(page, url, outputFile, label) {
  console.log(`\nNavigating to ${label} page...`);
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  let rows = [];
  let blocked = false;

  // Check for 403 / blocked response by inspecting page title or body content
  const title = await page.title();
  const status = await page.evaluate(() => {
    const body = document.body ? document.body.innerText : '';
    // Check for common 403 / block indicators
    if (body.includes('403') || body.includes('Access Denied') || body.includes('blocked')) {
      return 'blocked';
    }
    return 'ok';
  });

  if (status === 'blocked' || title.toLowerCase().includes('403') || title.toLowerCase().includes('access denied')) {
    blocked = true;
    console.warn(`WARNING: ESPNcricinfo blocked — use Wikipedia or manual data for top performers. Check scraped JSON for empty/error content.`);
    rows = [];
  } else {
    // Wait for the stats table to appear
    try {
      await page.waitForSelector('table.engineTable, table[class*="table"]', { timeout: 15000 });
    } catch (err) {
      console.warn(`Table not found on ${label} page within 15s — may be blocked or page structure changed.`);
      // Try generic table as last resort
      try {
        await page.waitForSelector('table', { timeout: 5000 });
      } catch (_) {
        console.warn(`No table found at all on ${label} page.`);
      }
    }

    // Extract table rows as raw text arrays
    rows = await page.$$eval('table tr', (trs) =>
      trs.map((row) => ({
        cells: Array.from(row.querySelectorAll('td, th')).map((c) => c.innerText.trim())
      }))
    );
  }

  // Warn if data appears empty or suspiciously sparse
  if (rows.length < 2) {
    console.warn(`ESPNcricinfo blocked — use Wikipedia or manual data for top performers. Check scraped JSON for empty/error content.`);
  }

  const output = { rows, blocked, source: url };
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`${label}: scraped ${rows.length} rows → ${outputFile}`);

  return rows.length;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    // Scrape batting stats
    const battingRows = await scrapePage(
      page,
      BATTING_URL,
      './scripts/scraped-top-performers-batting.json',
      'Batting (KKR most runs)'
    );

    // Navigate to bowling stats on the same page
    const bowlingRows = await scrapePage(
      page,
      BOWLING_URL,
      './scripts/scraped-top-performers-bowling.json',
      'Bowling (KKR most wickets)'
    );

    console.log('\nScraping complete.');
    console.log(`  Batting rows: ${battingRows}`);
    console.log(`  Bowling rows: ${bowlingRows}`);
    console.log('Review both JSON files before applying to stats.ts');

  } catch (err) {
    console.error('Scraping failed:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
