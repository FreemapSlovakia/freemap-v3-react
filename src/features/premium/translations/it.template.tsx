import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const it: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Ottieni accesso premium',
  commonHeader: (price) => (
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
        <li
          className="text-decoration-underline fm-cursor-help"
          title="ombreggiatura dettagliata ad alta risoluzione di Slovacchia e Cechia, livelli di zoom più alti della mappa Outdoor, livelli di zoom più alti delle mappe ortofoto di Slovacchia e Cechia, varie mappe basate su WMS"
        >
          livelli mappa premium
        </li>
        <li>foto premium</li>
        <li>routing multimodale</li>
        <li>dati di elevazione ad alta risoluzione (molti paesi europei)</li>
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
  premiumUser: 'Utente con accesso premium',
  payOnce: 'Paga una volta per un anno',
  paySubscription: 'Abbonamento annuale (rinnovo automatico)',
  subscribe: 'Abbonati',
  payWithChrons: 'Paga con i Chron',
  chronsHint: (
    <>
      Se desideri ottenere l&apos;accesso premium per il lavoro di volontariato
      segnalato in <RovasLink>Rovas</RovasLink>, scegli di pagare con i Chron.
    </>
  ),
  priceIncrease: ({ date, oldPrice, newPrice }) =>
    `Dal ${date} l’accesso premium costerà ${newPrice}\xa0€ all’anno. Se ti abboni prima, il prezzo di ${oldPrice}\xa0€ all’anno resta tuo finché l’abbonamento è attivo. L’acquisto una tantum costa ${oldPrice}\xa0€ solo per quell’anno — il successivo sarà al prezzo in vigore in quel momento.`,
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `Dal ${date} l’accesso premium costerà ${newPrice}\xa0€ all’anno. Se ti abboni prima, il prezzo di ${oldPrice}\xa0€ all’anno resta tuo finché l’abbonamento è attivo.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `Dal ${date} l’accesso premium costerà ${newPrice}\xa0€ all’anno. Se passi a un abbonamento annuale prima di allora, il prezzo annuale di ${oldPrice}\xa0€ resta tuo finché l’abbonamento è attivo. L’addebito parte solo quando scade l’anno che hai già pagato, quindi non paghi nulla due volte.`,
  priceIncreaseMini: ({ date, newPrice }) =>
    `Premium a ${newPrice}\xa0€ all’anno dal ${date}.`,
  priceIncreaseMore: 'altro…',
  winbackOffer: ({ price, expiredAt }) =>
    `Il tuo accesso premium è scaduto il ${expiredAt}. Come ex cliente puoi tornare al prezzo originale: un abbonamento annuale con rinnovo automatico a ${price}\xa0€, mantenuto finché resta attivo. Questa offerta è riservata a te e può essere usata una sola volta.`,
  winbackAccept: ({ price }) => `Abbonati per ${price}\xa0€ all’anno`,
};

export default it;
