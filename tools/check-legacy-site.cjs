'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const root = path.resolve('public');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const file = path.join(dir, e.name);
    return e.isDirectory() ? walk(file) : [file];
  });
}
const html = walk(root).filter(f => f.endsWith('.html'));
assert.equal(html.length, 27, 'Expected all existing pages');
for (const file of html) {
  const raw = fs.readFileSync(file, 'utf8');
  assert.equal((raw.match(/<html\b/gi) || []).length, 1, `${file}: nested HTML document`);
  const $ = cheerio.load(raw);
  assert($('title').text().trim(), `${file}: missing title`);
  for (const el of $('[href], [src]').toArray()) {
    const value = $(el).attr('href') || $(el).attr('src');
    if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) continue;
    const url = new URL(value, 'https://site.test/' + path.relative(root, file));
    let target = path.join(root, decodeURIComponent(url.pathname));
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    assert(fs.existsSync(target), `${file}: missing local target ${value}`);
  }
}
const posts = html.filter(f => /\/20\d\d\/\d\d\/\d\d\//.test(f));
assert.equal(posts.length, 5, 'Expected all five posts');
for (const file of posts) {
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
  assert($('#post-content').text().trim(), `${file}: missing article`);
}
for (const file of ['search.xml', 'atom.xml', 'sitemap.xml', 'service-worker.js']) {
  assert(fs.statSync(path.join(root, file)).size > 0, `${file}: empty output`);
}
const search = cheerio.load(fs.readFileSync(path.join(root, 'search.xml'), 'utf8'), { xmlMode: true });
assert.equal(search('entry').length, 5, 'Search must include five posts');
console.log(`PASS: ${html.length} pages, ${posts.length} posts, local targets, search, RSS, sitemap and service worker`);
