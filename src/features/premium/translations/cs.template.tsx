import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const cs: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Získat prémiový přístup',
  commonHeader: (
    <>
      <p>
        <strong>Freemap Premium</strong> je volitelné roční předplatné, které
        rozšiřuje aplikaci.
      </p>
      <p className="mb-1">
        Za <b>8 €</b> ročně získáte:
      </p>
      <ul>
        <li>odstranění reklamního baneru</li>
        <li
          className="text-decoration-underline"
          title="podrobné stínování Slovenska a Česka ve vysokém rozlišení, nejvyšší úrovně přiblížení Outdoor mapy, nejvyšší úrovně přiblížení ortofotomap Slovenska a Česka, různé mapy založené na WMS"
        >
          prémiové mapové vrstvy
        </li>
        <li>prémiové fotky</li>
        <li>multimodální plánování trasy</li>
        <li>výšková data ve vysokém rozlišení (řada evropských zemí)</li>
      </ul>
      <p className="mb-0">Freemap zůstává bezplatný a otevřený.</p>
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Jak to funguje</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 1</span> - přihlaste se nebo si
          vytvořte bezplatný účet ve Freemapu (níže).
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 2</span> - budete přesměrováni k
          dokončení platby.
        </p>
      </div>
    </>
  ),
  success: 'Gratulujeme, získali jste prémiový přístup!',
  becomePremium: 'Získat prémiový přístup',
  youArePremium: (date) => (
    <>
      Máte prémiový přístup do <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Dostupné pouze s prémiovým přístupem.',
  noPremium: 'Nemáte prémiový přístup.',
  clickToActivate: 'Kliknutím aktivujete.',
  higherPrecisionElevation:
    'Přesnější výšková data dostupná s prémiovým přístupem.',
  alreadyPremium: 'Máte již prémiový přístup.',
  premiumUser: 'Uživatel s prémiovým přístupem',
  payOnce: 'Zaplatit jednorázově na jeden rok',
  paySubscription: 'Roční předplatné (automatické obnovení)',
  payWithChrons: 'Zaplatit chrony',
  chronsHint: (
    <>
      Pokud chcete získat prémiový přístup za dobrovolnickou práci nahlášenou v{' '}
      <RovasLink>Rováši</RovasLink>, zvolte platbu chrony.
    </>
  ),
};

export default cs;
