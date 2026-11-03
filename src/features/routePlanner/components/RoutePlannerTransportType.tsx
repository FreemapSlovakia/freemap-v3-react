import { Text } from '@features/l10n/Text.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { ExternalService } from '@shared/components/ExternalService.js';
import { FitToggleButtonGroup } from '@shared/components/FitButtonGroup.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuGutter } from '@shared/components/MenuGutter.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import {
  type TransportType,
  transportTypeDefs,
} from '@shared/transportTypeDefs.js';
import {
  Fragment,
  type ReactElement,
  type ReactNode,
  useId,
  useState,
} from 'react';
import { Dropdown, ToggleButton } from 'react-bootstrap';
import { FaMoneyBill } from 'react-icons/fa';
import { PiMouseLeftClickFill } from 'react-icons/pi';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';

type Props<S extends string> = {
  value: TransportType;
  onChange: (value: TransportType, scope: S | undefined) => void;
  /** Which legs the choice applies to; offered when there are two or more. */
  scopes?: readonly (readonly [scope: S, label: ReactNode])[];
  /** The scope preselected each time the menu opens. */
  defaultScope?: S;
  /** Premium only: the choices are shown, but lead to the premium offer. */
  premiumOnly?: boolean;
  /** Shift+click on the map adds a direct-line leg. */
  shiftForManual?: boolean;
};

export function RoutePlannerTransportType<S extends string>({
  value,
  onChange,
  scopes,
  defaultScope,
  premiumOnly = false,
  shiftForManual = false,
}: Props<S>): ReactElement {
  const rpm = useRoutePlannerMessages();

  const activeTTDef = transportTypeDefs[value];

  const becomePremium = useBecomePremium();

  const [pickedScope, setPickedScope] = useState<S>();

  // The toolbar's and a selected leg's menus can both be mounted.
  const scopeId = useId();

  const offeredScopes = scopes && scopes.length > 1 ? scopes : undefined;

  // The options change with the route, so a pick they no longer hold falls back.
  const scope = offeredScopes?.some(([s]) => s === pickedScope)
    ? pickedScope
    : defaultScope;

  return (
    <Dropdown
      id="transport-type"
      onToggle={() => {
        setPickedScope(undefined);
      }}
      onSelect={(transportType) =>
        onChange(transportType as TransportType, offeredScopes && scope)
      }
    >
      <LongPressTooltip
        breakpoint="md"
        name={rpm?.transportTypeLabel}
        label={
          <>
            <Text m={rpm} k={`transportType.${activeTTDef.msgKey}`} />

            {activeTTDef.api !== 'manual' && (
              <>
                {' '}
                <small className="text-dark">
                  {activeTTDef.api === 'osrm' ? 'OSRM' : 'GraphHopper'}
                </small>
              </>
            )}
          </>
        }
      >
        {({ label, labelClassName, props }) => (
          <Dropdown.Toggle variant="secondary" {...props}>
            {activeTTDef.icon}{' '}
            {['car', 'car-toll', 'bikesharing'].includes(value) && (
              <FaMoneyBill />
            )}
            <span className={labelClassName}> {label}</span>
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <FmDropdownMenu>
        {offeredScopes && (
          <>
            <Dropdown.Header>
              <Text m={rpm} k="transportScope.title" />
            </Dropdown.Header>

            <div className="px-3 pb-2">
              <FitToggleButtonGroup
                className="d-flex"
                type="radio"
                name={scopeId}
                value={scope}
                onChange={setPickedScope}
              >
                {offeredScopes.map(([optionValue, label]) => (
                  <ToggleButton
                    key={optionValue}
                    id={`${scopeId}-${optionValue}`}
                    value={optionValue}
                    variant="outline-primary"
                    size="sm"
                  >
                    {label}
                  </ToggleButton>
                ))}
              </FitToggleButtonGroup>
            </div>

            <Dropdown.Divider />
          </>
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
              .map(([type, { icon, msgKey: key, experimental }]) => (
                <Dropdown.Item
                  as="button"
                  eventKey={type}
                  key={type}
                  title={rpm?.transportType[key]}
                  active={value === type}
                  disabled={premiumOnly && Boolean(becomePremium)}
                >
                  {icon}
                  {['car', 'car-toll', 'bikesharing'].includes(type) && (
                    <FaMoneyBill />
                  )}
                  <MenuLabel>
                    <Text m={rpm} k={`transportType.${key}`} />
                  </MenuLabel>
                  {(experimental ||
                    premiumOnly ||
                    api === 'osrm' ||
                    (shiftForManual && api === 'manual')) && (
                    <MenuGutter>
                      {shiftForManual && api === 'manual' && (
                        <kbd>
                          ⇧<PiMouseLeftClickFill />
                        </kbd>
                      )}
                      {experimental && <ExperimentalFunction />}
                      {api === 'osrm' && <ExternalService />}
                      {premiumOnly && <PremiumGem nested />}
                    </MenuGutter>
                  )}
                </Dropdown.Item>
              ))}
          </Fragment>
        ))}
      </FmDropdownMenu>
    </Dropdown>
  );
}
