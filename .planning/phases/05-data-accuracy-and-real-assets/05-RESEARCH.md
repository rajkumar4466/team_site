# Phase 5: Data Accuracy and Real Assets - Research

**Researched:** 2026-02-26
**Domain:** Playwright web scraping + static asset management (IPL stats data + player/gallery photography)
**Confidence:** MEDIUM — scraping targets identified and verified, photo sourcing has legal constraints requiring human decision

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | Season-by-season KKR record data is accurate and sourced from official IPL statistics (via Playwright scraping) | Playwright library API verified; iplt20.com/teams/kolkata-knight-riders/archive confirmed as scraping target; Wikipedia as fallback; data structure in src/data/stats.ts is ready to receive updates |
| DATA-02 | All-time top KKR run-scorers and wicket-takers data is accurate and sourced from official IPL statistics (via Playwright scraping) | ESPNcricinfo player pages confirmed as data source; data inaccuracies in current stats.ts documented; TopPerformer type structure is sufficient |
| PHOTO-01 | Player profile pages and squad tiles display real player photographs | Player.imageUrl field already exists; public/images/players/ directory convention documented; approach decision (external CDN vs local files) documented |
| PHOTO-02 | Gallery page displays real action photographs of KKR players | GalleryPhoto.url field already exists; public/images/gallery/ convention documented; photo sourcing legal constraints documented |
</phase_requirements>

---

## Summary

Phase 5 has two independent workstreams: (1) Playwright data scraping to replace inaccurate stats in `src/data/stats.ts`, and (2) real photography to replace placeholder images in `src/data/players.ts` and `src/data/gallery.ts`.

The **stats workstream** is technically straightforward. Playwright can run as a standalone Node.js script (no test runner required) and scrape iplt20.com or ESPNcricinfo. The current `stats.ts` contains verifiably inaccurate data — KKR 2025 season is missing entirely, the 2021 season shows wrong position (they were runners-up, not 6th), and top performer totals are estimated/wrong (Sunil Narine has ~192 IPL wickets total, not 178 for KKR specifically; Gautam Gambhir is not in the current top-5 list but should be). A standalone scraping script in `/scripts/` writes corrected JSON that gets manually reviewed and pasted into `stats.ts`.

The **photos workstream** has a critical legal constraint: using real named professional cricket player photographs without licensing is a copyright violation. The recommended approach for a fan site demo is using Wikimedia Commons (CC BY-SA) licensed photos where available, and continuing with styled placeholders for players with no freely-licensed images — but crucially updating the placeholder approach to use real names/numbers in a more visually appealing way. For gallery images, the approach is external CDN URLs (ESPNcricinfo or Getty embeds) or Wikimedia Commons, not locally stored files. Storing unlicensed Getty/ESPNcricinfo images in `public/` would be a copyright violation.

**Primary recommendation:** Run a Playwright scraping script for DATA-01 and DATA-02 with manual verification against Wikipedia's season table. For PHOTO-01 and PHOTO-02, use Wikimedia Commons CC-licensed images where available, external embed URLs otherwise, and improve placeholder styling as a fallback.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| playwright | ^1.x (latest) | Browser automation for scraping JS-rendered cricket stats pages | Official Playwright library (not @playwright/test); used as a standalone script not a test runner; handles dynamic content that fetch/axios cannot |
| fs (Node.js built-in) | Node built-in | Write scraped data to JSON files | No install needed; standard pattern for persisting scrape output |
| typescript | ^5 (already installed) | Type-safe scraping scripts | Already in devDependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ts-node | ^10.x | Run TypeScript scraping scripts directly | If scripts are written in TypeScript |
| node (built-in) | Node.js v18+ | Run compiled JS scraping scripts | If scripts are compiled first; avoids ts-node dependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| playwright | cheerio + axios | Cheerio cannot handle JavaScript-rendered pages; IPL stats sites use React SPAs — cheerio will get empty shells |
| playwright | puppeteer | Playwright is considered more developer-friendly and has better TypeScript support; both work for this use case |
| local files in public/ | External CDN URLs | External URLs avoid copyright storage issues but create runtime dependency; local files are faster but require licensing |

