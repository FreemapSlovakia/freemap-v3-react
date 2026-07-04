import { RovasLink } from '@shared/components/RovasLink.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const sk: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Získať prémiový prístup',
  commonHeader: (
    <>
      <p>
        <strong>Freemap Premium</strong> je voliteľné ročné predplatné, ktoré
        rozširuje aplikáciu.
      </p>
      <p className="mb-1">
        Za <b>8 €</b> ročne získate:
      </p>
      <ul>
        <li>odstránenie reklamného baneru</li>
        <li
          className="text-decoration-underline"
          title="detailné tieňovanie reliéfu Slovenska a Česka vo vysokom rozlíšení, najvyššie úrovne priblíženia Outdoor mapy, najvyššie úrovne priblíženia ortofotomáp Slovenska a Česka, rôzne mapy založené na WMS"
        >
          prémiové mapové vrstvy
        </li>
        <li>prémiové fotky</li>
        <li>multimodálne plánovanie trasy</li>
        <li>výškové dáta vo vysokom rozlíšení (viaceré európske krajiny)</li>
      </ul>
      <p className="mb-0">Freemap zostáva bezplatný a otvorený.</p>
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Ako to funguje</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 1</span> - prihláste sa alebo si
          vytvorte bezplatný účet vo Freemape (nižšie).
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 2</span> - budete presmerovaní na
          dokončenie platby.
        </p>
      </div>
    </>
  ),
  success: 'Gratulujeme, získali ste prémiový prístup!',
  becomePremium: 'Získať prémiový prístup',
  youArePremium: (date) => (
    <>
      Máte prémiový prístup do <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Dostupné len s prémiovým prístupom.',
  noPremium: 'Nemáte prémiový prístup.',
  clickToActivate: 'Kliknutím aktivujete.',
  higherPrecisionElevation:
    'Presnejšie výškové dáta dostupné s prémiovým prístupom.',
  alreadyPremium: 'Už máte prémiový prístup.',
  premiumUser: 'Používateľ s prémiovým prístupom',
  payOnce: 'Zaplatiť jednorazovo na jeden rok',
  paySubscription: 'Ročné predplatné (automatické obnovenie)',
  payWithChrons: 'Zaplatiť chronmi',
  chronsHint: (
    <>
      Ak chcete získať prémiový prístup za dobrovoľnícku prácu reportovanú v{' '}
      <RovasLink>Rováši</RovasLink>, zvoľte platbu chronmi.
    </>
  ),
};

export default sk;
