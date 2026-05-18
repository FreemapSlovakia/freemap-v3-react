import { useMessages } from '@features/l10n/l10nInjector.js';
import { SourceName } from '@features/objects/components/SourceName.js';
import {
  ActionIcon,
  Combobox,
  ScrollArea,
  TextInput,
  useCombobox,
} from '@mantine/core';
import {
  getNameFromOsmElement,
  resolveGenericName,
} from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import { useGenericNameResolver } from '@osm/useGenericNameResolver.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import {
  type FeatureId,
  featureIdsEqual,
  type OsmFeatureId,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import {
  type ChangeEvent,
  Fragment,
  type ReactElement,
  type ReactNode,
  type SubmitEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FaDrawPolygon, FaSearch } from 'react-icons/fa';
import { GoDotFill } from 'react-icons/go';
import { MdPolyline } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import {
  type SearchResult,
  type SearchSource,
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from '../model/actions.js';
import classes from './SearchMenu.module.css';

type Props = {
  hidden?: boolean;
  preventShortcut?: boolean;
};

const typeSymbol: Record<OsmFeatureId['elementType'], ReactNode> = {
  node: <GoDotFill />,
  way: <MdPolyline />,
  relation: <FaDrawPolygon />,
};

const wmsShapeSymbol: Record<string, ReactNode> = {
  Point: <GoDotFill />,
  MultiPoint: <GoDotFill />,
  LineString: <MdPolyline />,
  MultiLineString: <MdPolyline />,
  Polyline: <MdPolyline />,
  Polygon: <FaDrawPolygon />,
  MultiPolygon: <FaDrawPolygon />,
};

export function SearchMenu({ hidden, preventShortcut }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const results = useAppSelector((state) => state.search.results);

  const selectedResult = useAppSelector((state) => state.search.selectedResult);

  const query = useAppSelector((state) => state.search.query);

  const [value, setValue] = useState(query);

  useEffect(() => {
    setValue(query);
  }, [query]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const handleSearch = useCallback(
    (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (value.length > 2) {
        dispatch(searchSetQuery({ query: value }));
      }
    },
    [dispatch, value],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;

      setValue(value);

      if (results.length > 0) {
        dispatch(searchSetResults([]));
      }
    },
    [dispatch, results.length],
  );

  const handleOptionSubmit = useCallback(
    (idString: string) => {
      const id: FeatureId = JSON.parse(idString);

      const result = results.find((item) => featureIdsEqual(item.id, id));

      if (result) {
        dispatch(searchSelectResult({ result, showToast: result.showToast }));
      }

      combobox.closeDropdown();
    },
    [results, dispatch, combobox],
  );

  // React only when the results identity changes — not when combobox state
  // does. The combobox callback refs change every open/close, so depending on
  // them would cause an infinite open loop (closing the dropdown on result
  // click would re-trigger the effect and reopen it).
  // biome-ignore lint/correctness/useExhaustiveDependencies: see comment above
  useEffect(() => {
    if (results.length) {
      if (!inputRef.current || document.activeElement === inputRef.current) {
        combobox.openDropdown();
      } else {
        inputRef.current?.focus();
      }
    } else {
      combobox.closeDropdown();
    }
  }, [results]);

  useEffect(() => {
    if (hidden || preventShortcut) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (inputRef.current) {
        if (
          e.code === 'F3' ||
          ((e.ctrlKey || e.metaKey) && e.code === 'KeyF')
        ) {
          inputRef.current.focus();

          e.preventDefault();
        } else if (
          inputRef.current === document.activeElement &&
          e.code === 'Escape'
        ) {
          inputRef.current.blur();

          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [hidden, preventShortcut]);

  let prevSource: SearchSource | undefined = undefined;

  return (
    <form
      onSubmit={handleSearch}
      style={{ display: hidden ? 'none' : '' }}
      className="ms-1"
    >
      <Combobox
        store={combobox}
        onOptionSubmit={handleOptionSubmit}
        width="fit-content"
        position="bottom-start"
      >
        <Combobox.Target>
          <TextInput
            classNames={{
              root: classes['search-input'],
            }}
            type="search"
            value={value}
            onChange={handleChange}
            placeholder={m?.search.placeholder}
            ref={inputRef}
            onClick={() => results.length > 0 && combobox.openDropdown()}
            onFocus={() => results.length > 0 && combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
            rightSectionWidth={value && results.length === 0 ? 56 : undefined}
            rightSection={
              <>
                {value && (
                  <Combobox.ClearButton
                    onClear={() => {
                      setValue('');

                      if (results.length > 0) {
                        dispatch(searchSetResults([]));
                      }
                    }}
                  />
                )}

                {results.length === 0 && (
                  <ActionIcon
                    variant="light"
                    type="submit"
                    title={m?.search.buttonTitle}
                    disabled={!value}
                  >
                    <FaSearch />
                  </ActionIcon>
                )}
              </>
            }
          />
        </Combobox.Target>

        <Combobox.Dropdown className={classes['search-dropdown']}>
          <Combobox.Options>
            <ScrollArea.Autosize mah="calc(100dvh - 130px)" type="auto">
              {results.map((result) => {
                const id = stringifyFeatureId(result.id);

                const divider =
                  !(
                    [
                      'nominatim-forward',
                      'bbox',
                      'coords',
                      'geojson',
                    ] as SearchSource[]
                  ).includes(result.source) && prevSource !== result.source ? (
                    <div className="dropdown-caption-divider">
                      <SourceName result={result} />
                    </div>
                  ) : null;

                prevSource = result.source;

                const isActive =
                  selectedResult !== null &&
                  featureIdsEqual(result.id, selectedResult.id);

                return (
                  <Fragment key={id}>
                    {divider}

                    <Combobox.Option value={id} active={isActive}>
                      <Result value={result} />
                    </Combobox.Option>
                  </Fragment>
                );
              })}
            </ScrollArea.Autosize>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </form>
  );
}

function Result({ value }: { value: SearchResult }) {
  const m = useMessages();

  const tags = value.geojson.properties ?? {};

  const genericName = useGenericNameResolver(value);

  const language = useEffectiveChosenLanguage();

  const name = value.displayName || getNameFromOsmElement(tags, language);

  const img = resolveGenericName(osmTagToIconMapping, tags);

  return (
    <div className="d-flex flex-column mx-n2">
      <div className="d-flex f-gap-2 align-items-center">
        {img.length > 0 ? (
          <img src={img[0]} style={{ width: '1em', height: '1em' }} />
        ) : (
          <span
            style={{
              width: '1em',
              height: '1em',
              display: 'inline-block',
              opacity: 0.25,
              backgroundColor: 'gray',
            }}
            className="flex-shrink-0"
          />
        )}

        <div className="flex-grow-1 text-truncate">
          {genericName || m?.general.unnamed}
        </div>

        <div style={{ opacity: 0.25 }}>
          {value.id.type === 'osm'
            ? typeSymbol[value.id.elementType]
            : value.id.type === 'wms' && tags['Shape']
              ? (wmsShapeSymbol[tags['Shape'] as string] ?? null)
              : null}
        </div>
      </div>

      {name && <small className="ms-4 text-truncate">{name}</small>}
    </div>
  );
}
