import { ReactElement, useEffect, useState } from 'react';
import { getNameFromOsmElement } from '../../osm/osmNameResolver';
import routes from './hiking-routes.overpass';
import { useNoindex } from './useNoindex';

type Link = {
  key: string;
  href: string;
  text: string;
};

export function HikingIndex(): ReactElement {
  useNoindex();

  const [links, setLinks] = useState<Link[]>([]);

  const lang = 'sk';

  useEffect(() => {
    Promise.all(
      routes.elements.map((el: any) =>
        getNameFromOsmElement(el.tags, el.type, lang).then((res: any) => [
          el,
          res.join(': '),
        ]),
      ),
    ).then((items: any) =>
      setLinks(
        items.map(([el, res]: any) => ({
          href: `?layers=X&osm-${el.type}=${el.id}`,
          text: res,
          key: `${el.type}-${el.id}`,
        })),
      ),
    );
  }, []);

  return (
    <main lang={lang}>
      <h1>Turistické trasy na Slovensku</h1>
      <ul>
        {links.map((link) => (
          <li key={link.key}>
            <a href={link.href}>{link.text}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
