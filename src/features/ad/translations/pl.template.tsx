import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { RovasAd } from '../components/RovasAd.js';
import { AdMessages } from './AdMessages.js';

const pl: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Chcesz umieścić swoją reklamę w tym miejscu? Skontaktuj się z nami pod
      adresem {email}.
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

export default pl;
