import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const pl: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Uzyskaj dostęp premium',
  commonHeader: (
    <>
      <p>
        <strong>Wesprzyj wolontariuszy, którzy tworzą tę mapę!</strong>
      </p>
      <p className="mb-1">
        Za <b>8 godzin</b> swojej{' '}
        <a
          href="https://rovas.app/freemap-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          pracy wolontariackiej
        </a>{' '}
        lub <b>8 €</b>
        otrzymasz roczny dostęp obejmujący:
      </p>
      <ul>
        <li>usunięcie banera reklamowego</li>
        <li
          className="text-decoration-underline"
          title="szczegółowe cieniowanie Słowacji i Czech w wysokiej rozdzielczości, najwyższe poziomy powiększenia mapy Outdoor, najwyższe poziomy powiększenia map ortofoto Słowacji i Czech, różne mapy oparte na WMS"
        >
          warstw map premium
        </li>
        <li>zdjęć premium</li>
        <li>multimodalne wyznaczanie trasy</li>
      </ul>
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Procedura</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 1</span> – utwórz konto w Freemap
          (poniżej)
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Krok 2</span> – w aplikacji Rovas, gdzie
          zostaniesz przekierowany po rejestracji, prześlij nam płatność.
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
};

export default pl;
