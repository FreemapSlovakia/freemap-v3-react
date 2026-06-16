import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const hu: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Prémium hozzáférés megszerzése',
  commonHeader: (
    <>
      <p>
        A <strong>Freemap Premium</strong> egy opcionális éves előfizetés, amely
        kibővíti az alkalmazást.
      </p>
      <p className="mb-1">
        <b>8 €</b> összegért évente a következőket kapod:
      </p>
      <ul>
        <li>reklámszalag eltávolítása</li>
        <li
          className="text-decoration-underline"
          title="Szlovákia és Csehország nagy felbontású részletes domborzatárnyékolása, az Outdoor Map túratérkép legnagyobb nagyítási szintjei, Szlovákia és Csehország ortofotóinak legnagyobb nagyítási szintjei, különféle WMS-alapú térképek"
        >
          prémium térképrétegek
        </li>
        <li>prémium fényképek</li>
        <li>multimodális útvonaltervezés</li>
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
  continue: 'Folytatás',
  success: 'Gratulálunk, megszerezted a prémium hozzáférést!',
  becomePremium: 'Prémium hozzáférés megszerzése',
  youArePremium: (date) => (
    <>
      Prémium hozzáférésed érvényes eddig: <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Csak prémium hozzáféréssel érhető el.',
  alreadyPremium: 'Már rendelkezel prémium hozzáféréssel.',
  premiumUser: 'Prémium hozzáféréssel rendelkező felhasználó',
  payOnce: 'Egyszeri fizetés egy évre',
  paySubscription: 'Éves előfizetés (automatikus megújítás)',
  payWithChrons: 'Fizetés chronnal',
  chronsHint:
    'Inkább chront használna? Fizessen a Rovas-egyenlegéből kártya helyett.',
};

export default hu;
