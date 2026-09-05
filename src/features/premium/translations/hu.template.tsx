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
          <HintTooltip
            hint={
              <ul className="mb-0 ps-3 text-start">
                <li>az Outdoor Map túratérkép legnagyobb nagyítási szintjei</li>
                <li>WMS-alapú térképek</li>
                <li>
                  Szlovákia és Csehország ortofotóinak legnagyobb nagyítási
                  szintjei
                </li>
                <li>
                  Szlovákia és Csehország nagy felbontású részletes
                  domborzatárnyékolása
                </li>
              </ul>
            }
          >
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
        <li>nagyobb felbontású panoráma</li>
        <li>nagyobb felbontású láthatósági elemzés</li>
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
  higherDetail: 'Finomabb részletesség prémium hozzáféréssel érhető el.',
  alreadyPremium: 'Már rendelkezel prémium hozzáféréssel.',
  alreadySubscribed: 'Már van aktív előfizetésed.',
  premiumUser: 'Prémium hozzáféréssel rendelkező felhasználó',
  payOnce: 'Egyszeri fizetés egy évre',
  paySubscription: 'Éves előfizetés (automatikus megújítás)',
  payWithChrons: 'Fizetés chronnal',
  chronsHint: (
    <>
      Ha prémium hozzáférést szeretnél önkéntes munkáért, amelyet a{' '}
      <RovasLink>Rovasban</RovasLink> jelentettél be, válaszd a chronokkal
      történő fizetést.
    </>
  ),
  subscriptionReassurance: ({ price }) =>
    `Az évi ${price}\xa0€-s ár mindaddig megmarad, amíg az előfizetés aktív. Bármikor lemondhatja — a prémium hozzáférés ilyenkor a kifizetett év végéig tart.`,
  youArePremiumRenews: (
    <>Prémium hozzáférésed van. Az előfizetés automatikusan megújul.</>
  ),
};

export default hu;
