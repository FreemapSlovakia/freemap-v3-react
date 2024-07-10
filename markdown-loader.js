const { parse, marked } = require('marked');

const renderer = {
  link(href, title, text) {
    return `<a href="${href}" title="${title ?? ''}">${text}</a>`;
  },
};

marked.use({ renderer });

module.exports = function markdownLoader(markdown) {
  const options = this.getOptions();

  return parse(markdown, options);
};
