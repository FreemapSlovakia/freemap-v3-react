import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const pl: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Uzyskaj dostęp premium',
  commonHeader: (
    <>
      <p>
        <strong>Freemap Premium</strong> to opcjonalna roczna subskrypcja, która
        rozszerza aplikację.
      </p>
      <p className="mb-1">
        Za <b>8 €</b> rocznie otrzymasz:
      </p>
      <ul>
        <li>usunięcie banera reklamowego</li>
        <li
          className="text-decoration-underline"
          title="szczegółowe cieniowanie Słowacji i Czech w wysokiej rozdzielczości, najwyższe poziomy powiększenia mapy Outdoor, najwyższe poziomy powiększenia map ortofoto Słowacji i Czech, różne mapy oparte na WMS"
        >
          warstwy map premium
        </li>
        <li>zdjęcia premium</li>
        <li>multimodalne wyznaczanie trasy</li>
      </ul>
      <p className="mb-0">Freemap pozostaje bezpłatny i otwarty.</p>
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Jak to działa</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 1</span> – zaloguj się lub utwórz
          bezpłatne konto Freemap (poniżej).
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 2</span> – zostaniesz przekierowany
          do dokończenia płatności.
        </p>
      </div>
    </>
  ),
  continue: 'Kontynuuj',
  success: 'Gratulacje, uzyskano dostęp premium!',
  becomePremium: 'Uzyskaj dostęp premium',
  youArePremium: (date) => (
    <>
      Masz dostęp premium do <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Dostępne tylko z dostępem premium.',
  alreadyPremium: 'Masz już dostęp premium.',
  premiumUser: 'Użytkownik z dostępem premium',
  payOnce: 'Zapłać jednorazowo — 1 rok',
  paySubscription: 'Subskrypcja roczna (odnawia się automatycznie)',
  payWhatYouWant: 'Kwotę wybierasz sam — minimum 8 €.',
};

export default pl;
