import z from 'zod';
import { GeoJSONPointSchema } from 'zod-geojson';
import { OSM_NOTE_ACTIONS, type OsmNote } from './actions.js';

export const OsmNoteFeatureSchema = z.object({
  geometry: GeoJSONPointSchema,
  properties: z.object({
    id: z.number(),
    comments: z.array(
      z.object({
        date: z.string(),
        user: z.string().optional(),
        action: z.enum(OSM_NOTE_ACTIONS).catch('commented'),
        text: z.string().default(''),
      }),
    ),
  }),
});

// The API writes `2024-01-31 12:34:56 UTC`, which `Date` doesn't parse everywhere.
const toIsoDate = (date: string) =>
  date.replace(' ', 'T').replace(/ UTC$/, 'Z');

export const toOsmNote = ({
  geometry,
  properties,
}: z.infer<typeof OsmNoteFeatureSchema>): OsmNote => ({
  id: properties.id,
  lat: geometry.coordinates[1],
  lon: geometry.coordinates[0],
  comments: properties.comments.map((comment) => ({
    date: toIsoDate(comment.date),
    user: comment.user,
    action: comment.action,
    text: comment.text,
  })),
});
