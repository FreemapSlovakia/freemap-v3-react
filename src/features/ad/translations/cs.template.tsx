import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AdMessages } from './AdMessages.js';

const cs: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Máte zájem o vlastní reklamu na tomto místě? Neváhejte nás kontaktovat na{' '}
      {email}.
    </>
  ),
};

export default cs;
