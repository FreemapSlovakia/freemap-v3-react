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
          <HintTooltip hint="szczegółowe cieniowanie Słowacji i Czech w wysokiej rozdzielczości, najwyższe poziomy powiększenia mapy Outdoor, najwyższe poziomy powiększenia map ortofoto Słowacji i Czech, różne mapy oparte na WMS">
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
  alreadyPremium: 'Masz już dostęp premium.',
  alreadySubscribed: 'Masz już aktywną subskrypcję.',
  premiumUser: 'Użytkownik z dostępem premium',
  payOnce: 'Zapłać jednorazowo za jeden rok',
  payOnceWithPrices: ({ oldPrice, newPrice }) =>
    `Zapłać jednorazowo za jeden rok — ${oldPrice}\xa0€; cena w przyszłym roku ${newPrice}\xa0€`,
  paySubscription: 'Subskrypcja roczna (odnawia się automatycznie)',
  payWithChrons: 'Zapłać chronami',
  chronsHint: (
    <>
      Jeśli chcesz uzyskać dostęp premium za pracę wolontariacką zgłoszoną w{' '}
      <RovasLink>Rovas</RovasLink>, wybierz płatność chronami.
    </>
  ),
  priceIncreaseHeading: ({ date, newPrice }) =>
    `Od ${date} dostęp premium będzie kosztować ${newPrice}\xa0€ rocznie.`,
  compareNow: 'Teraz',
  compareNextYear: 'Cena w przyszłym roku',
  compareSubscription: 'Subskrypcja roczna',
  compareOnce: 'Zakup jednorazowy',
  compareNoSwitch: 'Bez przejścia',
  subscriptionReassurance: ({ oldPrice }) =>
    `Cena ${oldPrice}\xa0€ rocznie pozostanie tak długo, jak subskrypcja będzie aktywna. Możesz ją anulować w każdej chwili — dostęp premium działa wtedy do końca opłaconego roku.`,
  payOnceConfirmTitle: 'To nie zachowa obecnej ceny',
  payOnceConfirmBody: ({ date, oldPrice, newPrice }) =>
    `Płatność jednorazowa obejmuje jeden rok za ${oldPrice}\xa0€. Kolejny kupisz po cenie obowiązującej w tamtym czasie — od ${date} to ${newPrice}\xa0€ rocznie. Subskrypcja wykupiona teraz utrzymuje cenę ${oldPrice}\xa0€ rocznie tak długo, jak jest aktywna, i możesz ją anulować w każdej chwili.`,
  payOnceConfirmSubscribe: 'Wykup subskrypcję',
  payOnceConfirmContinue: 'Mimo to zapłać jednorazowo',
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `Od ${date} dostęp premium będzie kosztować ${newPrice}\xa0€ rocznie. Jeśli wykupisz subskrypcję wcześniej, cena ${oldPrice}\xa0€ za rok pozostanie tak długo, jak subskrypcja będzie aktywna.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `Od ${date} dostęp premium kosztuje ${newPrice}\xa0€ rocznie. Jeśli do tego czasu przejdziesz na subskrypcję, twoja cena pozostanie ${oldPrice}\xa0€ — nic nie zostanie pobrane, dopóki nie skończy się już opłacony rok.`,
  switchTitle: 'Zachowaj obecną cenę',
  switchStatus: ({ expiration }) =>
    `Masz dostęp premium do ${expiration} — to nie jest subskrypcja.`,
  switchNoDoubleCharge: ({ expiration }) =>
    `Przechodząc teraz, nic nie tracisz: subskrypcja zacznie się bezpłatnym okresem do ${expiration}, a pierwsza płatność zostanie pobrana dopiero wtedy.`,
  switchAction: 'Przejdź na subskrypcję roczną',
  priceIncreaseMini: ({ date, newPrice }) =>
    `Premium od ${date} za ${newPrice}\xa0€ rocznie.`,
  priceIncreaseMore: 'więcej…',
  youArePremiumRenews: (
    <>Masz dostęp premium. Subskrypcja odnawia się automatycznie.</>
  ),
};

export default pl;
