import axios from 'axios';
import { setErrorTicketId } from 'fm3/actions/mainActions';

let store;

export function setStore(s) {
  store = s;
}

window.addEventListener('error', ({ error }) => {
  // eslint-disable-next-line
  console.error('Application error:', error);

  const s = store && store.getState();
  const state = s && { ...s, l10n: { ...s.l10n, translations: null } };

  axios.post(
    `${process.env.API_URL}/logger`,
    {
      level: 'error',
      message: 'Webapp error.',
      details: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        localStorage,
        error: error.stack,
        state,
        action: error.action,
      },
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
});

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
