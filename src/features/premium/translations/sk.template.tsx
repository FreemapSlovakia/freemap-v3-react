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
        <li
          className="text-decoration-underline fm-cursor-help"
          title="detailné tieňovanie reliéfu Slovenska a Česka vo vysokom rozlíšení, najvyššie úrovne priblíženia Outdoor mapy, najvyššie úrovne priblíženia ortofotomáp Slovenska a Česka, rôzne mapy založené na WMS"
        >
          prémiové mapové vrstvy
        </li>
        <li>prémiové fotky</li>
        <li>multimodálne plánovanie trasy</li>
        <li
          className="text-decoration-underline fm-cursor-help"
          title={dtmCountries}
        >
          výškové dáta vo vysokom rozlíšení (viaceré európske krajiny)
        </li>
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
  alreadySubscribed: 'Už máte aktívne predplatné.',
  premiumUser: 'Používateľ s prémiovým prístupom',
  payOnce: 'Zaplatiť jednorazovo na jeden rok',
  paySubscription: 'Ročné predplatné (automatické obnovenie)',
  subscribe: 'Predplatiť',
  payWithChrons: 'Zaplatiť chronmi',
  chronsHint: (
    <>
      Ak chcete získať prémiový prístup za dobrovoľnícku prácu reportovanú v{' '}
      <RovasLink>Rováši</RovasLink>, zvoľte platbu chronmi.
    </>
  ),
  priceIncrease: ({ date, oldPrice, newPrice }) =>
    `Od ${date} bude prémiový prístup stáť ${newPrice}\xa0€ ročne. Ak si ho predplatíte skôr, cena ${oldPrice}\xa0€ za rok vám zostane, pokiaľ bude predplatné aktívne. Jednorazová platba platí za ${oldPrice}\xa0€ len na daný jeden rok — ďalší rok si kúpite za cenu platnú v tom čase.`,
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `Od ${date} bude prémiový prístup stáť ${newPrice}\xa0€ ročne. Ak si ho predplatíte skôr, cena ${oldPrice}\xa0€ za rok vám zostane, pokiaľ bude predplatné aktívne.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `Od ${date} bude prémiový prístup stáť ${newPrice}\xa0€ ročne. Ak dovtedy prejdete na ročné predplatné, ročná cena ${oldPrice}\xa0€ vám zostane, pokiaľ bude predplatné aktívne. Účtovať sa začne až po vyčerpaní už zaplateného roka, takže nič neplatíte dvakrát.`,
  switchTitle: 'Zachovajte si súčasnú cenu',
  switchStatus: ({ expiration }) =>
    `Prémiový prístup máte do ${expiration} — nie je to predplatné.`,
  switchOffer: ({ date, oldPrice, newPrice }) =>
    `Od ${date} bude prémiový prístup stáť ${newPrice}\xa0€ ročne. Ak dovtedy prejdete na ročné predplatné, ročná cena ${oldPrice}\xa0€ vám zostane, pokiaľ bude predplatné aktívne.`,
  switchNoDoubleCharge: ({ expiration }) =>
    `Prechodom teraz nič nestrácate: predplatné začne bezplatným obdobím do ${expiration} a prvá platba sa strhne až vtedy.`,
  switchAction: 'Prejsť na ročné predplatné',
  priceIncreaseMini: ({ date, newPrice }) =>
    `Prémium od ${date} za ${newPrice}\xa0€ ročne.`,
  priceIncreaseMore: 'viac…',
};

export default sk;
