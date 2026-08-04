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
        <li>
          <HintTooltip hint={dtmCountries}>
            dane o wysokości w wysokiej rozdzielczości (wiele krajów
            europejskich)
          </HintTooltip>
        </li>
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
  paySubscription: 'Subskrypcja roczna (odnawia się automatycznie)',
  subscribe: 'Subskrybuj',
  payWithChrons: 'Zapłać chronami',
  chronsHint: (
    <>
      Jeśli chcesz uzyskać dostęp premium za pracę wolontariacką zgłoszoną w{' '}
      <RovasLink>Rovas</RovasLink>, wybierz płatność chronami.
    </>
  ),
  priceIncrease: ({ date, oldPrice, newPrice }) =>
    `Od ${date} dostęp premium będzie kosztować ${newPrice}\xa0€ rocznie. Jeśli wykupisz subskrypcję wcześniej, cena ${oldPrice}\xa0€ za rok pozostanie tak długo, jak subskrypcja będzie aktywna. Płatność jednorazowa obowiązuje w cenie ${oldPrice}\xa0€ tylko na ten jeden rok — kolejny kupisz po cenie obowiązującej w tamtym czasie.`,
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `Od ${date} dostęp premium będzie kosztować ${newPrice}\xa0€ rocznie. Jeśli wykupisz subskrypcję wcześniej, cena ${oldPrice}\xa0€ za rok pozostanie tak długo, jak subskrypcja będzie aktywna.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `Od ${date} dostęp premium będzie kosztować ${newPrice}\xa0€ rocznie. Jeśli do tego czasu przejdziesz na subskrypcję roczną, roczna cena ${oldPrice}\xa0€ pozostanie tak długo, jak subskrypcja będzie aktywna. Naliczanie zacznie się dopiero po wykorzystaniu już opłaconego roku, więc niczego nie płacisz dwa razy.`,
  switchTitle: 'Zachowaj obecną cenę',
  switchStatus: ({ expiration }) =>
    `Masz dostęp premium do ${expiration} — to nie jest subskrypcja.`,
  switchOffer: ({ date, oldPrice, newPrice }) =>
    `Od ${date} dostęp premium będzie kosztować ${newPrice}\xa0€ rocznie. Jeśli do tego czasu przejdziesz na subskrypcję roczną, roczna cena ${oldPrice}\xa0€ pozostanie tak długo, jak subskrypcja będzie aktywna.`,
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
