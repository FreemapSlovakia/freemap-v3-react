import matter from 'gray-matter';
import { marked, parse } from 'marked';

marked.use({
  renderer: {
    link({ href, title, text }) {
      const ext = href.match('^https?://')
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';

      return `<a href="${href}" title="${title ?? ''}"${ext}>${text}</a>`;
    },
  },
});

export default function markdownLoader(markdown) {
  return parse(matter(markdown).content, this.getOptions());
}