**Installation:**
```bash
# Install Playwright library (NOT @playwright/test — we want standalone scripting)
npm install --save-dev playwright

# Install Chromium browser (only browser needed for scraping)
npx playwright install chromium
```

Note: `playwright` (the library) and `@playwright/test` (the test runner) are different packages. Use `playwright` for standalone scripts.

---

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── scrape-stats.js        # Playwright scraping script (run with: node scripts/scrape-stats.js)
├── scraped-stats.json     # Output: raw scraped data (review before applying)
└── README.md              # Documents how to run scrapes and update data files

public/
└── images/
    ├── players/           # Player headshots (400x500px, JPG)
    │   ├── shreyas-iyer.jpg
    │   └── sunil-narine.jpg
    └── gallery/           # Action shots (600x400px, JPG)
        ├── shreyas-iyer-1.jpg
        └── shreyas-iyer-2.jpg

src/data/
├── stats.ts               # Updated with scraped, verified data
├── players.ts             # Updated imageUrl to /images/players/{id}.jpg
└── gallery.ts             # Updated photo urls to /images/gallery/{id}-{n}.jpg or external CDN
```

### Pattern 1: Standalone Playwright Scraping Script
**What:** A plain Node.js async script that launches Chromium, navigates to a cricket stats page, waits for content to render, extracts data into a JS object, and writes it to a JSON file.
**When to use:** Any JavaScript-rendered page where HTML is not in the initial response.
**Example:**
```javascript
// scripts/scrape-stats.js
// Source: playwright.dev/docs/library
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate with domcontentloaded then wait for specific element
  await page.goto('https://www.iplt20.com/teams/kolkata-knight-riders/archive', {
    waitUntil: 'domcontentloaded'
  });

  // Wait for the actual data element (selector TBD from page inspection)
  await page.waitForSelector('table', { timeout: 10000 });

  // Extract table rows
  const rows = await page.$$eval('table tr', rows =>
    rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      return cells.map(cell => cell.innerText.trim());
    })
  );

  // Filter empty rows, parse into SeasonRecord objects
  const seasonData = rows
    .filter(r => r.length >= 3)
    .map(r => ({ raw: r })); // inspect output first, then parse

  fs.writeFileSync('./scripts/scraped-stats.json', JSON.stringify(seasonData, null, 2));
  console.log(`Scraped ${seasonData.length} rows. Check scraped-stats.json.`);

  await browser.close();
})();
```

Run with:
```bash
node scripts/scrape-stats.js
```

### Pattern 2: Verify-Then-Apply (Two-Step Data Update)
**What:** Scraping produces a raw JSON file that a human reviews before updating the TypeScript data files.
**When to use:** All data updates — never auto-apply scraped data directly to source files without human review.
**Steps:**
1. Run scraping script → produces `scraped-stats.json`
2. Human reviews output against Wikipedia/official sources
3. Human manually updates `src/data/stats.ts` (or script transforms and applies)
4. `npm run build` confirms no TypeScript errors

### Pattern 3: Playwright Locator-Based Extraction
**What:** Use Playwright's `locator.allInnerTexts()` instead of `$$eval` for cleaner syntax.
**Example:**
```javascript
// Source: playwright.dev/docs/api/class-locator
// More readable than $$eval for simple extractions
const columnValues = await page.locator('td.stat-value').allInnerTexts();
```

### Anti-Patterns to Avoid
- **Scraping and directly overwriting source files:** Always write to an intermediate JSON file for human review first. Cricket stats sites can have inconsistent data; human verification is mandatory.
- **Using `waitUntil: 'networkidle'`:** Unreliable on SPA cricket sites that make continuous background API calls. Use `domcontentloaded` + `waitForSelector(specific-element)` instead.
- **Storing copyrighted images in public/:** ESPNcricinfo and Getty photos are copyrighted. Do not download and store them in `public/`. Use Wikimedia Commons CC-licensed images or external embed URLs.
- **Scraping player card images from official IPL/ESPNcricinfo:** These images belong to the broadcaster/sports authority. For a fan demo site, prefer Wikimedia Commons or acknowledge placeholder approach.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Waiting for JS-rendered content | Custom sleep/retry loops | `page.waitForSelector()` or `waitForLoadState()` | Playwright's built-in waiter handles race conditions, respects timeouts cleanly |
| Handling browser lifecycle | Manual fetch with headers | `chromium.launch()` + `page.goto()` | Handles cookies, redirects, SPAs, JS execution automatically |
| CSS selector debugging | Trial-and-error in code | Playwright's `page.pause()` in non-headless mode | Opens inspector; identify correct selectors interactively |
| Photo resizing | Custom canvas/sharp scripts | Download source at correct size | Wikimedia Commons provides multiple resolutions; pick 400x500 directly |

**Key insight:** The scraping domain's main complexity is page-specific selector discovery, not the scripting itself. Build the script after manually inspecting the target page's DOM in browser DevTools.

---

## Known Data Inaccuracies in Current stats.ts

The following inaccuracies were verified through web research. The scraping phase MUST correct them:

### Season Records (src/data/stats.ts — seasonRecords)
| Year | Current Data (Wrong) | Verified Correct | Source |
|------|---------------------|------------------|--------|
| 2021 | position: 6, title: false | position: 2 (runners-up), title: false | CSK beat KKR in 2021 IPL Final by 27 runs — confirmed ESPNcricinfo |
| 2025 | Missing entirely | 5 wins, ~7-9 losses, position: 8, title: false | IPL 2025: KKR failed to qualify for playoffs, finished 8th |

### Top Performers (src/data/stats.ts — topPerformers)
| Entry | Current (Likely Wrong) | Verified Correct | Source |
|-------|----------------------|------------------|--------|
| Sunil Narine runs: 3500 | Likely inflated estimate | ~1507 total IPL runs (not 3500); KKR-specific runs need scraping | ESPNcricinfo career stats |
| Sunil Narine wickets: 178 | KKR-only total | ~192 wickets total IPL career (may include 14 for other teams) | Multiple sources confirm ~192 total |
| Gautam Gambhir absent | Missing from list | KKR career: ~3035 runs (most in KKR history at time of retirement) | Multiple sources; should be in top-5 |
| Robin Uthappa runs: 3145 | Likely inflated | KKR career: ~2649 runs in 91 games | Fantasy cricket stats site |

**Confidence:** MEDIUM — these figures need authoritative scraping to confirm; treated as verified enough to flag for correction.

---

## Common Pitfalls

### Pitfall 1: SPA Cricket Stats Pages Render Empty HTML
**What goes wrong:** `page.goto()` succeeds but `page.content()` returns skeleton HTML with no stats data — the data loads via API calls after page mount.
**Why it happens:** IPL and ESPNcricinfo use React SPAs that fetch data client-side.
**How to avoid:** Always use `waitForSelector('table')` or a known data element after `goto()`. If the table doesn't appear within 10s, the page architecture has changed.
**Warning signs:** Scraped JSON has empty arrays or only header rows.

### Pitfall 2: Site Structure Changes Between Sessions
**What goes wrong:** Selectors that worked yesterday fail today — the site deployed an update.
**Why it happens:** Sports sites update frequently around match seasons.
**How to avoid:** Run with `headless: false` initially to visually verify the page. Document the exact selectors used and the date they were verified.
**Warning signs:** Script produces zero or malformed rows.

### Pitfall 3: Player Stats Are Franchise-Specific vs Career-Total
**What goes wrong:** Scraping "Sunil Narine IPL stats" returns total career figures across all franchises, not just KKR seasons.
**Why it happens:** ESPNcricinfo shows career totals by default. KKR stats require filtering.
**How to avoid:** For TopPerformer data, use KKR-specific filtered views on ESPNcricinfo or the KKR team stats pages. Cross-verify with kkr.in/stats.
**Warning signs:** Run totals seem implausibly high or low for the stated number of seasons.

### Pitfall 4: Copyright Violation with Player Photos
**What goes wrong:** Images scraped/downloaded from ESPNcricinfo, Getty, or IPL sites are stored in `public/` and deployed.
**Why it happens:** Easy to grab an image URL and download it without considering copyright.
**How to avoid:** Only store images in `public/` that are confirmed CC-licensed (Wikimedia Commons) or that you have explicit rights to. For all others, use external embed URLs (the image stays on the rights-holder's CDN, you reference via URL — still legally grey) or use improved placeholders.
**Warning signs:** Image file comes from a sports media organization's CDN.

### Pitfall 5: Playwright Installed as Wrong Package
**What goes wrong:** `npm install @playwright/test` installs the test runner; standalone scripts then fail or require test framework.
**Why it happens:** `@playwright/test` and `playwright` are different npm packages.
**How to avoid:** Install `playwright` (the library) and `@playwright/test` separately. For scraping scripts only, install `playwright`.
**Warning signs:** Script imports fail or require `test()` blocks to run.

### Pitfall 6: Photos Cause Next.js Build Failures
**What goes wrong:** `src/data/gallery.ts` references `/images/gallery/*.jpg` paths that don't exist — `<img>` tags show broken images (404), not build failures.
**Why it happens:** `<img>` tags (not next/image) don't validate paths at build time.
**How to avoid:** After placing images in `public/images/`, verify in dev server that 0 images show 404 in browser Network tab. Run `npm run build` to confirm no TypeScript errors from updated data files.
**Warning signs:** Browser shows broken image icons; Network tab shows 404 for image paths.

---

## Code Examples

### Playwright Standalone Script — Full Pattern
```javascript
// scripts/scrape-stats.js
// Source: playwright.dev/docs/library
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

    // Wait for data to render — selector must be confirmed by DevTools inspection
    await page.waitForSelector('table', { timeout: 15000 });

    // Extract all table text — inspect raw output first before parsing
    const tableData = await page.$$eval('table tr', rows =>
      rows.map(row => ({
        cells: Array.from(row.querySelectorAll('td, th')).map(c => c.innerText.trim())
      }))
    );

    fs.writeFileSync('./scripts/scraped-stats.json', JSON.stringify(tableData, null, 2));
    console.log('Scraped', tableData.length, 'rows. Review scraped-stats.json before applying.');
  } catch (err) {
    console.error('Scraping failed:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
```

### Updating Player imageUrl After Placing Photos
```typescript
// src/data/players.ts (partial — update imageUrl fields)
// Pattern: /images/players/{player-id}.jpg
// Images live at: public/images/players/{player-id}.jpg
// Source: nextjs.org/docs/pages/api-reference/file-conventions/public-folder

{
  id: "shreyas-iyer",
  // ... other fields unchanged ...
  imageUrl: "/images/players/shreyas-iyer.jpg",  // file: public/images/players/shreyas-iyer.jpg
}
```

### Updating Gallery URLs After Placing Photos
```typescript
// src/data/gallery.ts (partial — update photo url fields)
// Pattern: /images/gallery/{player-id}-{n}.jpg
// Images live at: public/images/gallery/{player-id}-{n}.jpg

{
  url: "/images/gallery/shreyas-iyer-1.jpg",  // file: public/images/gallery/shreyas-iyer-1.jpg
  alt: "Shreyas Iyer plays a cover drive at Eden Gardens",
  caption: "Elegant cover drive, IPL 2024",
}
```

### Playwright Locator API for Text Extraction
```javascript
// Source: playwright.dev/docs/api/class-locator
// Simpler than $$eval for straightforward text extraction
const statCells = await page.locator('td.stats-cell').allInnerTexts();
// Returns: ['2024', '11', '3', '1', 'Champion', ...]
```

---

## Scraping Target Analysis

### Target 1: iplt20.com — Season Records (DATA-01)
| Property | Value |
|----------|-------|
| URL | `https://www.iplt20.com/teams/kolkata-knight-riders/archive` |
| robots.txt | `Allow: /` with only `/cgi-bin/` disallowed — general crawling allowed |
| Content type | JavaScript SPA — requires Playwright (not fetch) |
| Data needed | Year, wins, losses, no results, final position, title |
| Confidence | MEDIUM — URL confirmed, DOM selectors must be verified via browser inspection |

### Target 2: Wikipedia — Season Records Verification (DATA-01 fallback)
| Property | Value |
|----------|-------|
| URL | `https://en.wikipedia.org/wiki/List_of_Indian_Premier_League_seasons_and_results` |
| Access | Open, no robots restrictions |
| Content type | Standard HTML table — can use direct fetch or Playwright |
| Use case | Cross-reference or manual copy if iplt20.com is hard to scrape |
| Confidence | HIGH — Wikipedia confirmed as having complete year-by-year table |

### Target 3: ESPNcricinfo — Top Performers (DATA-02)
| Property | Value |
|----------|-------|
| URL | `https://www.espncricinfo.com/team/kolkata-knight-riders-335971` or individual player pages |
| Access | 403 on direct fetch — requires browser (Playwright) with realistic User-Agent |
| Content type | JavaScript SPA — requires Playwright |
| Data needed | KKR career runs, wickets per player |
| Confidence | MEDIUM — known to require Playwright; KKR-specific filter must be applied |

### Target 4: kkr.in/stats — Top Performers (DATA-02 alternative)
| Property | Value |
|----------|-------|
| URL | `https://www.kkr.in/stats` |
| Access | Returned 403 on direct fetch — may need browser |
| Content type | Unknown — needs inspection |
| Use case | Official KKR franchise stats |
| Confidence | LOW — 403 in fetch testing; may require Playwright |

---

## Photo Sourcing Decision

### Legal Summary
**High risk:** Downloading and storing in `public/` any photo from ESPNcricinfo, Getty, IPL official site, or news agencies. These are copyrighted works.

**Low risk options:**
1. **Wikimedia Commons CC-licensed photos** — Search `commons.wikimedia.org` for each player name. Many cricket players have CC BY-SA photos from press conferences or matches. You must store attribution.
2. **External URL references** — Keep the `imageUrl` as an external CDN URL (e.g., a Wikimedia Commons image URL). Image is served from their CDN, no local storage copyright risk. Legal grey area but widely practiced for fan sites.
3. **Improved placeholders** — Keep `placehold.co` pattern but improve design. This is the safest option for a demo fan site.

### Recommended Approach for This Fan Demo Site

**Player profile photos (PHOTO-01):**
- Search Wikimedia Commons for each of the 16 players
- If CC-licensed image found: use external Wikimedia URL in `imageUrl` field (no download needed)
- If not found: keep improved placeholder (update `placehold.co` URL with better dimensions/text)
- Do NOT download from news agency CDNs

**Gallery action shots (PHOTO-02):**
- Gallery requires 3+ action shots per player × 6 players = 18+ photos
- Wikimedia Commons likely has few action shots (mostly headshots)
- Realistic option: use Wikimedia Commons headshot as placeholder-replacement; leave gallery with styled placeholder backgrounds (current approach) and note this as a known limitation
- Alternative: source from Freepik free tier (requires attribution, non-commercial use)

**Note:** The REQUIREMENTS say "real action photographs" — the honest research finding is that freely-licensed cricket action photography is scarce. Planner should scope PHOTO-02 as a best-effort: use available licensed photos, acknowledge that full gallery replacement requires paid stock or custom photography.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| `cheerio` + `axios` scraping | Playwright headless browser | Cricket stats sites are React SPAs — old approach gets empty HTML |
| `puppeteer` | `playwright` | Playwright has better TypeScript support and cross-browser API |
| `waitUntil: 'networkidle'` | `domcontentloaded` + `waitForSelector` | More reliable; networkidle hangs on sites with long-poll requests |
| Storing all assets locally | Mix of local + CDN | Copyright awareness means licensed images stored locally, others referenced |

**Deprecated/outdated:**
- `page.waitForTimeout(3000)` (arbitrary sleep): Replaced by `waitForSelector()` and `waitForLoadState()` — never use fixed sleeps in scraping scripts.

---

## Open Questions

1. **Which exact DOM selectors does iplt20.com use for the KKR archive table?**
   - What we know: URL is confirmed, robots.txt allows crawling, page uses a React SPA
   - What's unclear: Exact CSS selectors for season rows — must be determined by browser inspection
   - Recommendation: Wave 0 task should be "inspect iplt20.com/teams/kolkata-knight-riders/archive in DevTools, document selectors"

2. **Does kkr.in/stats have reliable machine-readable data or is it image-heavy?**
   - What we know: The URL exists (referenced in search results), returned 403 in direct fetch
   - What's unclear: Whether content is scrapable or is Flash/image-based
   - Recommendation: Fallback to Wikipedia for season records and ESPNcricinfo for player stats if kkr.in is not scrapable

3. **How many of the 16 KKR players have Wikimedia Commons CC-licensed headshots?**
   - What we know: Wikimedia Commons has 58M+ files, many cricket players are covered
   - What's unclear: Coverage for all 16 current KKR squad members
   - Recommendation: Planner should scope PHOTO-01 as "search WC for each player; use external URL if found, improved placehold.co if not" — do not block on finding all 16

4. **Is IPL 2025 already in the data (KKR finished 8th, 5 wins)?**
   - What we know: IPL 2025 is complete, KKR finished 8th with ~5 wins, 7+ losses
   - What's unclear: Exact final wins/losses count (sources said 5W, 6-7L, 2NR across different game counts)
   - Recommendation: Scrape official results for exact numbers; Wikipedia's 2025 season article is confirmed as available

---

## Sources

### Primary (HIGH confidence)
- `playwright.dev/docs/library` — Standalone library usage, installation, browser launch pattern, async IIFE pattern verified
- `playwright.dev/docs/api/class-locator` — `allInnerTexts()`, `allTextContents()`, `all()` locator methods verified
- `nextjs.org/docs/pages/api-reference/file-conventions/public-folder` — Static file serving from `public/` directory, path convention verified

### Secondary (MEDIUM confidence)
- `iplt20.com/robots.txt` — Fetched directly; `Allow: /` confirmed, only `/cgi-bin/` disallowed
- `en.wikipedia.org/wiki/2021_Indian_Premier_League_final` — KKR runners-up in 2021 confirmed; CSK won by 27 runs
- `espncricinfo.com/cricketers/sunil-narine-230558` — Sunil Narine career: ~192 IPL wickets, ~1507 IPL runs (confirmed across multiple sources)
- Wikipedia + multiple sports sites — Gautam Gambhir KKR runs: ~3035 (confirmed range 3035-3345 depending on source; authoritative scraping needed)
- Multiple sources — KKR IPL 2025: 5 wins, failed to qualify for playoffs, finished 8th

### Tertiary (LOW confidence)
- Fantasy cricket sites — Robin Uthappa KKR career runs ~2649 (single source; needs scraping confirmation)
- Quora and stock photo sites — Photo copyright guidance is general best-practices; not legal advice

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Playwright library vs test runner distinction verified; npm install command confirmed
- Scraping targets: MEDIUM — URLs and robots.txt confirmed; exact DOM selectors unknown until page inspection
- Data inaccuracies: MEDIUM — Key errors confirmed (2021 position, Narine stats, missing Gambhir); exact corrections need scraping
- Photo sourcing: MEDIUM — Legal framework understood; per-player Wikimedia coverage unknown
- Architecture: HIGH — Pattern is well-established Node.js + Playwright + fs.writeFileSync

**Research date:** 2026-02-26
**Valid until:** 2026-03-26 (IPL sites update for new season; selector discovery needed before coding)
