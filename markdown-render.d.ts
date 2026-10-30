export function renderMarkdown(
  markdown: string,
  options: {
    file: string;
    onDependency?: (file: string) => void;
    images?: boolean;
  },
): string;
