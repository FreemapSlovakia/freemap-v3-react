import { RovasAd } from '@features/ad/components/RovasAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const cs: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Máte zájem o vlastní reklamu na tomto místě? Neváhejte nás kontaktovat na{' '}
      {email}.
    </>
  ),
  rovas: () => (
    <RovasAd name="Rováš" rovasDesc="ekonomika, která odměňuje práci">
      <b>Nech se odměnit za práci, kterou děláš.</b> Zaznamenej libovolnou
      dobrovolnickou činnost dle vlastního výběru, nech ji ověřit komunitou a
      vydělávej chrony.
    </RovasAd>
  ),
};

export default cs;
