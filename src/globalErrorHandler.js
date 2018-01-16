import axios from 'axios';

// eslint-disable-next-line
Error.prototype.toJSON = function toJSON() {
  return this.stack;
};

window.addEventListener('error', ({ error }) => {
  // setTimeout is hack to not handle error if already handled in componentDidCatch
  setTimeout(() => {
    if (!error.handledInErrorCatcher) {
      handleError(error);
    }
  });
});

function handleError(error) {
  // eslint-disable-next-line
  console.error('Application error:', error);

  axios.post(
    `${process.env.API_URL}/logger`,
    {
      level: 'error',
      message: 'Global webapp error.',
      details: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        localStorage,
        error: error.stack,
      },
    },
    {
      validateStatus: status => status === 200,
    },
  )
    .then(({ data }) => {
      document.body.innerHTML = `
        <h1>Application error</h1>
        <p>Ticket ID: ${data.id}.</p>
        <p>You can send ticket ID and steps how to reproduce the error to <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.</p>`;
    });
}
