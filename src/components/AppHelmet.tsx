import { useMessages } from 'fm3/l10nInjector';
import { Helmet } from 'react-helmet-async';

export function AppHelmet(): null | JSX.Element {
  const m = useMessages();

  return !m ? null : (
    <Helmet>
      <title>{m?.main.title}</title>

      <meta property="og:title" content={m?.main.title} />

      <meta name="description" content={m?.main.description} />
      <meta property="og:description" content={m?.main.description} />
    </Helmet>
  );
}
