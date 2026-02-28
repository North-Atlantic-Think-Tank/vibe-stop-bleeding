import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

/**
 * Convert markdown files to printable PDF
 * Usage: node agents/shared/md-to-pdf.js <md-file> [<md-file2> ...]
 */

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
];

async function findChrome() {
  for (const p of CHROME_PATHS) {
    try {
      await fs.access(p);
      return p;
    } catch {}
  }
  throw new Error('Chrome not found. Install Google Chrome or set CHROME_PATH env var.');
}

const CSS = `
  @page {
    margin: 2cm 2.5cm;
    size: A4;
  }

  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 11.5pt;
    line-height: 1.65;
    color: #1a1a1a;
    max-width: 100%;
  }

  h1 {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 22pt;
    font-weight: 800;
    color: #c0392b;
    border-bottom: 3px solid #c0392b;
    padding-bottom: 8px;
    margin-top: 0;
    margin-bottom: 16px;
    line-height: 1.2;
  }

  h2 {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 16pt;
    font-weight: 700;
    color: #2c3e50;
    margin-top: 28px;
    margin-bottom: 12px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
  }

  h3 {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 13pt;
    font-weight: 700;
    color: #34495e;
    margin-top: 20px;
    margin-bottom: 8px;
  }

  h4 {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11.5pt;
    font-weight: 700;
    color: #2c3e50;
    margin-top: 16px;
    margin-bottom: 6px;
  }

  p { margin: 0 0 10px 0; }

  blockquote {
    border-left: 4px solid #c0392b;
    margin: 16px 0;
    padding: 8px 16px;
    background: #fdf2f2;
    color: #333;
    font-style: italic;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 10.5pt;
  }

  th {
    background: #2c3e50;
    color: white;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: 700;
    text-align: left;
    padding: 8px 10px;
  }

  td {
    padding: 7px 10px;
    border-bottom: 1px solid #ddd;
  }

  tr:nth-child(even) td { background: #f8f9fa; }

  strong { color: #1a1a1a; }

  hr {
    border: none;
    border-top: 2px solid #e0e0e0;
    margin: 24px 0;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 24px;
  }

  li { margin-bottom: 4px; }

  code {
    background: #f4f4f4;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 10pt;
  }

  a {
    color: #c0392b;
    text-decoration: none;
  }

  .header-banner {
    background: #2c3e50;
    color: white;
    padding: 20px 24px;
    margin: 0 0 24px 0;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  .header-banner h1 {
    color: white;
    border-bottom: none;
    font-size: 14pt;
    margin: 0;
    padding: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .header-banner .date {
    color: #bdc3c7;
    font-size: 10pt;
    margin-top: 4px;
  }

  .header-banner .classification {
    display: inline-block;
    background: #c0392b;
    color: white;
    padding: 4px 12px;
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 8px;
  }
`;

async function convertMdToPdf(mdPath, outputDir) {
  const mdContent = await fs.readFile(mdPath, 'utf-8');

  // Strip YAML frontmatter and extract metadata
  let body = mdContent;
  let title = '';
  let date = '';
  let docType = '';

  const frontmatterMatch = mdContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const fm = frontmatterMatch[1];
    body = frontmatterMatch[2];

    const titleMatch = fm.match(/title:\s*"([^"]+)"/);
    if (titleMatch) title = titleMatch[1];

    const dateMatch = fm.match(/date:\s*"([^"]+)"/);
    if (dateMatch) date = dateMatch[1];

    const typeMatch = fm.match(/type:\s*"([^"]+)"/);
    if (typeMatch) docType = typeMatch[1];

    const actionMatch = fm.match(/action_type:\s*"([^"]+)"/);
    if (actionMatch) docType = actionMatch[1];
  }

  // Convert markdown to HTML
  marked.setOptions({ breaks: true, gfm: true });
  const htmlBody = await marked.parse(body);

  const classificationLabel = docType === 'open_letter'
    ? 'Open Letter'
    : docType === 'evaluation'
      ? 'MP Performance Evaluation'
      : 'Official Document';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${CSS}</style>
</head>
<body>
  <div class="header-banner">
    <h1>stopbleeding.ca</h1>
    <div class="date">${date ? new Date(date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</div>
    <div class="classification">${classificationLabel}</div>
  </div>
  ${htmlBody}
</body>
</html>`;

  // Generate PDF
  const chromePath = process.env.CHROME_PATH || await findChrome();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const basename = path.basename(mdPath, '.md');
  const pdfPath = path.join(outputDir, `${basename}.pdf`);

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '2cm', bottom: '2.5cm', left: '2.5cm', right: '2.5cm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `
      <div style="width: 100%; text-align: center; font-size: 9px; color: #999; font-family: Arial, sans-serif;">
        stopbleeding.ca &mdash; Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `,
  });

  await browser.close();

  const stats = await fs.stat(pdfPath);
  console.log(`✅ ${path.basename(pdfPath)} (${Math.round(stats.size / 1024)} KB)`);
  return pdfPath;
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node agents/shared/md-to-pdf.js <markdown-file> [<file2> ...]');
  console.error('  Output goes to public/pdf/');
  process.exit(1);
}

const outputDir = path.join(process.cwd(), 'public/pdf');
await fs.mkdir(outputDir, { recursive: true });

console.log('📄 Converting markdown to PDF...\n');

for (const file of args) {
  const fullPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  try {
    await convertMdToPdf(fullPath, outputDir);
  } catch (err) {
    console.error(`❌ Failed: ${file} — ${err.message}`);
  }
}

console.log(`\n📁 PDFs saved to: ${outputDir}`);

export { convertMdToPdf };
