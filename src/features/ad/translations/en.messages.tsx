import { RovasAd } from '@features/ad/components/RovasAd.js';
import { AdMessages } from './AdMessages.js';

const en: AdMessages = {
  self: (email) => (
    <>
      Interested in placing your own ad here? Don’t hesitate to contact us at{' '}
      {email}.
    </>
  ),
  rovas: () => (
    <RovasAd rovasDesc="an economy that rewards work">
      <b>Get rewarded for the work you do.</b> Log any volunteer activity you
      choose, have it verified by the community, and earn chrons.
    </RovasAd>
  ),
};

export default en;
