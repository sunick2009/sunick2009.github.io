'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('cheerio');
const root = path.resolve('public');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const files = walk(root);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const failures = [];
for (const file of htmlFiles) {
  const $ = load(fs.readFileSync(file, 'utf8'));
  if (!$('title').text().trim()) failures.push(`${file}: missing title`);
  $('a[href], link[href], script[src], img[src]').each((_, element) => {
    const value = $(element).attr('src') || $(element).attr('href');
    if (!value || value.startsWith('#')) return;
    const url = new URL(value, `https://sunick2009.github.io/${path.relative(root, file)}`);
    if (url.origin !== 'https://sunick2009.github.io') return;
    const target = path.join(root, decodeURIComponent(url.pathname));
    if (!fs.existsSync(target)) failures.push(`${path.relative(root, file)}: missing ${url.pathname}`);
  });
  if ($('script[src*="@latest"], link[href*="@latest"]').length) {
    failures.push(`${file}: unpinned executable CDN dependency`);
  }
}
for (const file of ['index.html', 'archives/index.html', 'tags/index.html', 'categories/index.html',
  'message board/index.html', 'link/index.html', 'search.xml', 'atom.xml', 'sitemap.xml',
  'css/index.css', 'css/custom.css', 'js/main.js', 'img/favicon.ico']) {
  assert(fs.existsSync(path.join(root, file)), `Missing output: ${file}`);
}
// Existing public URLs must survive framework and theme migrations.
const posts = [
  '2020/02/17/hello-world/', '2020/02/18/deploy/', '2020/02/23/note_1/',
  '2021/12/05/digital_forensics_2021_12_05/', '2022/03/05/digital_forensics_2022_03_05/'
];
const search = load(fs.readFileSync(path.join(root, 'search.xml'), 'utf8'), { xmlMode: true });
for (const post of posts) {
  const $ = load(fs.readFileSync(path.join(root, post, 'index.html'), 'utf8'));
  assert($('#article-container').text().trim().length > 20, `Empty article: ${post}`);
  assert.equal($('link[rel="canonical"]').attr('href'), `https://sunick2009.github.io/${post}`);
  assert($('#vcomment').length, `Missing Valine mount: ${post}`);
  assert(search('entry url').toArray().some(el => search(el).text().includes(post)), `Missing search entry: ${post}`);
}
assert.equal(search('entry').length, posts.length, 'Unexpected search post count');
const md = require('markdown-it')().use(require('../lib/markdown-it-twemoji'));
const emoji = load(md.render(':smile:'))('img');
assert(emoji.hasClass('emoji') && emoji.hasClass('no-lightbox'), 'Emoji renderer/lightbox regression');
assert(emoji.attr('src').includes(`twemoji@${require('@twemoji/api/package.json').version}/`), 'Emoji asset version changed');
assert.deepEqual(failures, [], 'Broken local links/assets or unsafe CDN version drift');
console.log(`PASS: ${htmlFiles.length} HTML pages, ${posts.length} preserved posts, local links/assets, search, RSS/sitemap, comments mounts and emoji.`);
