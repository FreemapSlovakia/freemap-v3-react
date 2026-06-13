import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { PremiumMessages } from './PremiumMessages.js';

const it: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Ottieni accesso premium',
  commonHeader: (
    <>
      <p>
        <strong>Sostieni i volontari che creano questa mappa!</strong>
      </p>
      <p>
        Con <b>8 ore</b> di{' '}
        <a
          href="https://rovas.app/freemap-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          lavoro volontario
        </a>{' '}
        oppure <b>8 €</b> otterrai un anno di accesso con:
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
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Procedura</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Passo 1</span> - crea un account qui in
          Freemap (sotto)
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Passo 2</span> - nell'applicazione
          Rovas, dove ti indirizzeremo dopo la registrazione, inviaci il
          pagamento.
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
};

export default it;
