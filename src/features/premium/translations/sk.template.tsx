import { HintTooltip } from '@shared/components/HintTooltip.js';
import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const sk: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Získať prémiový prístup',
  commonHeader: (price, dtmCountries) => (
    <>
      <p>
        <strong>Freemap Premium</strong> je voliteľné ročné predplatné, ktoré
        rozširuje aplikáciu.
      </p>
      <p className="mb-1">
        Za <b>{price} €</b> ročne získate:
      </p>
      <ul>
        <li>odstránenie reklamného baneru</li>
        <li>
          <HintTooltip hint="detailné tieňovanie reliéfu Slovenska a Česka vo vysokom rozlíšení, najvyššie úrovne priblíženia Outdoor mapy, najvyššie úrovne priblíženia ortofotomáp Slovenska a Česka, rôzne mapy založené na WMS">
            prémiové mapové vrstvy
          </HintTooltip>
        </li>
        <li>prémiové fotky</li>
        <li>multimodálne plánovanie trasy</li>
        <li>optimalizácia poradia bodov trasy</li>
        <li>
          <HintTooltip hint={dtmCountries}>
            výškové dáta vo vysokom rozlíšení (viaceré európske krajiny)
          </HintTooltip>
        </li>
        <li>panoráma vo vyššom rozlíšení</li>
        <li>analýza viditeľnosti vo vyššom rozlíšení</li>
        <li>dlhšia história meteoradaru a jeho predpoveď</li>
        <li>vyfarbenie trás a záznamov (niektoré režimy sú len prémiové)</li>
      </ul>
      <p className="mb-0">Freemap zostáva bezplatný a otvorený.</p>
    </>
  ),
  dtmAreaNames: { gb: 'Anglicko' },
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
  youArePremiumRenews: (
    <>Máte prémiový prístup. Predplatné sa obnovuje automaticky.</>
  ),
  premiumOnly: 'Dostupné len s prémiovým prístupom.',
  noPremium: 'Nemáte prémiový prístup.',
  clickToActivate: 'Kliknutím aktivujete.',
  higherPrecisionElevation:
    'Presnejšie výškové dáta dostupné s prémiovým prístupom.',
  higherDetail: 'Jemnejšie detaily dostupné s prémiovým prístupom.',
  alreadyPremium: 'Už máte prémiový prístup.',
  alreadySubscribed: 'Už máte aktívne predplatné.',
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
  subscriptionReassurance: ({ price }) =>
    `Cena ${price}\xa0€ ročne vám zostane, pokiaľ bude predplatné aktívne. Zrušiť ho môžete kedykoľvek — prémiový prístup potom platí do konca zaplateného roka.`,
};

export default sk;
