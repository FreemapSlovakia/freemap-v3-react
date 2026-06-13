import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { RovasAd } from '../components/RovasAd.js';
import { AdMessages } from './AdMessages.js';

const it: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Vuoi pubblicare il tuo annuncio qui? Non esitare a contattarci a {email}.
    </>
  ),
  rovas: () => (
    <RovasAd rovasDesc="economic program for volunteers">
      <b>Freemap is created by volunteers.</b>{' '}
      <span className="text-danger">Reward them for their work</span>, with your
      own volunteer work or with money.
    </RovasAd>
  ),
};

export default it;
