import React, { ReactElement, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { objectsSetFilter } from 'fm3/actions/objectsActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';

import { useTranslator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { convertToDrawing } from 'fm3/actions/mainActions';

export function ObjectsMenu(): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const zoom = useSelector((state: RootState) => state.map.zoom);

  const hasObjects = useSelector(
    (state: RootState) => state.objects.objects.length > 0,
  );

  const [filter, setFilter] = useState('');

  const [dropdownOpened, setDropdownOpened] = useState(false);

  const handleFilterSet = useCallback((e: React.FormEvent<FormControl>) => {
    setFilter((e.target as HTMLInputElement).value);
  }, []);

  const handleToggle = useCallback(() => {
    setDropdownOpened(!dropdownOpened);
  }, [dropdownOpened]);

  const handleSelect = useCallback(
    (id: unknown) => {
      if (zoom < 12) {
        dispatch(
          toastsAdd({
            id: 'objects.lowZoomAlert',
            messageKey: 'objects.lowZoomAlert.message',
            style: 'warning',
            actions: [
              {
                // name: 'Priblíž a hľadaj', TODO
                nameKey: 'objects.lowZoomAlert.zoom',
                action: [mapRefocus({ zoom: 12 })],
              },
            ],
          }),
        );
      } else if (typeof id === 'number') {
        dispatch(objectsSetFilter(id));
      }
    },
    [zoom, dispatch],
  );

  const FormGroup2 = FormGroup as any; // hacked missing attribute "bsRole" in type

  return (
    <>
      <Dropdown
        className="dropdown-long"
        id="objectsMenuDropdown"
        onToggle={handleToggle}
        open={dropdownOpened}
      >
        <FormGroup2 bsRole="toggle">
          <FormControl
            type="text"
            placeholder={t('objects.type')}
            onChange={handleFilterSet}
            value={filter}
          />
        </FormGroup2>
        <Dropdown.Menu>
          {poiTypeGroups.map((pointTypeGroup, i) => {
            const gid = pointTypeGroup.id;

            const items = poiTypes
              .filter(({ group }) => group === gid)
              .filter(
                ({ id }) =>
                  t(`objects.subcategories.${id}`)
                    .toLowerCase()
                    .indexOf(filter.toLowerCase()) !== -1,
              )
              .map(({ group, id, icon }) => (
                <MenuItem key={id} eventKey={id} onSelect={handleSelect}>
                  <img
                    src={require(`../images/mapIcons/${icon}.png`)}
                    alt={`${group}-${icon}`}
                  />{' '}
                  {t(`objects.subcategories.${id}`)}
                </MenuItem>
              ));

            return items.length === 0 ? null : (
              <React.Fragment key={gid}>
                {i > 0 && <MenuItem divider />}
                <MenuItem header>{t(`objects.categories.${gid}`)}</MenuItem>
                {items}
              </React.Fragment>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>{' '}
      <Button
        onClick={() => {
          dispatch(convertToDrawing(undefined));
        }}
        disabled={!hasObjects}
        title={t('general.convertToDrawing')}
      >
        <FontAwesomeIcon icon="pencil" />
        <span className="hidden-xs"> {t('general.convertToDrawing')}</span>
      </Button>
    </>
  );
}
