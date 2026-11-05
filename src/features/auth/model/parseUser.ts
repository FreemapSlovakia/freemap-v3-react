import {
  RawUserSchema,
  type User,
  type UserSettings,
  UserSettingsCompatSchema,
} from './types.js';

/** The API's user, with invalid settings dropped rather than failing. */
export function parseUser(json: unknown): User {
  const rawUser = RawUserSchema.parse(json);

  let settings: UserSettings | undefined;

  const settingsResult = UserSettingsCompatSchema.safeParse(rawUser.settings);

  if (settingsResult.success) {
    settings = settingsResult.data;
  } else {
    console.error('Invalid user settings:', settingsResult.error);
  }

  return { ...rawUser, settings };
}
