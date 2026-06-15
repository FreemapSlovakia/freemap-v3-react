import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AdMessages } from './AdMessages.js';

const de: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Möchten Sie hier Ihre eigene Werbung platzieren? Kontaktieren Sie uns
      gerne unter {email}.
    </>
  ),
};

export default de;
