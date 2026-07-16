import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
import type { AdMessages } from './AdMessages.js';

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
  zdilaAuthorship: () => (
    <ZdilaAd
      kick="WE’RE BEHIND FREEMAP.EU"
      head="We build this map."
      sub="Senior full-stack development — web apps, maps and data."
    />
  ),
  zdilaMapNative: () => (
    <ZdilaAd
      head="Custom maps & software."
      sub="Web apps, full-stack and maps — routing, tiles, PostGIS, OSM."
      meta="behind freemap.eu"
    />
  ),
};

export default en;
