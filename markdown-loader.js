import { marked, parse } from 'marked';

const renderer = {
  link({ href, title, text }) {
    const ext = href.match('^https?://')
      ? ' target="_blank" rel="noopener noreferrer"'
      : '';

    return `<a href="${href}" title="${title ?? ''}"${ext}>${text}</a>`;
  },
};

marked.use({ renderer });

export default function markdownLoader(markdown) {
  return parse(markdown, this.getOptions());
}
