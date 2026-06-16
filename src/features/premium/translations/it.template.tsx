import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const it: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Ottieni accesso premium',
  commonHeader: (
    <>
      <p>
        <strong>Freemap Premium</strong> è un abbonamento annuale facoltativo
        che potenzia l’app.
      </p>
      <p>
        Con <b>8 €</b> all’anno ottieni:
      </p>
      <ul>
        <li>rimozione del banner pubblicitario</li>
        <li
          className="text-decoration-underline"
          title="Strava Heatmap, ombreggiatura dettagliata ad alta risoluzione di Slovacchia e Cechia, livelli di zoom più alti della mappa Outdoor, livelli di zoom più alti delle mappe ortofoto di Slovacchia e Cechia, varie mappe basate su WMS"
        >
          livelli mappa premium
        </li>
        <li>foto premium</li>
        <li>routing multimodale</li>
      </ul>
      <p className="mb-0">Freemap resta gratuita e aperta.</p>
    </>
  ),
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
  continue: 'Continua',
  success: 'Congratulazioni, hai ottenuto l’accesso premium!',
  becomePremium: 'Ottieni accesso premium',
  youArePremium: (date) => (
    <>
      Hai accesso premium fino al <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Disponibile solo con accesso premium.',
  alreadyPremium: 'Hai già accesso premium.',
  premiumUser: 'Utente con accesso premium',
  payOnce: 'Paga una volta — 1 anno',
  paySubscription: 'Abbonamento annuale (rinnovo automatico)',
  payWhatYouWant: 'Scegli tu l’importo — minimo 8 €.',
};

export default it;
