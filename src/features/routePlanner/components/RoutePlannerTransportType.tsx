import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Button, Menu } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { useBecomePremium } from '@shared/hooks/useBecomePremium.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { TransportType, transportTypeDefs } from '@shared/transportTypeDefs.js';
import { Fragment, type ReactElement } from 'react';
import { FaCaretDown, FaEquals, FaGem, FaMoneyBill } from 'react-icons/fa';

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

  const becomePremium = useBecomePremium();

  const sc = useScrollClasses('vertical');

  const tooltipLabel = activeTTDef ? (
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
  );

  const triggerIcon = !value ? <FaEquals /> : (activeTTDef?.icon ?? '');

  return (
    <Menu>
      <Menu.Target>
        <MantineLongPressTooltip breakpoint="lg" label={tooltipLabel}>
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant="filled"
                color="gray"
                size="input-sm"
                {...props}
              >
                {triggerIcon}
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                color="gray"
                size="sm"
                leftSection={
                  <>
                    {triggerIcon}
                    {value &&
                      ['car', 'car-toll', 'bikesharing'].includes(value) && (
                        <>
                          {' '}
                          <FaMoneyBill />
                        </>
                      )}
                  </>
                }
                rightSection={<FaCaretDown />}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <div className="dropdown-long" ref={sc}>
          <div />

          {withDefault && (
            <Menu.Item
              leftSection={<FaEquals />}
              color={!value ? 'blue' : undefined}
              onClick={() => onChange(undefined)}
            >
              {m?.routePlanner.default}
            </Menu.Item>
          )}

          {(['manual', 'gh', 'osrm'] as const).map((api) => (
            <Fragment key={api}>
              {api !== 'manual' && (
                <Menu.Label>
                  {api === 'osrm' ? 'OSRM' : 'GraphHopper '}
                </Menu.Label>
              )}

              {Object.entries(transportTypeDefs)
                .filter(([, def]) => !def.hidden && def.api === api)
                .map(([type, { icon, msgKey: key }]) => (
                  <Menu.Item
                    key={type}
                    leftSection={
                      <>
                        {icon}
                        {['car', 'car-toll', 'bikesharing'].includes(type) && (
                          <>
                            {' '}
                            <FaMoneyBill />
                          </>
                        )}
                      </>
                    }
                    rightSection={
                      withDefault ? (
                        <FaGem
                          style={{ pointerEvents: 'initial' }}
                          className={
                            'ms-1 text-' +
                            (becomePremium ? 'warning' : 'success')
                          }
                          title={
                            becomePremium ? m?.premium.premiumOnly : undefined
                          }
                          onClick={becomePremium}
                        />
                      ) : null
                    }
                    color={value === type ? 'blue' : undefined}
                    disabled={withDefault && Boolean(becomePremium)}
                    title={m?.routePlanner.transportType[key]}
                    onClick={() => onChange(type as TransportType)}
                  >
                    {m?.routePlanner.transportType[key] ?? '…'}
                  </Menu.Item>
                ))}
            </Fragment>
          ))}
        </div>
      </Menu.Dropdown>
    </Menu>
  );
}
