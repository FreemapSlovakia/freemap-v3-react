import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const cs: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Získat prémiový přístup',
  commonHeader: (
    <>
      <p>
        <strong>Podpořte dobrovolníky, kteří vytvářejí tuto mapu!</strong>
      </p>
      <p className="mb-1">
        Za <b>8 hodin</b> vaší{' '}
        <a
          href="https://rovas.app/freemap-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          dobrovolnické práce
        </a>{' '}
        nebo <b>8 €</b> získáte na rok:
      </p>
      <ul>
        <li>odstranění reklamního baneru</li>
        <li
          className="text-decoration-underline"
          title="podrobné stínování Slovenska a Česka ve vysokém rozlišení, nejvyšší úrovně přiblížení Outdoor mapy, nejvyšší úrovně přiblížení ortofotomap Slovenska a Česka, různé mapy založené na WMS"
        >
          prémiovým mapovým vrstvám
        </li>
        <li>prémiovým fotkám</li>
        <li>multimodální vyhledávání trasy</li>
      </ul>
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Postup</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 1</span> - vytvořte si účet zde ve
          Freemapu (níže)
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 2</span> - v aplikaci Rováš, kam
          vás nasměrujeme po registraci, nám pošlete platbu.
        </p>
      </div>
    </>
  ),
  continue: 'Pokračovat',
  success: 'Gratulujeme, získali jste prémiový přístup!',
  becomePremium: 'Získat prémiový přístup',
  youArePremium: (date) => (
    <>
      Máte prémiový přístup do <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Dostupné pouze s prémiovým přístupem.',
  alreadyPremium: 'Máte již prémiový přístup.',
  premiumUser: 'Uživatel s prémiovým přístupem',
};

export default cs;
