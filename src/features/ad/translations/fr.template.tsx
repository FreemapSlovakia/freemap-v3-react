import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
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
  zdilaAuthorship: () => (
    <ZdilaAd
      kick="DERRIÈRE FREEMAP.EU"
      head="Cette carte, c’est nous."
      sub="Développement full-stack senior — applications web, cartes et données."
    />
  ),
  zdilaMapNative: () => (
    <ZdilaAd
      head="Cartes et logiciels sur mesure."
      sub="Applications web, full-stack et cartes — routage, tuiles, PostGIS, OSM."
      meta="derrière freemap.eu"
    />
  ),
};

export default fr;
