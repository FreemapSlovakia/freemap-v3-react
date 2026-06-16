import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AdMessages } from './AdMessages.js';

const hu: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Szeretnéd, ha a saját hirdetésed lenne itt? Ne habozz kapcsolatba lépni
      velünk a következő címen: {email}.
    </>
  ),
};

export default hu;
