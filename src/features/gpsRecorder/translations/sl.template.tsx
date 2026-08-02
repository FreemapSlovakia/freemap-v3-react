import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const sl: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  state: {},
  connection: {},
  stats: {},
  stopModal: {},
  deleteModal: {},
  setup: {},
  errors: {},
  settingsModal: {},
};

export default sl;
