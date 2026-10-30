import matter from 'gray-matter';
import { renderMarkdown } from './markdown-render.js';

export default function markdownLoader(markdown) {
  return renderMarkdown(matter(markdown).content, {
    file: this.resourcePath,
    onDependency: (file) => this.addDependency(file),
  });
}
