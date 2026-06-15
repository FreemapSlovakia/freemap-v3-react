import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AdMessages } from './AdMessages.js';

const it: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Vuoi pubblicare il tuo annuncio qui? Non esitare a contattarci a {email}.
    </>
  ),
};

export default it;
