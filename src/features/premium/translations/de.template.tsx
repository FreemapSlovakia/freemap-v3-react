import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const de: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Premium-Zugang erhalten',

  commonHeader: (
    <>
      <p>
        <strong>
          Unterstütze die Freiwilligen, die diese Karte erstellen!
        </strong>
      </p>
      <p className="mb-1">
        Für <b>8 Stunden</b>deiner{' '}
        <a
          href="https://rovas.app/freemap-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          freiwilligen Arbeit
        </a>{' '}
        oder <b>8 €</b> erhältst du ein Jahr Zugang mit:
      </p>
      <ul>
        <li>entferntem Werbebanner</li>
        <li
          className="text-decoration-underline"
          title="Hochauflösende detaillierte Schummerung der Slowakei und Tschechiens, höchste Zoomstufen der Outdoor-Karte, höchste Zoomstufen der Orthofotokarten der Slowakei und Tschechiens, verschiedene WMS-basierte Karten"
        >
          Premium-Kartenebenen
        </li>
        <li>Premium-Fotos</li>
        <li>multimodale Routenplanung</li>
      </ul>
    </>
  ),

  stepsForAnonymous: (
    <>
      <div className="fw-bold">Vorgehensweise</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Schritt 1</span> – Erstelle ein Konto
          hier bei Freemap (unten)
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Schritt 2</span> – In der App Rováš, zu
          der wir dich nach der Registrierung weiterleiten, sende uns die
          Zahlung.
        </p>
      </div>
    </>
  ),
  continue: 'Weiter',
  success: 'Glückwunsch, du hast Premium-Zugang erhalten!',
  becomePremium: 'Premium-Zugang erhalten',
  youArePremium: (date) => (
    <>
      Du hast Premium-Zugang bis <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Nur mit Premium-Zugang verfügbar.',
  alreadyPremium: 'Du hast bereits Premium-Zugang.',
  premiumUser: 'Nutzer mit Premium-Zugang',
};

export default de;
