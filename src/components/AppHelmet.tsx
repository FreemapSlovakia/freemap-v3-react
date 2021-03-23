import { useMessages } from 'fm3/l10nInjector';
import { Helmet } from 'react-helmet';

type Props = { children: JSX.Element };

export function AppHelmet({ children }: Props): JSX.Element {
  const m = useMessages();

  return !m ? (
    children
  ) : (
    <Helmet>
      <title>{m.main.title}</title>

      <meta property="og:title" content={m.main.title} />

      <meta name="description" content={m.main.description} />
      <meta property="og:description" content={m.main.description} />

      {children}
    </Helmet>
  );
}
