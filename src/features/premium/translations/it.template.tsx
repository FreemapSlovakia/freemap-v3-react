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
        Con <b>{price} €</b> all’anno ottieni:
      </p>
      <ul>
        <li>rimozione del banner pubblicitario</li>
        <li>
          <HintTooltip hint="ombreggiatura dettagliata ad alta risoluzione di Slovacchia e Cechia, livelli di zoom più alti della mappa Outdoor, livelli di zoom più alti delle mappe ortofoto di Slovacchia e Cechia, varie mappe basate su WMS">
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
        <li>cronologia più lunga del radar meteo e la sua previsione</li>
        <li>
          colorazione di percorsi e tracce (alcune modalità sono solo premium)
        </li>
      </ul>
      <p className="mb-0">Freemap resta gratuita e aperta.</p>
    </>
  ),
  dtmAreaNames: { gb: 'Inghilterra' },
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Come funziona</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Passo 1</span> - accedi o crea un
          account Freemap gratuito (sotto).
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Passo 2</span> - verrai reindirizzato
          per completare il pagamento.
        </p>
      </div>
    </>
  ),
  success: 'Congratulazioni, hai ottenuto l’accesso premium!',
  becomePremium: 'Ottieni accesso premium',
  youArePremium: (date) => (
    <>
      Hai accesso premium fino al <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Disponibile solo con accesso premium.',
  noPremium: 'Non hai accesso premium.',
  clickToActivate: 'Clicca per attivare.',
  higherPrecisionElevation:
    'Dati di quota a maggiore precisione disponibili con accesso premium.',
  alreadyPremium: 'Hai già accesso premium.',
  alreadySubscribed: 'Hai già un abbonamento attivo.',
  premiumUser: 'Utente con accesso premium',
  payOnce: 'Paga una volta per un anno',
  paySubscription: 'Abbonamento annuale (rinnovo automatico)',
  payWithChrons: 'Paga con i Chron',
  chronsHint: (
    <>
      Se desideri ottenere l&apos;accesso premium per il lavoro di volontariato
      segnalato in <RovasLink>Rovas</RovasLink>, scegli di pagare con i Chron.
    </>
  ),
  subscriptionReassurance: ({ price }) =>
    `Il prezzo di ${price}\xa0€ all’anno resta tuo finché l’abbonamento è attivo. Puoi annullarlo in qualsiasi momento — l’accesso premium prosegue poi fino alla fine dell’anno pagato.`,
  youArePremiumRenews: (
    <>Hai accesso premium. L’abbonamento si rinnova automaticamente.</>
  ),
};

export default it;
