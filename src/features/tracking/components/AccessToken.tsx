import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { copyToClipboard } from '@shared/clipboardUtils.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  Fragment,
  type ReactElement,
  type ReactNode,
  useCallback,
} from 'react';
import {
  Button,
  Dropdown,
  ListGroup,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import {
  FaClipboard,
  FaEdit,
  FaEllipsisV,
  FaRegEye,
  FaTrash,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { fixedPopperConfig } from '@/shared/fixedPopperConfig.js';
import { trackingActions } from '../model/actions.js';
import { AccessToken as AccessTokenType } from '../model/types.js';

type Props = {
  accessToken: AccessTokenType;
  deviceName: string;
};

export function AccessToken({ accessToken, deviceName }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = useCallback(() => {
    dispatch(trackingActions.modifyAccessToken(accessToken.id));
  }, [accessToken.id, dispatch]);

  const handleDelete = useCallback(async () => {
    if (
      await confirm({
        title: m?.tracking.accessToken.deleteTitle,
        message: m?.tracking.accessToken.delete(accessToken.token),
        confirmLabel: m?.general.delete,
        confirmStyle: 'danger',
      })
    ) {
      dispatch(trackingActions.deleteAccessToken(accessToken.id));
    }
  }, [accessToken.id, accessToken.token, dispatch, confirm, m]);

  const handleCopyClick = useCallback(() => {
    copyToClipboard(
      dispatch,
      `${location.origin}/?track=${encodeURIComponent(
        accessToken.token,
      )}&follow=${encodeURIComponent(accessToken.token)}`,
    );
  }, [accessToken.token, dispatch]);

  const handleView = useCallback(() => {
    dispatch(setActiveModal('tracking-watched'));

    dispatch(
      trackingActions.modifyTrackedDevice({
        token: accessToken.token,
        label: deviceName,
      }),
    );
  }, [accessToken.token, deviceName, dispatch]);

  const meta: { label: string; value: ReactNode }[] = [];

  meta.push({
    label: m?.general.createdAt ?? '',
    value: dateFormat.format(accessToken.createdAt),
  });

  if (accessToken.timeFrom) {
    meta.push({
      label: m?.tracking.accessToken.timeFrom ?? '',
      value: dateFormat.format(accessToken.timeFrom),
    });
  }

  if (accessToken.timeTo) {
    meta.push({
      label: m?.tracking.accessToken.timeTo ?? '',
      value: dateFormat.format(accessToken.timeTo),
    });
  }

  if (accessToken.note) {
    meta.push({
      label: m?.tracking.accessToken.note ?? '',
      value: accessToken.note,
    });
  }

  return (
    <ListGroup.Item className="d-flex flex-wrap align-items-center gap-2">
      <div className="flex-grow-1 me-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <OverlayTrigger
            trigger={['hover', 'focus']}
            placement="right"
            overlay={
              <Tooltip id={accessToken.token}>
                <span style={{ overflowWrap: 'break-word' }}>
                  {location.origin}/?track=
                  {encodeURIComponent(accessToken.token)}
                  &amp;follow={encodeURIComponent(accessToken.token)}
                </span>
              </Tooltip>
            }
          >
            <code>{accessToken.token}</code>
          </OverlayTrigger>

          <LongPressTooltip label={m?.general.copyUrl}>
            {({ props }) => (
              <Button
                onClick={handleCopyClick}
                size="sm"
                variant="outline-secondary"
                type="button"
                {...props}
              >
                <FaClipboard />
              </Button>
            )}
          </LongPressTooltip>
        </div>

        <small className="text-muted">
          {meta.map((item, i) => (
            <Fragment key={item.label}>
              {i > 0 && ' · '}
              <span className="text-nowrap">
                {item.label}: <strong>{item.value}</strong>
              </span>
            </Fragment>
          ))}
        </small>
      </div>

      <div className="d-flex flex-wrap gap-2">
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="outline-secondary"
            size="sm"
            aria-label={m?.general.actions}
          >
            <FaEllipsisV />
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            <Dropdown.Item onClick={handleView}>
              <FaRegEye /> {m?.tracking.devices.watch}
            </Dropdown.Item>

            <Dropdown.Item onClick={handleModify}>
              <FaEdit /> {m?.general.modify}
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item className="text-danger" onClick={handleDelete}>
              <FaTrash /> {m?.general.delete}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </ListGroup.Item>
  );
}
