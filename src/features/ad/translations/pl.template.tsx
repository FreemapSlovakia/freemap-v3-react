import { RovasAd } from '@features/ad/components/RovasAd.js';
import { ZdilaAd } from '@features/ad/components/ZdilaAd.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { AdMessages } from './AdMessages.js';

const pl: DeepPartialWithRequiredObjects<AdMessages> = {
  self: {
    head: 'Tu może być Twoja reklama',
    sub: 'Dotrzyj do osób planujących czas na świeżym powietrzu — bezpośrednio w mapie.',
    cta: 'Zobacz naszą ofertę',
  },
  rovas: () => (
    <RovasAd rovasDesc="gospodarka, która nagradza pracę">
      Rejestruj swoją aktywność wolontariacką, zweryfikuj ją w społeczności i
      zarabiaj chrony.
    </RovasAd>
  ),
  zdilaAuthorship: () => (
    <ZdilaAd
      kick="STOIMY ZA FREEMAP.EU"
      head="Tę mapę tworzymy my."
      sub="Senior full-stack — aplikacje webowe, mapy i dane."
    />
  ),
  zdilaMapNative: () => (
    <ZdilaAd
      head="Mapy i oprogramowanie na zamówienie."
      sub="Aplikacje webowe, full-stack i mapy — routing, kafelki, PostGIS, OSM."
      meta="stoimy za freemap.eu"
    />
  ),
};

export default pl;
