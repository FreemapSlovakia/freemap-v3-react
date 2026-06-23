import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { TransportType, transportTypeDefs } from '@shared/transportTypeDefs.js';
import { Fragment, ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaEquals, FaGem, FaMoneyBill } from 'react-icons/fa';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';

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
  const prm = usePremiumMessages();

  const rpm = useRoutePlannerMessages();

  const activeTTDef = value && transportTypeDefs[value];

  const ttLabel = activeTTDef
    ? rpm?.transportType[activeTTDef.msgKey]
    : rpm?.default;

  const becomePremium = useBecomePremium();

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
        name={rpm?.transportTypeLabel}
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
              <FaEquals /> {rpm?.default}
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
                    title={rpm?.transportType[key]}
                    active={value === type}
                    disabled={withDefault && Boolean(becomePremium)}
                  >
                    {icon}{' '}
                    {['car', 'car-toll', 'bikesharing'].includes(type) && (
                      <FaMoneyBill />
                    )}{' '}
                    {rpm?.transportType[key] ?? '…'}
                    {withDefault && (
                      <>
                        {' '}
                        <FaGem
                          style={{ pointerEvents: 'initial' }}
                          className={
                            'ms-1 text-' +
                            (becomePremium ? 'warning' : 'success')
                          }
                          title={becomePremium ? prm?.premiumOnly : undefined}
                          onClick={becomePremium}
                        />
                      </>
                    )}
                  </Dropdown.Item>
                ))}
            </Fragment>
          ))}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
