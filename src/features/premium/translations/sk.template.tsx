import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const sk: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Získať prémiový prístup',
  commonHeader: (
    <>
      <p>
        <strong>Podporte dobrovoľníkov vytvárajúcich túto mapu!</strong>
      </p>
      <p className="mb-1">
        Za <b>8 hodín</b> vašej{' '}
        <a
          href="https://rovas.app/freemap-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          dobrovoľníckej práce
        </a>{' '}
        alebo <b>8 €</b> získate na rok:
      </p>
      <ul>
        <li>odstránenie reklamného baneru</li>
        <li
          className="text-decoration-underline"
          title="hi-res detailed shading of Slovakia and Czechia, highest zoom levels of Outdoor Map, highest zoom levels of ortophoto maps of Slovakia and Czechia, various WMS-based maps"
        >
          prémiovým mapovým vrstvám
        </li>
        <li>prémiovým fotkám</li>
        <li>multimodálne vyhľadávanie trasy</li>
      </ul>
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Postup</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 1</span> - vytvorte si účet tu vo
          Freemape (nižšie)
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 2</span> - v aplikácii Rováš, kam
          vás usmerníme po registrácii, nám pošlite platbu.
        </p>
      </div>
    </>
  ),
  continue: 'Pokračovať',
  success: 'Gratulujeme, získali ste prémiový prístup!',
  becomePremium: 'Získať prémiový prístup',
  youArePremium: (date) => (
    <>
      Máte prémiový prístup do <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Dostupné len s prémiovým prístupom.',
  alreadyPremium: 'Už máte prémiový prístup.',
  premiumUser: 'Používateľ s prémiovým prístupom',
};

export default sk;
