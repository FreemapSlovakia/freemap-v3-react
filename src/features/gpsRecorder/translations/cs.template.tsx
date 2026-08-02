import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const cs: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  state: {},
  connection: {},
  stats: {},
  stopModal: {},
  deleteModal: {},
  setup: {},
  errors: {},
  settingsModal: {},
};

export default cs;
