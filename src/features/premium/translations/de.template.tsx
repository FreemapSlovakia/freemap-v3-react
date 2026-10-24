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
        Für <b>{price} €</b> pro Jahr erhalten Sie:
      </p>
      <ul>
        <li>entferntes Werbebanner</li>
        <li>
          <HintTooltip
            hint={
              <ul className="mb-0 ps-3 text-start">
                <li>höchste Zoomstufen der Outdoor-Karte</li>
                <li>
                  höchste Zoomstufen der Orthofotokarten der Slowakei und
                  Tschechiens
                </li>
                <li>
                  hochauflösende detaillierte Schummerung der Slowakei und
                  Tschechiens
                </li>
              </ul>
            }
          >
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
        <li>Panorama in höherer Auflösung</li>
        <li>Sichtbarkeitsanalyse in höherer Auflösung</li>
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
  purchaseAfterLogin: (
    <>
      Mit der Wahl eines Anmeldeanbieters melden Sie sich an oder erstellen ein
      kostenloses Freemap-Konto. Anschließend geht es weiter zur Zahlung für{' '}
      <strong>Freemap Premium</strong>.
    </>
  ),
  success: 'Glückwunsch, Sie haben Premium-Zugang erhalten!',
  becomePremium: 'Premium-Zugang erhalten',
  youArePremium: (date) => (
    <>
      Sie haben Premium-Zugang bis <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Nur mit Premium-Zugang verfügbar.',
  noPremium: 'Sie haben keinen Premium-Zugang.',
  clickToActivate: 'Zum Aktivieren klicken.',
  higherPrecisionElevation:
    'Höhendaten mit höherer Genauigkeit mit Premium-Zugang verfügbar.',
  higherDetail: 'Feinere Details mit Premium-Zugang verfügbar.',
  alreadyPremium: 'Sie haben bereits Premium-Zugang.',
  alreadySubscribed: 'Sie haben bereits ein aktives Abo.',
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
  subscriptionReassurance: ({ price }) =>
    `Der Preis von ${price}\xa0€ pro Jahr bleibt Ihnen, solange das Abo aktiv ist. Sie können es jederzeit kündigen — der Premium-Zugang läuft dann bis zum Ende des bezahlten Jahres.`,
  youArePremiumRenews: (
    <>Sie haben Premium-Zugang. Ihr Abonnement verlängert sich automatisch.</>
  ),
};

export default de;
