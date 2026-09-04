import { HintTooltip } from '@shared/components/HintTooltip.js';
import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const pl: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Uzyskaj dostęp premium',
  commonHeader: (price, dtmCountries) => (
    <>
      <p>
        <strong>Freemap Premium</strong> to opcjonalna roczna subskrypcja, która
        rozszerza aplikację.
      </p>
      <p className="mb-1">
        Za <b>{price} €</b> rocznie otrzymasz:
      </p>
      <ul>
        <li>usunięcie banera reklamowego</li>
        <li>
          <HintTooltip
            hint={
              <ul className="mb-0 ps-3 text-start">
                <li>najwyższe poziomy powiększenia mapy Outdoor</li>
                <li>mapy oparte na WMS</li>
                <li>
                  najwyższe poziomy powiększenia map ortofoto Słowacji i Czech
                </li>
                <li>
                  szczegółowe cieniowanie Słowacji i Czech w wysokiej
                  rozdzielczości
                </li>
              </ul>
            }
          >
            warstwy map premium
          </HintTooltip>
        </li>
        <li>zdjęcia premium</li>
        <li>multimodalne wyznaczanie trasy</li>
        <li>optymalizacja kolejności punktów trasy</li>
        <li>
          <HintTooltip hint={dtmCountries}>
            dane o wysokości w wysokiej rozdzielczości (wiele krajów
            europejskich)
          </HintTooltip>
        </li>
        <li>panorama w wyższej rozdzielczości</li>
        <li>analiza widoczności w wyższej rozdzielczości</li>
        <li>dłuższa historia radaru opadów i jego prognoza</li>
        <li>
          kolorowanie tras i śladów (niektóre tryby są tylko w wersji premium)
        </li>
      </ul>
      <p className="mb-0">Freemap pozostaje bezpłatny i otwarty.</p>
    </>
  ),
  dtmAreaNames: { gb: 'Anglia' },
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
  success: 'Gratulacje, uzyskano dostęp premium!',
  becomePremium: 'Uzyskaj dostęp premium',
  youArePremium: (date) => (
    <>
      Masz dostęp premium do <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Dostępne tylko z dostępem premium.',
  noPremium: 'Nie masz dostępu premium.',
  clickToActivate: 'Kliknij, aby aktywować.',
  higherPrecisionElevation:
    'Dokładniejsze dane wysokości dostępne z dostępem premium.',
  higherDetail: 'Dokładniejsze szczegóły dostępne z dostępem premium.',
  alreadyPremium: 'Masz już dostęp premium.',
  alreadySubscribed: 'Masz już aktywną subskrypcję.',
  premiumUser: 'Użytkownik z dostępem premium',
  payOnce: 'Zapłać jednorazowo za jeden rok',
  paySubscription: 'Subskrypcja roczna (odnawia się automatycznie)',
  payWithChrons: 'Zapłać chronami',
  chronsHint: (
    <>
      Jeśli chcesz uzyskać dostęp premium za pracę wolontariacką zgłoszoną w{' '}
      <RovasLink>Rovas</RovasLink>, wybierz płatność chronami.
    </>
  ),
  subscriptionReassurance: ({ price }) =>
    `Cena ${price}\xa0€ rocznie pozostanie tak długo, jak subskrypcja będzie aktywna. Możesz ją anulować w każdej chwili — dostęp premium działa wtedy do końca opłaconego roku.`,
  youArePremiumRenews: (
    <>Masz dostęp premium. Subskrypcja odnawia się automatycznie.</>
  ),
};

export default pl;
