#!/usr/bin/env node
/**
 * Converte assets/icon.svg → assets/icon.png via Chrome headless.
 * Uso: node scripts/svg-to-png.js
 * Dep:  npm install puppeteer --save-dev  (já instalado)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SIZE = 1024;
const SVG_PATH  = path.resolve(__dirname, '../assets/icon.svg');
const PNG_PATH  = path.resolve(__dirname, '../assets/icon.png');
const TMP_HTML  = path.resolve(__dirname, '../assets/.icon-tmp.html');

(async () => {
  const svgContent = fs.readFileSync(SVG_PATH, 'utf8');

  // Escreve um HTML explicitamente dimensionado — garante que o SVG
  // renderize exatamente em 1024×1024 sem escala ou scroll.
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${SIZE}px;
    height: ${SIZE}px;
    overflow: hidden;
    background: #000;
  }
  svg {
    display: block;
    width: ${SIZE}px !important;
    height: ${SIZE}px !important;
  }
</style>
</head>
<body>${svgContent}</body>
</html>`;

  fs.writeFileSync(TMP_HTML, html);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page    = await browser.newPage();

  // DPR explicitamente 1 — evita renderização em 2× em monitores retina
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });

  await page.goto(`file://${TMP_HTML}`, { waitUntil: 'networkidle0' });

  // Verifica se o SVG está com o tamanho certo antes de capturar
  const svgBounds = await page.evaluate(() => {
    const s = document.querySelector('svg');
    const r = s ? s.getBoundingClientRect() : null;
    return r ? { w: r.width, h: r.height } : null;
  });
  console.log('SVG renderizado em:', svgBounds);

  await page.screenshot({
    path: PNG_PATH,
    clip: { x: 0, y: 0, width: SIZE, height: SIZE },
  });

  await browser.close();
  fs.unlinkSync(TMP_HTML); // limpa o arquivo temporário

  console.log(`✓ Salvo em ${PNG_PATH}`);
})();
