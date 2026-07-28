import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const de: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Premium-Zugang erhalten',

  commonHeader: (price) => (
    <>
      <p>
        <strong>Freemap Premium</strong> ist ein optionales Jahresabo, das die
        App erweitert.
      </p>
      <p className="mb-1">
        Für <b>{price} €</b> pro Jahr erhältst du:
      </p>
      <ul>
        <li>entferntes Werbebanner</li>
        <li
          className="text-decoration-underline fm-cursor-help"
          title="Hochauflösende detaillierte Schummerung der Slowakei und Tschechiens, höchste Zoomstufen der Outdoor-Karte, höchste Zoomstufen der Orthofotokarten der Slowakei und Tschechiens, verschiedene WMS-basierte Karten"
        >
          Premium-Kartenebenen
        </li>
        <li>Premium-Fotos</li>
        <li>multimodale Routenplanung</li>
        <li>hochauflösende Höhendaten (viele europäische Länder)</li>
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
  alreadySubscribed: 'Du hast bereits ein aktives Abo.',
  premiumUser: 'Nutzer mit Premium-Zugang',
  payOnce: 'Einmalig für ein Jahr zahlen',
  paySubscription: 'Jährliches Abo (verlängert sich automatisch)',
  subscribe: 'Abonnieren',
  payWithChrons: 'Mit Chrons bezahlen',
  chronsHint: (
    <>
      Wenn Sie Premium-Zugang für in <RovasLink>Rovas</RovasLink> gemeldete
      ehrenamtliche Arbeit erhalten möchten, wählen Sie die Zahlung mit Chrons.
    </>
  ),
  priceIncrease: ({ date, oldPrice, newPrice }) =>
    `Ab ${date} wird der Premium-Zugang ${newPrice}\xa0€ pro Jahr kosten. Wenn Sie vorher ein Abo abschließen, bleibt Ihnen der Preis von ${oldPrice}\xa0€ pro Jahr, solange das Abo aktiv ist. Ein Einmalkauf kostet ${oldPrice}\xa0€ nur für dieses eine Jahr — das nächste zum dann gültigen Preis.`,
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `Ab ${date} wird der Premium-Zugang ${newPrice}\xa0€ pro Jahr kosten. Wenn Sie vorher ein Abo abschließen, bleibt Ihnen der Preis von ${oldPrice}\xa0€ pro Jahr, solange das Abo aktiv ist.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `Ab ${date} wird der Premium-Zugang ${newPrice}\xa0€ pro Jahr kosten. Wenn Sie vorher zu einem Jahresabo wechseln, bleibt Ihnen der Jahrespreis von ${oldPrice}\xa0€, solange das Abo aktiv ist. Abgerechnet wird erst, wenn das bereits bezahlte Jahr abgelaufen ist, Sie zahlen also nichts doppelt.`,
  switchTitle: 'Behalten Sie Ihren aktuellen Preis',
  switchStatus: ({ expiration }) =>
    `Sie haben Premium-Zugang bis ${expiration} — es ist kein Abo.`,
  switchOffer: ({ date, oldPrice, newPrice }) =>
    `Ab ${date} wird der Premium-Zugang ${newPrice}\xa0€ pro Jahr kosten. Wenn Sie vorher zu einem Jahresabo wechseln, bleibt Ihnen der Jahrespreis von ${oldPrice}\xa0€, solange das Abo aktiv ist.`,
  switchNoDoubleCharge: ({ expiration }) =>
    `Durch den Wechsel verlieren Sie nichts: Das Abo beginnt mit einem kostenlosen Zeitraum bis ${expiration}, und erst dann wird die erste Zahlung fällig.`,
  switchAction: 'Zum Jahresabo wechseln',
  priceIncreaseMini: ({ date, newPrice }) =>
    `Premium ab ${date} für ${newPrice}\xa0€ pro Jahr.`,
  priceIncreaseMore: 'mehr…',
};

export default de;
