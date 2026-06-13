import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { RovasAd } from '../components/RovasAd.js';
import { AdMessages } from './AdMessages.js';

const cs: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Máte zájem o vlastní reklamu na tomto místě? Neváhejte nás kontaktovat na{' '}
      {email}.
    </>
  ),
  rovas: () => (
    <RovasAd rovasDesc="ekonomický software pro dobrovolníky">
      <b>Freemap vytvářejí dobrovolníci.</b>{' '}
      <span className="text-danger">Odměňte je za jejich práci</span>, svou
      vlastní dobrovolnickou prací nebo penězi.
    </RovasAd>
  ),
};

export default cs;
