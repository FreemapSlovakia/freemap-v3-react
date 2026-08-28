import type { MyStore } from '@app/store/store.js';

/**
 * Offers what the app can do to a browser AI agent, as WebMCP tools over the
 * store. The tools are a chunk of their own, so a browser without the API
 * loads none of it.
 *
 * The API moved to `document` in Chrome 150; the flag (`enable-webmcp-testing`)
 * and the origin trial run on versions that have it on `navigator`, so both are
 * read. Says what it did either way — otherwise a browser that offers no tools
 * can only be told apart from a page that registered none by reading the bundle.
 */
export async function attachWebMcp(store: MyStore): Promise<void> {
  const modelContext = document.modelContext ?? window.navigator.modelContext;

  if (!modelContext) {
    console.info(
      'WebMCP: this browser exposes no modelContext, so no tools were offered.',
    );

    return;
  }

  const { webMcpTools } = await import(
    /* webpackChunkName: "webMcp" */ './tools/index.js'
  );

  await Promise.all(
    webMcpTools.map((tool) =>
      modelContext.registerTool({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        execute: (args, options) =>
          tool.execute(args, { store, signal: options?.signal }),
      }),
    ),
  );

  console.info(`WebMCP: offered ${webMcpTools.length} tools.`);
}
