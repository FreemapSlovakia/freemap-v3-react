import { setErrorTicketId } from './actions/mainActions.js';
import type { MyStore } from './store.js';

let store: MyStore;

export function setStore(s: MyStore): void {
  store = s;
}

(Error.prototype as any).toJSON = function toJSON() {
  return {
    name: this.name,
    message: this.message,
    fileName: this.fileName,
    lineNumber: this.lineNumber,
    columnNumber: this.columnNumber,
    description: this.description, // MS
    number: this.number, // MS
    stack: this.stack,
  };
};

window.addEventListener('error', (evt) => {
  sendError({
    kind: 'global',
    message: evt.message,
    filename: evt.filename,
    lineno: evt.lineno,
    colno: evt.colno,
    error: evt.error,
  });
});

interface ErrorDetails {
  kind: string;
  action?: unknown;
  error: unknown;
  message?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}

export function sendError(errDetails: ErrorDetails): void {
  // filter out old browsers
  if (!Array.prototype.flatMap) {
    return;
  }

  console.error('Application error');

  console.error(errDetails);

  const eventId = window.Sentry?.captureException(errDetails.error);

  window._paq.push(['trackEvent', 'Main', 'error', eventId]);

  if (errDetails.message === 'Script error.' || errDetails.filename === '') {
    // don't show to user
  } else {
    handle(eventId);
  }
}

function handle(id?: string) {
  if (store) {
    store.dispatch(setErrorTicketId(id));
  } else {
    document.body.innerHTML = `
      <h1>Application error</h1>
      <p>Ticket ID: ${id}.</p>
      <p>You can send ticket ID and steps how to reproduce the error to <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.</p>

      <h1>Chyba aplikácie</h1>
      <p>ID incidentu: ${id}.</p>
      <p>Na <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a> nám môžete zaslať toto ID a kroky, ako sa vám to podarilo.</p>

      <h1>Chyba aplikace</h1>
      <p>ID tiketu: ${id}.</p>
      <p>Na <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a> nám můžete zaslat toto ID a kroky vedoucí k chybě.</p>

      <h1>Błąd aplikacji</h1>
      <p>ID zgłoszenia: ${id}.</p>
      <p>Możesz wysłać ID zgłoszenia oraz kroki do odtworzenia błędu na adres <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.</p>

      <h1>Anwendungsfehler</h1>
      <p>Ticket-ID: ${id}.</p>
      <p>Sie können die Ticket-ID und die Schritte zur Reproduktion des Fehlers an <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a> senden.</p>

      <h1>Alkalmazáshiba</h1>
      <p>Jegyazonosító (ticket ID): ${id}.</p>
      <p>
        A jegyazonosítót és a hiba újbóli megjelenéséhez vezető lépések leírását a következő e-mail címre küldheti:
        <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.
      </p>

      <h1>Errore dell'applicazione</h1>
      <p>Ticket Nr.: ${id}.</p>
      <p>Puoi inviare il tuo numero di ticket e i passaggi per riprodurre l'errore a <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.</p>
    `;
  }
}
