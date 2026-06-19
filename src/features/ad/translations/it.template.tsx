import { RovasAd } from '@features/ad/components/RovasAd.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { AdMessages } from './AdMessages.js';

const it: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Vuoi pubblicare il tuo annuncio qui? Non esitare a contattarci a {email}.
    </>
  ),
  rovas: () => (
    <RovasAd rovasDesc="un’economia che premia il lavoro">
      <b>Fatti premiare per il lavoro che svolgi.</b> Registra qualsiasi
      attività di volontariato tu scelga, falla verificare dalla community e
      guadagna chron.
    </RovasAd>
  ),
};

export default it;
