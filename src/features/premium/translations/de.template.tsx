import { RovasLink } from '@shared/components/RovasLink.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const de: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Premium-Zugang erhalten',

  commonHeader: (
    <>
      <p>
        <strong>Freemap Premium</strong> ist ein optionales Jahresabo, das die
        App erweitert.
      </p>
      <p className="mb-1">
        Für <b>8 €</b> pro Jahr erhältst du:
      </p>
      <ul>
        <li>entferntes Werbebanner</li>
        <li
          className="text-decoration-underline"
          title="Hochauflösende detaillierte Schummerung der Slowakei und Tschechiens, höchste Zoomstufen der Outdoor-Karte, höchste Zoomstufen der Orthofotokarten der Slowakei und Tschechiens, verschiedene WMS-basierte Karten"
        >
          Premium-Kartenebenen
        </li>
        <li>Premium-Fotos</li>
        <li>multimodale Routenplanung</li>
        <li>hochauflösende Höhendaten (derzeit Slowakei)</li>
      </ul>
      <p className="mb-0">Freemap bleibt kostenlos und offen.</p>
    </>
  ),

  stepsForAnonymous: (
    <>
      <div className="fw-bold">So funktioniert es</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Schritt 1</span> – Melde dich an oder
          erstelle ein kostenloses Freemap-Konto (unten).
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Schritt 2</span> – Du wirst zur Zahlung
          weitergeleitet.
        </p>
      </div>
    </>
  ),
  success: 'Glückwunsch, du hast Premium-Zugang erhalten!',
  becomePremium: 'Premium-Zugang erhalten',
  youArePremium: (date) => (
    <>
      Du hast Premium-Zugang bis <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Nur mit Premium-Zugang verfügbar.',
  noPremium: 'Du hast keinen Premium-Zugang.',
  clickToActivate: 'Zum Aktivieren klicken.',
  higherPrecisionElevation:
    'Höhendaten mit höherer Genauigkeit mit Premium-Zugang verfügbar.',
  alreadyPremium: 'Du hast bereits Premium-Zugang.',
  premiumUser: 'Nutzer mit Premium-Zugang',
  payOnce: 'Einmalig für ein Jahr zahlen',
  paySubscription: 'Jährliches Abo (verlängert sich automatisch)',
  payWithChrons: 'Mit Chrons bezahlen',
  chronsHint: (
    <>
      Wenn Sie Premium-Zugang für in <RovasLink>Rovas</RovasLink> gemeldete
      ehrenamtliche Arbeit erhalten möchten, wählen Sie die Zahlung mit Chrons.
    </>
  ),
};

export default de;
