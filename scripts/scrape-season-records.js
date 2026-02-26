// scripts/scrape-season-records.js
// Target URL: https://www.iplt20.com/teams/kolkata-knight-riders/archive
// Date: 2026-02-26
// Note: DOM selectors were determined by browser inspection of the live page.
//
// Purpose: Scrape KKR season-by-season records from iplt20.com.
// Output: scripts/scraped-season-records.json (raw data for human review)
//
// Run with: node scripts/scrape-season-records.js
// DO NOT run with ts-node or any TypeScript runner — this is plain JavaScript.
// IMPORTANT: Uses 'playwright' (standalone library), NOT '@playwright/test' (test runner).
//
// Pattern: verify-then-apply — this script writes JSON, never overwrites src/data/stats.ts directly.
// A human reviews scraped-season-records.json before applying changes to stats.ts.

const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; research-bot/1.0)'
  });
  const page = await context.newPage();

  try {
    await page.goto('https://www.iplt20.com/teams/kolkata-knight-riders/archive', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait for a table or data element — try specific selector first, then fall back
    let tableFound = false;
    try {
      await page.waitForSelector('table', { timeout: 15000 });
      tableFound = true;
      console.log('Found table element on page');
    } catch (err) {
      console.warn('No <table> found within 15s, trying alternate selectors...');
      try {
        await page.waitForSelector('.standings-table, .archive-table, [class*="table"]', { timeout: 10000 });
        tableFound = true;
        console.log('Found alternate table element on page');
      } catch (altErr) {
        console.warn('No table found with alternate selectors either. Extracting page content as-is.');
      }
    }

    let tableData = [];

    if (tableFound) {
      // Extract ALL table rows including headers — each row is { cells: string[] }
      tableData = await page.$$eval('table tr', (rows) =>
        rows.map((row) => ({
          cells: Array.from(row.querySelectorAll('td, th')).map((c) => c.innerText.trim())
        }))
      );
    } else {
      // Fallback: extract any visible text from the page body for manual inspection
      const bodyText = await page.evaluate(() => document.body.innerText);
      tableData = [{ cells: ['FALLBACK_BODY_TEXT'], raw: bodyText.slice(0, 5000) }];
    }

    const outputPath = './scripts/scraped-season-records.json';
    fs.writeFileSync(outputPath, JSON.stringify(tableData, null, 2));
    console.log(`Scraped ${tableData.length} rows. Review scripts/scraped-season-records.json before applying to stats.ts`);

  } catch (err) {
    console.error('Scraping failed:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
