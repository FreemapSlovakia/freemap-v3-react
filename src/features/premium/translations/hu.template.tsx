import { HintTooltip } from '@shared/components/HintTooltip.js';
import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const hu: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Prémium hozzáférés megszerzése',
  commonHeader: (price, dtmCountries) => (
    <>
      <p>
        A <strong>Freemap Premium</strong> egy opcionális éves előfizetés, amely
        kibővíti az alkalmazást.
      </p>
      <p className="mb-1">
        <b>{price} €</b> összegért évente a következőket kapod:
      </p>
      <ul>
        <li>reklámszalag eltávolítása</li>
        <li>
          <HintTooltip hint="Szlovákia és Csehország nagy felbontású részletes domborzatárnyékolása, az Outdoor Map túratérkép legnagyobb nagyítási szintjei, Szlovákia és Csehország ortofotóinak legnagyobb nagyítási szintjei, különféle WMS-alapú térképek">
            prémium térképrétegek
          </HintTooltip>
        </li>
        <li>prémium fényképek</li>
        <li>multimodális útvonaltervezés</li>
        <li>
          <HintTooltip hint={dtmCountries}>
            nagy felbontású magassági adatok (számos európai ország)
          </HintTooltip>
        </li>
      </ul>
      <p className="mb-0">A Freemap ingyenes és nyílt marad.</p>
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Hogyan működik</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">1. lépés</span> - jelentkezzen be vagy
          hozzon létre ingyenes Freemap-fiókot (lent).
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">2. lépés</span> - átirányítjuk a fizetés
          befejezéséhez.
        </p>
      </div>
    </>
  ),
  success: 'Gratulálunk, megszerezted a prémium hozzáférést!',
  becomePremium: 'Prémium hozzáférés megszerzése',
  youArePremium: (date) => (
    <>
      Prémium hozzáférésed érvényes eddig: <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Csak prémium hozzáféréssel érhető el.',
  noPremium: 'Nincs prémium hozzáférésed.',
  clickToActivate: 'Kattintson az aktiváláshoz.',
  higherPrecisionElevation:
    'Nagyobb pontosságú magassági adatok prémium hozzáféréssel érhetők el.',
  alreadyPremium: 'Már rendelkezel prémium hozzáféréssel.',
  alreadySubscribed: 'Már van aktív előfizetésed.',
  premiumUser: 'Prémium hozzáféréssel rendelkező felhasználó',
  payOnce: 'Egyszeri fizetés egy évre',
  paySubscription: 'Éves előfizetés (automatikus megújítás)',
  subscribe: 'Előfizetés',
  payWithChrons: 'Fizetés chronnal',
  chronsHint: (
    <>
      Ha prémium hozzáférést szeretnél önkéntes munkáért, amelyet a{' '}
      <RovasLink>Rovasban</RovasLink> jelentettél be, válaszd a chronokkal
      történő fizetést.
    </>
  ),
  priceIncrease: ({ date, oldPrice, newPrice }) =>
    `${date} után a prémium hozzáférés évi ${newPrice}\xa0€ lesz. Ha előbb fizet elő, az évi ${oldPrice}\xa0€-s ár mindaddig megmarad, amíg az előfizetés aktív. Az egyszeri vásárlás csak arra az egy évre szól ${oldPrice}\xa0€-ért — a következőt az akkor érvényes áron veheti meg.`,
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `${date} után a prémium hozzáférés évi ${newPrice}\xa0€ lesz. Ha előbb fizet elő, az évi ${oldPrice}\xa0€-s ár mindaddig megmarad, amíg az előfizetés aktív.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `${date} után a prémium hozzáférés évi ${newPrice}\xa0€ lesz. Ha addig éves előfizetésre vált, az évi ${oldPrice}\xa0€-s ár mindaddig megmarad, amíg az előfizetés aktív. A terhelés csak a már kifizetett év letelte után indul, így semmit sem fizet kétszer.`,
  switchTitle: 'Tartsa meg a jelenlegi árat',
  switchStatus: ({ expiration }) =>
    `A prémium hozzáférése eddig érvényes: ${expiration} — ez nem előfizetés.`,
  switchOffer: ({ date, oldPrice, newPrice }) =>
    `${date} után a prémium hozzáférés évi ${newPrice}\xa0€ lesz. Ha addig éves előfizetésre vált, az évi ${oldPrice}\xa0€-s ár mindaddig megmarad, amíg az előfizetés aktív.`,
  switchNoDoubleCharge: ({ expiration }) =>
    `A váltással semmit sem veszít: az előfizetés ingyenes időszakkal indul eddig: ${expiration}, és az első terhelés csak ekkor történik.`,
  switchAction: 'Váltás éves előfizetésre',
  priceIncreaseMini: ({ date, newPrice }) =>
    `Prémium ${date} után évi ${newPrice}\xa0€.`,
  priceIncreaseMore: 'tovább…',
  youArePremiumRenews: (
    <>Prémium hozzáférésed van. Az előfizetés automatikusan megújul.</>
  ),
};

export default hu;
