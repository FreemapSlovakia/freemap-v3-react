import { RovasAd } from '../components/RovasAd.js';
import { AdMessages } from './AdMessages.js';

const en: AdMessages = {
  self: (email) => (
    <>
      Interested in placing your own ad here? Don’t hesitate to contact us at{' '}
      {email}.
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

export default en;
