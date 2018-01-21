import axios from 'axios';
import { setErrorTicketId } from 'fm3/actions/mainActions';

let store;

export function setStore(s) {
  store = s;
}

// eslint-disable-next-line
Error.prototype.toJSON = function toJSON() {
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

export function sendError(errDetails) {
  // eslint-disable-next-line
  console.error('Application error:', errDetails);

  const state = store && store.getState();

  axios.post(
    `${process.env.API_URL}/logger`,
    {
      level: 'error',
      message: 'Webapp error.',
      error: errDetails,
      url: window.location.href,
      userAgent: navigator.userAgent,
      localStorage,
      state: { ...state, l10n: { ...state.l10n, translations: null } },
    },
    {
      validateStatus: status => status === 200,
    },
  ).then(
    ({ data }) => {
      handle(data.id);
    },
    () => {
      handle('???');
    },
  );
}

function handle(id) {
  if (store) {
    store.dispatch(setErrorTicketId(id));
  } else {
    document.body.innerHTML = `
      <h1>Application error</h1>
      <p>Ticket ID: ${id}.</p>
      <p>You can send ticket ID and steps how to reproduce the error to <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.</p>`;
  }
}
