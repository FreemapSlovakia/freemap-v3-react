const { parse, marked } = require('marked');

const renderer = {
  link(href, title, text) {
    const ext = href.match('^https?://')
      ? ' target="_blank" rel="noopener noreferrer"'
      : '';

    return `<a href="${href}" title="${title ?? ''}"${ext}>${text}</a>`;
  },
};

marked.use({ renderer });

module.exports = function markdownLoader(markdown) {
  const options = this.getOptions();

  return parse(markdown, options);
};
