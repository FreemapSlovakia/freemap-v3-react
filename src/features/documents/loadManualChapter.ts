// Module scope: an `import()` in a component body stops the React Compiler
// lowering it.
export const loadManualChapter = (
  key: string,
  lang: string,
): Promise<{ default: string }> =>
  import(
    /* webpackChunkName: "manual-[request]" */
    `@/manual/${key}.${lang}.md`
  );
