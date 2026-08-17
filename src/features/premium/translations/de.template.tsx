import { HintTooltip } from '@shared/components/HintTooltip.js';
import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const de: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Premium-Zugang erhalten',

  commonHeader: (price, dtmCountries) => (
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
        <li>
          <HintTooltip hint="Hochauflösende detaillierte Schummerung der Slowakei und Tschechiens, höchste Zoomstufen der Outdoor-Karte, höchste Zoomstufen der Orthofotokarten der Slowakei und Tschechiens, verschiedene WMS-basierte Karten">
            Premium-Kartenebenen
          </HintTooltip>
        </li>
        <li>Premium-Fotos</li>
        <li>multimodale Routenplanung</li>
        <li>Optimierung der Reihenfolge der Routenpunkte</li>
        <li>
          <HintTooltip hint={dtmCountries}>
            hochauflösende Höhendaten (viele europäische Länder)
          </HintTooltip>
        </li>
        <li>längerer Wetterradar-Verlauf und dessen Vorhersage</li>
        <li>
          Einfärben von Routen und Tracks (einige Modi sind nur mit Premium
          verfügbar)
        </li>
      </ul>
      <p className="mb-0">Freemap bleibt kostenlos und offen.</p>
    </>
  ),

  dtmAreaNames: { gb: 'England' },
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
  payOnceWithPrices: ({ oldPrice, newPrice }) =>
    `Einmalig für ein Jahr zahlen — ${oldPrice}\xa0€; Preis nächstes Jahr ${newPrice}\xa0€`,
  paySubscription: 'Jährliches Abo (verlängert sich automatisch)',
  payWithChrons: 'Mit Chrons bezahlen',
  chronsHint: (
    <>
      Wenn Sie Premium-Zugang für in <RovasLink>Rovas</RovasLink> gemeldete
      ehrenamtliche Arbeit erhalten möchten, wählen Sie die Zahlung mit Chrons.
    </>
  ),
  priceIncreaseHeading: ({ date, newPrice }) =>
    `Ab ${date} wird der Premium-Zugang ${newPrice}\xa0€ pro Jahr kosten.`,
  compareNow: 'Jetzt',
  compareNextYear: 'Preis nächstes Jahr',
  compareSubscription: 'Jahresabo',
  compareOnce: 'Einmalkauf',
  compareNoSwitch: 'Ohne Wechsel',
  subscriptionReassurance: ({ oldPrice }) =>
    `Der Preis von ${oldPrice}\xa0€ pro Jahr bleibt Ihnen, solange das Abo aktiv ist. Sie können es jederzeit kündigen — der Premium-Zugang läuft dann bis zum Ende des bezahlten Jahres.`,
  payOnceConfirmTitle: 'So behalten Sie den aktuellen Preis nicht',
  payOnceConfirmBody: ({ date, oldPrice, newPrice }) =>
    `Ein Einmalkauf deckt ein Jahr für ${oldPrice}\xa0€ ab. Das nächste kostet den dann gültigen Preis — ab ${date} sind das ${newPrice}\xa0€ pro Jahr. Ein jetzt abgeschlossenes Abo hält den Preis von ${oldPrice}\xa0€ pro Jahr, solange es aktiv ist, und Sie können es jederzeit kündigen.`,
  payOnceConfirmSubscribe: 'Lieber abonnieren',
  payOnceConfirmContinue: 'Trotzdem einmalig zahlen',
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `Ab ${date} wird der Premium-Zugang ${newPrice}\xa0€ pro Jahr kosten. Wenn Sie vorher ein Abo abschließen, bleibt Ihnen der Preis von ${oldPrice}\xa0€ pro Jahr, solange das Abo aktiv ist.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `Ab ${date} kostet der Premium-Zugang ${newPrice}\xa0€ pro Jahr. Wenn Sie vorher zu einem Abo wechseln, bleibt es für Sie bei ${oldPrice}\xa0€ — abgerechnet wird erst, wenn Ihr bereits bezahltes Jahr abgelaufen ist.`,
  switchTitle: 'Behalten Sie Ihren aktuellen Preis',
  switchStatus: ({ expiration }) =>
    `Sie haben Premium-Zugang bis ${expiration} — es ist kein Abo.`,
  switchNoDoubleCharge: ({ expiration }) =>
    `Durch den Wechsel verlieren Sie nichts: Das Abo beginnt mit einem kostenlosen Zeitraum bis ${expiration}, und erst dann wird die erste Zahlung fällig.`,
  switchAction: 'Zum Jahresabo wechseln',
  priceIncreaseMini: ({ date, newPrice }) =>
    `Premium ab ${date} für ${newPrice}\xa0€ pro Jahr.`,
  priceIncreaseMore: 'mehr…',
  youArePremiumRenews: (
    <>Du hast Premium-Zugang. Dein Abonnement verlängert sich automatisch.</>
  ),
};

export default de;
