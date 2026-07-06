import { RovasAd } from '@features/ad/components/RovasAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const sk: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Máš záujem o vlastnú reklamu na tomto mieste? Neváhaj nás kontaktovať na{' '}
      {email}.
    </>
  ),
  rovas: () => (
    <RovasAd name="Rováš" rovasDesc="ekonomika, ktorá odmeňuje prácu">
      <b>Nechaj sa odmeniť za prácu, ktorú robíš.</b> Zaznamenaj ľubovoľnú
      dobrovoľnícku činnosť podľa vlastného výberu, nechaj ju overiť komunitou a
      zarábaj chrony.
    </RovasAd>
  ),
};

export default sk;
