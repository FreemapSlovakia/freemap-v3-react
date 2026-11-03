import { HintTooltip } from '@shared/components/HintTooltip.js';
import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const it: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Ottieni accesso premium',
  commonHeader: (price, dtmCountries) => (
    <>
      <p>
        <strong>Freemap Premium</strong> è un abbonamento annuale facoltativo
        che potenzia l’app.
      </p>
      <p>
        Con <b>{price} €</b> all’anno ottiene:
      </p>
      <ul>
        <li>rimozione del banner pubblicitario</li>
        <li>
          <HintTooltip
            hint={
              <ul className="mb-0 ps-3 text-start">
                <li>livelli di zoom più alti della mappa Outdoor</li>
                <li>
                  livelli di zoom più alti delle mappe ortofoto di Slovacchia e
                  Cechia
                </li>
                <li>
                  ombreggiatura dettagliata ad alta risoluzione di Slovacchia e
                  Cechia
                </li>
              </ul>
            }
          >
            livelli mappa premium
          </HintTooltip>
        </li>
        <li>foto premium</li>
        <li>routing multimodale</li>
        <li>ottimizzazione dell’ordine dei punti del percorso</li>
        <li>
          <HintTooltip hint={dtmCountries}>
            dati di elevazione ad alta risoluzione (molti paesi europei)
          </HintTooltip>
        </li>
        <li>panorama a risoluzione più alta</li>
        <li>analisi di visibilità a risoluzione più alta</li>
        <li>cronologia più lunga del radar meteo e la sua previsione</li>
        <li>
          colorazione di percorsi e tracce (alcune modalità sono solo premium)
        </li>
      </ul>
      <p className="mb-0">Freemap resta gratuita e aperta.</p>
    </>
  ),
  dtmAreaNames: { en: 'Inghilterra', wls: 'Galles' },
  purchaseAfterLogin: (
    <>
      Scegliendo un provider di accesso accede o crea un account Freemap
      gratuito. Proseguirà poi con il pagamento di{' '}
      <strong>Freemap Premium</strong>.
    </>
  ),
  success: 'Congratulazioni, ha ottenuto l’accesso premium!',
  becomePremium: 'Ottieni accesso premium',
  youArePremium: (date) => (
    <>
      Ha accesso premium fino al <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Disponibile solo con accesso premium.',
  noPremium: 'Non ha accesso premium.',
  clickToActivate: 'Clicchi per attivare.',
  higherPrecisionElevation:
    'Dati di quota a maggiore precisione disponibili con accesso premium.',
  higherDetail: 'Dettaglio più fine disponibile con accesso premium.',
  alreadyPremium: 'Ha già accesso premium.',
  alreadySubscribed: 'Ha già un abbonamento attivo.',
  premiumUser: 'Utente con accesso premium',
  payOnce: 'Paga una volta per un anno',
  paySubscription: 'Abbonamento annuale (rinnovo automatico)',
  payWithChrons: 'Paga con i Chron',
  chronsHint: (
    <>
      Se desidera ottenere l&apos;accesso premium per il lavoro di volontariato
      segnalato in <RovasLink>Rovas</RovasLink>, scelga di pagare con i Chron.
    </>
  ),
  subscriptionReassurance: ({ price }) =>
    `Il prezzo di ${price}\xa0€ all’anno resta garantito finché l’abbonamento è attivo. Può annullarlo in qualsiasi momento — l’accesso premium prosegue poi fino alla fine dell’anno pagato.`,
  youArePremiumRenews: (
    <>Ha accesso premium. L’abbonamento si rinnova automaticamente.</>
  ),
};

export default it;
