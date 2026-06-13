import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { RovasAd } from '../components/RovasAd.js';
import { AdMessages } from './AdMessages.js';

const sk: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Máš záujem o vlastnú reklamu na tomto mieste? Neváhaj nás kontaktovať na{' '}
      {email}.
    </>
  ),
  rovas: () => (
    <RovasAd rovasDesc="ekonomický softvér pre dobrovoľnikov">
      <b>Freemap je tvorený dobrovoľníkmi.</b>{' '}
      <span className="text-danger">Odmeňte ich za ich prácu</span>, vašou
      vlastnou dobrovoľníckou prácou alebo peniazmi.
    </RovasAd>
  ),
};

export default sk;
