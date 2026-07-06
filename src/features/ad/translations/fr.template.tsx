import { RovasAd } from '@features/ad/components/RovasAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const fr: DeepPartialWithRequiredObjects<AdMessages> = {
  self: (email) => (
    <>
      Vous souhaitez placer votre propre publicité ici ? N’hésitez pas à nous
      contacter à {email}.
    </>
  ),
  rovas: () => (
    <RovasAd rovasDesc="une économie qui récompense le travail">
      <b>Faites-vous récompenser pour le travail que vous accomplissez.</b>{' '}
      Enregistrez l’activité bénévole de votre choix, faites-la vérifier par la
      communauté et gagnez des chrons.
    </RovasAd>
  ),
};

export default fr;
