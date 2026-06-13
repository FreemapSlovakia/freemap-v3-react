import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const hu: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Prémium hozzáférés megszerzése',
  commonHeader: (
    <>
      <p>
        <strong>Támogasd az önkénteseket, akik ezt a térképet készítik!</strong>
      </p>
      <p className="mb-1">
        <b>8 óra</b>{' '}
        <a
          href="https://rovas.app/freemap-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          önkéntes munkáért
        </a>{' '}
        vagy <b>8 €</b> összegért a következőket kaphatod egy évre:
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
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Eljárás</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">1. lépés</span> - hozzon létre fiókot
          itt a Freemapben (lent)
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">2. lépés</span> - a Rovas alkalmazásban,
          ahová a regisztráció után irányítjuk, küldje el nekünk a fizetést.
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
};

export default hu;
