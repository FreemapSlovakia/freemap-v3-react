/**
 * WebMCP — `document.modelContext`, the tools this page offers a browser AI
 * agent. Not in lib.dom yet; see doc/webmcp.md.
 */
interface ModelContextToolResultContent {
  type: 'text';
  text: string;
}

interface ModelContextToolResult {
  content: ModelContextToolResultContent[];
  isError?: boolean;
}

interface ModelContextToolDescriptor {
  name: string;
  description: string;
  /** JSON Schema of the argument object. */
  inputSchema?: unknown;
  execute(
    args: unknown,
    options?: { signal?: AbortSignal },
  ): ModelContextToolResult | Promise<ModelContextToolResult>;
}

interface ModelContextRegisterToolOptions {
  /** Aborting it unregisters the tool. */
  signal?: AbortSignal;
  /** Secure origins of in-page agents allowed to see and run the tool. */
  exposedTo?: string[];
}

interface ModelContext extends EventTarget {
  registerTool(
    tool: ModelContextToolDescriptor,
    options?: ModelContextRegisterToolOptions,
  ): Promise<void>;

  unregisterTool(name: string): Promise<void>;
}

interface Document {
  /** Absent unless the browser implements WebMCP; the API is secure-context only. */
  readonly modelContext?: ModelContext;
}

interface Navigator {
  /**
   * Where the API lived before Chrome 150 — which is every version the flag and
   * the origin trial run on, so it is not a legacy spelling yet.
   */
  readonly modelContext?: ModelContext;
}
