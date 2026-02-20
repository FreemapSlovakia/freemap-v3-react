import { Fragment, ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaEquals, FaMoneyBill } from 'react-icons/fa';
import { fixedPopperConfig } from '../fixedPopperConfig.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import { TransportType, transportTypeDefs } from '../transportTypeDefs.js';
import { LongPressTooltip } from './LongPressTooltip.js';

type Props = {
  onChange: (value?: TransportType) => void;
  value?: TransportType;
  withDefault?: boolean;
};

export function RoutePlannerTransportType({
  onChange,
  value,
  withDefault = false,
}: Props): ReactElement {
  const m = useMessages();

  const activeTTDef = value && transportTypeDefs[value];

  const ttLabel = activeTTDef
    ? m?.routePlanner.transportType[activeTTDef.msgKey]
    : m?.routePlanner.default;

  const sc = useScrollClasses('vertical');

  return (
    <Dropdown
      className="ms-1"
      id="transport-type"
      onSelect={(transportType) =>
        onChange((transportType || undefined) as TransportType)
      }
    >
      <LongPressTooltip
        breakpoint="lg"
        label={
          activeTTDef ? (
            <>
              {ttLabel ?? '…'}

              {activeTTDef.api !== 'manual' && (
                <>
                  {' '}
                  <small className="text-dark">
                    {activeTTDef.api === 'osrm' ? 'OSRM' : 'GraphHopper'}
                  </small>
                </>
              )}
            </>
          ) : (
            (ttLabel ?? '…')
          )
        }
      >
        {({ label, labelClassName, props }) => (
          <Dropdown.Toggle variant="secondary" {...props}>
            {!value ? <FaEquals /> : (activeTTDef?.icon ?? '')}{' '}
            {value && ['car', 'car-toll', 'bikesharing'].includes(value) && (
              <FaMoneyBill />
            )}
            <span className={labelClassName}> {label}</span>
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <Dropdown.Menu
        popperConfig={fixedPopperConfig}
        className="fm-dropdown-with-scroller"
      >
        <div className="dropdown-long" ref={sc}>
          <div />

          {withDefault && (
            <Dropdown.Item as="button" eventKey="" active={!value}>
              <FaEquals /> {m?.routePlanner.default}
            </Dropdown.Item>
          )}

          {(['manual', 'gh', 'osrm'] as const).map((api) => (
            <Fragment key={api}>
              {api !== 'manual' && (
                <Dropdown.Header>
                  {api === 'osrm' ? 'OSRM' : 'GraphHopper '}
                </Dropdown.Header>
              )}

              {Object.entries(transportTypeDefs)
                .filter(([, def]) => !def.hidden && def.api === api)
                .map(([type, { icon, msgKey: key }]) => (
                  <Dropdown.Item
                    as="button"
                    eventKey={type}
                    key={type}
                    title={m?.routePlanner.transportType[key]}
                    active={value === type}
                  >
                    {icon}{' '}
                    {['car', 'car-toll', 'bikesharing'].includes(type) && (
                      <FaMoneyBill />
                    )}{' '}
                    {m?.routePlanner.transportType[key] ?? '…'}
                  </Dropdown.Item>
                ))}
            </Fragment>
          ))}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
