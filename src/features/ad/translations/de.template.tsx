import { RovasAd } from '@features/ad/components/RovasAd.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AdMessages } from './AdMessages.js';

const de: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Möchten Sie hier Ihre eigene Werbung platzieren? Kontaktieren Sie uns
      gerne unter {email}.
    </>
  ),
  rovas: () => (
    <RovasAd rovasDesc="eine Wirtschaft, die Arbeit belohnt">
      <b>Lass dich für deine Arbeit belohnen.</b> Erfasse eine beliebige
      freiwillige Tätigkeit deiner Wahl, lass sie von der Community bestätigen
      und verdiene Chrons.
    </RovasAd>
  ),
};

export default de;
