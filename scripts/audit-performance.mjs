import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const url = process.argv[2] || 'http://localhost:3000/';
const prefix = process.argv[3] || 'qa-artifacts/mobile-performance';
const target = new URL(url);
const localTls = target.protocol === 'https:' && ['localhost', '127.0.0.1'].includes(target.hostname);
const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', ...(localTls ? ['--ignore-certificate-errors'] : [])] });
try {
  const result = await lighthouse(url, { port: chrome.port, output: ['json', 'html'], onlyCategories: ['performance'], logLevel: 'error' });
  if (!result) throw new Error('Lighthouse did not produce a report');
  await mkdir(path.dirname(prefix), { recursive: true });
  await writeFile(`${prefix}.json`, result.report[0]);
  await writeFile(`${prefix}.html`, result.report[1]);
  const { audits } = result.lhr;
  const protocol = audits['network-requests'].details.items.find(item => item.resourceType === 'Document')?.protocol;
  const summary = { url, protocol, score: Math.round(result.lhr.categories.performance.score * 100), lcpMs: audits['largest-contentful-paint'].numericValue, fcpMs: audits['first-contentful-paint'].numericValue, tbtMs: audits['total-blocking-time'].numericValue, cls: audits['cumulative-layout-shift'].numericValue, bytes: audits['total-byte-weight'].numericValue, warnings: result.lhr.runWarnings };
  console.log(JSON.stringify(summary, null, 2));
  if (result.lhr.runtimeError) throw new Error(result.lhr.runtimeError.message);
} finally {
  await chrome.kill();
}
