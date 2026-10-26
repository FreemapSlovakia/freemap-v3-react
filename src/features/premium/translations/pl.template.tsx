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
        Za <b>{price} €</b> rocznie:
      </p>
      <ul>
        <li>usunięcie banera reklamowego</li>
        <li>
          <HintTooltip
            hint={
              <ul className="mb-0 ps-3 text-start">
                <li>najwyższe poziomy powiększenia mapy Outdoor</li>
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
  dtmAreaNames: { en: 'Anglia', wls: 'Walia' },
  purchaseAfterLogin: (
    <>
      Wybór dostawcy logowania loguje do konta Freemap lub tworzy bezpłatne
      konto. Potem nastąpi przejście do płatności za{' '}
      <strong>Freemap Premium</strong>.
    </>
  ),
  success: 'Gratulacje, uzyskano dostęp premium!',
  becomePremium: 'Uzyskaj dostęp premium',
  youArePremium: (date) => (
    <>
      Dostęp premium do <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Dostępne tylko z dostępem premium.',
  noPremium: 'Brak dostępu premium.',
  clickToActivate: 'Kliknij, aby aktywować.',
  higherPrecisionElevation:
    'Dokładniejsze dane wysokości dostępne z dostępem premium.',
  higherDetail: 'Dokładniejsze szczegóły dostępne z dostępem premium.',
  alreadyPremium: 'Dostęp premium jest już aktywny.',
  alreadySubscribed: 'Subskrypcja jest już aktywna.',
  premiumUser: 'Użytkownik z dostępem premium',
  payOnce: 'Zapłać jednorazowo za jeden rok',
  paySubscription: 'Subskrypcja roczna (odnawia się automatycznie)',
  payWithChrons: 'Zapłać chronami',
  chronsHint: (
    <>
      Aby uzyskać dostęp premium za pracę wolontariacką zgłoszoną w{' '}
      <RovasLink>Rovas</RovasLink>, wybierz płatność chronami.
    </>
  ),
  subscriptionReassurance: ({ price }) =>
    `Cena ${price}\xa0€ rocznie pozostanie tak długo, jak subskrypcja będzie aktywna. Można ją anulować w każdej chwili — dostęp premium działa wtedy do końca opłaconego roku.`,
  youArePremiumRenews: (
    <>Dostęp premium jest aktywny. Subskrypcja odnawia się automatycznie.</>
  ),
};

export default pl;
