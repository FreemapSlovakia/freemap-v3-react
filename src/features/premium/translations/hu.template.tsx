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
        <li>az útvonalpontok sorrendjének optimalizálása</li>
        <li>
          <HintTooltip hint={dtmCountries}>
            nagy felbontású magassági adatok (számos európai ország)
          </HintTooltip>
        </li>
        <li>hosszabb csapadékradar-előzmény és annak előrejelzése</li>
        <li>
          útvonalak és nyomvonalak színezése (egyes módok csak prémiummal
          érhetők el)
        </li>
      </ul>
      <p className="mb-0">A Freemap ingyenes és nyílt marad.</p>
    </>
  ),
  dtmAreaNames: { gb: 'Anglia' },
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
  payOnceWithPrices: ({ oldPrice, newPrice }) =>
    `Egyszeri fizetés egy évre — ${oldPrice}\xa0€; jövő évi ár ${newPrice}\xa0€`,
  paySubscription: 'Éves előfizetés (automatikus megújítás)',
  payWithChrons: 'Fizetés chronnal',
  chronsHint: (
    <>
      Ha prémium hozzáférést szeretnél önkéntes munkáért, amelyet a{' '}
      <RovasLink>Rovasban</RovasLink> jelentettél be, válaszd a chronokkal
      történő fizetést.
    </>
  ),
  priceIncreaseHeading: ({ date, newPrice }) =>
    `${date} után a prémium hozzáférés évi ${newPrice}\xa0€ lesz.`,
  compareNow: 'Most',
  compareNextYear: 'Jövő évi ár',
  compareSubscription: 'Éves előfizetés',
  compareOnce: 'Egyszeri vásárlás',
  compareNoSwitch: 'Váltás nélkül',
  subscriptionReassurance: ({ oldPrice }) =>
    `Az évi ${oldPrice}\xa0€-s ár mindaddig megmarad, amíg az előfizetés aktív. Bármikor lemondhatja — a prémium hozzáférés ilyenkor a kifizetett év végéig tart.`,
  payOnceConfirmTitle: 'Így nem tartja meg a jelenlegi árat',
  payOnceConfirmBody: ({ date, oldPrice, newPrice }) =>
    `Az egyszeri vásárlás egy évre szól ${oldPrice}\xa0€-ért. A következőt az akkor érvényes áron veheti meg — ${date} után évi ${newPrice}\xa0€. A most indított előfizetés az évi ${oldPrice}\xa0€-s árat mindaddig megtartja, amíg aktív, és bármikor lemondhatja.`,
  payOnceConfirmSubscribe: 'Inkább előfizetek',
  payOnceConfirmContinue: 'Mégis egyszeri fizetés',
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `${date} után a prémium hozzáférés évi ${newPrice}\xa0€ lesz. Ha előbb fizet elő, az évi ${oldPrice}\xa0€-s ár mindaddig megmarad, amíg az előfizetés aktív.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `${date} után a prémium hozzáférés évi ${newPrice}\xa0€. Ha addig előfizetésre vált, önnek marad az évi ${oldPrice}\xa0€-s ár — a terhelés csak a már kifizetett év letelte után indul.`,
  switchTitle: 'Tartsa meg a jelenlegi árat',
  switchStatus: ({ expiration }) =>
    `A prémium hozzáférése eddig érvényes: ${expiration} — ez nem előfizetés.`,
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
