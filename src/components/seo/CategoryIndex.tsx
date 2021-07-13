import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { getNameFromOsmElement } from '../../osm/osmNameResolver';
import { useNoindex } from './useNoindex';

type Link = {
  key: string;
  href: string;
  text: ReactNode;
};

type Props = { category: string };

export function CategoryIndex({ category }: Props): ReactElement {
  useNoindex();

  const [links, setLinks] = useState<Link[]>([]);

  const lang = 'sk';

  useEffect(() => {
    import(`./overpassQueries/${category}.overpass`)
      .then((items) =>
        Promise.all(
          items.elements.map((el: any) =>
            getNameFromOsmElement(el.tags, el.type, lang).then((res: any) => [
              el,
              <>
                {res[0]} <i>{res[1]}</i>
              </>,
            ]),
          ),
        ),
      )
      .then((items: any) =>
        setLinks(
          items.map(([el, res]: any) => ({
            href: `?layers=X&osm-${el.type}=${el.id}`,
            text: res,
            key: `${el.type}-${el.id}`,
          })),
        ),
      );
  }, [category]);

  return (
    <ul lang={lang}>
      {links.map((link) => (
        <li key={link.key}>
          <a href={link.href}>{link.text}</a>
        </li>
      ))}
    </ul>
  );
}
