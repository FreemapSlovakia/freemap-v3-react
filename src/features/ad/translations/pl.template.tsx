import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AdMessages } from './AdMessages.js';

const pl: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Chcesz umieścić swoją reklamę w tym miejscu? Skontaktuj się z nami pod
      adresem {email}.
    </>
  ),
};

export default pl;
