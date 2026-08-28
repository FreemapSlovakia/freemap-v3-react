import type { MyStore } from '@app/store/store.js';

/**
 * Offers what the app can do to a browser AI agent, as WebMCP tools over the
 * store. The tools are a chunk of their own, so a browser without
 * `document.modelContext` loads none of it.
 */
export async function attachWebMcp(store: MyStore): Promise<void> {
  const { modelContext } = document;

  if (!modelContext) {
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
}
