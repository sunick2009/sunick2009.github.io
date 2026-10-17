'use strict';

const { full } = require('markdown-it-emoji');
const twemoji = require('@twemoji/api');

module.exports = (md, options) => {
  md.use(full, options);
  md.renderer.rules.emoji = (tokens, index) => twemoji.parse(tokens[index].content, {
    className: 'emoji no-lightbox',
    base: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/',
    attributes: () => ({ loading: 'lazy' })
  });
};
