import { createAction } from '@reduxjs/toolkit';
import z from 'zod';

export const MailTargetSchema = z.enum(['event', 'picture', 'wikimedia']);

export type MailTarget = z.infer<typeof MailTargetSchema>;

export type MailWatchRef = { target: MailTarget; targetId: string | number };

export const mailWatchKey = ({ target, targetId }: MailWatchRef) =>
  `${target}/${targetId}`;

/** A photo by the viewer's id: a Commons one's is its negated pageId. */
export const pictureMailWatch = (id: number): MailWatchRef =>
  id < 0
    ? { target: 'wikimedia', targetId: -id }
    : { target: 'picture', targetId: id };

/** Fetches whether the user gets the emails about a target. */
export const mailWatchLoad = createAction<MailWatchRef>('MAIL_WATCH_LOAD');

/** Follows or mutes a target's emails. */
export const mailWatchToggle = createAction<
  MailWatchRef & { watching: boolean }
>('MAIL_WATCH_TOGGLE');

export const mailWatchSet = createAction<{
  key: string;
  userId: number;
  watching: boolean;
}>('MAIL_WATCH_SET');

export const mailWatchToggleDone = createAction<string>(
  'MAIL_WATCH_TOGGLE_DONE',
);
