import { ReactElement } from 'react';
import { useNoindex } from './useNoindex';

export function MainIndex(): ReactElement {
  useNoindex();

  return (
    <ul>
      <li>
        <a href="?layers=X">Mapa</a>
      </li>
      <li>
        <a href="?bot-category=bicycle-routes">Cyklotrasy</a>
      </li>
      <li>
        <a href="?bot-category=hiking-routes">Turistické trasy</a>
      </li>
      <li>
        <a href="?bot-category=admin-boundaries">Administratívne hranice</a>
      </li>
      <li>
        <a href="?bot-category=geomorfological-units">
          Geomorfologické oblasti
        </a>
      </li>
      <li>
        <a href="?bot-category=valleys">Doliny</a>
      </li>
      <li>
        <a href="?bot-category=peaks">Vrcholy</a>
      </li>
      <li>
        <a href="?bot-category=springs">Pramene</a>
      </li>
      <li>
        <a href="?bot-category=caves">Jaskyne</a>
      </li>
      <li>
        <a href="?bot-category=waterways">Vodné toky</a>
      </li>
      <li>
        <a href="?bot-category=waters">Vodné plochy</a>
      </li>
      <li>
        <a href="?bot-category=protected-areas">Chránené oblasti</a>
      </li>
    </ul>
  );
}
