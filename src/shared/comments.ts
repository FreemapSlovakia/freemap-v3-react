import { IsoDateSchema } from '@shared/types/common.js';
import z from 'zod';

/** How long after posting its author may edit a comment; the API enforces it. */
export const COMMENT_EDIT_WINDOW_MS = 60 * 60 * 1000;

/** A deleted comment keeps its place and time but neither its text nor its author. */
export const CommentSchema = z.object({
  id: z.number(),
  createdAt: IsoDateSchema,
  editedAt: IsoDateSchema.nullable().default(null),
  deletedAt: IsoDateSchema.nullable().default(null),
  deletedBy: z.enum(['author', 'owner', 'moderator']).nullable().default(null),
  comment: z.string().nullable(),
  user: z
    .object({
      id: z.number(),
      name: z.string(),
      hasPicture: z.boolean(),
      premium: z.boolean(),
    })
    .nullable(),
});

export type Comment = z.infer<typeof CommentSchema>;
