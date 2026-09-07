import type { MyStore } from '@app/store/store.js';
import z from 'zod';

/** What a tool gets besides its arguments: the store it acts on. */
export type ToolContext = {
  store: MyStore;
  signal?: AbortSignal | undefined;
};

export type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: unknown;
  execute(args: unknown, ctx: ToolContext): Promise<ModelContextToolResult>;
};

/**
 * A tool as the app writes it: arguments validated by its own zod schema (the
 * JSON Schema the agent sees is derived from it), and whatever it returns — or
 * throws — turned into a tool result. A non-string return is sent as JSON.
 */
export function defineTool<S extends z.ZodType>(def: {
  name: string;
  description: string;
  input: S;
  execute: (args: z.output<S>, ctx: ToolContext) => unknown;
}): WebMcpTool {
  return {
    name: def.name,
    description: def.description,
    inputSchema: z.toJSONSchema(def.input, { target: 'draft-7', io: 'input' }),
    async execute(args, ctx) {
      const parsed = def.input.safeParse(args ?? {});

      if (!parsed.success) {
        return toolError(`Invalid arguments: ${z.prettifyError(parsed.error)}`);
      }

      try {
        const result = await def.execute(parsed.data, ctx);

        return {
          content: [
            {
              type: 'text' as const,
              text:
                typeof result === 'string'
                  ? result
                  : JSON.stringify(result ?? { ok: true }),
            },
          ],
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  };
}

export function toolError(message: string): ModelContextToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}
