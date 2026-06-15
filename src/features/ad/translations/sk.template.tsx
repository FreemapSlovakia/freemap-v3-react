import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AdMessages } from './AdMessages.js';

const sk: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Máš záujem o vlastnú reklamu na tomto mieste? Neváhaj nás kontaktovať na{' '}
      {email}.
    </>
  ),
};

export default sk;
