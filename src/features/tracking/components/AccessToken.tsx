import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { copyToClipboard } from '@shared/clipboardUtils.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  Fragment,
  type ReactElement,
  type ReactNode,
  useCallback,
} from 'react';
import { Button, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaClipboard, FaEdit, FaRegEye, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { AccessToken as AccessTokenType } from '../model/types.js';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';

type Props = {
  accessToken: AccessTokenType;
};

export function AccessToken({ accessToken }: Props): ReactElement {
  const m = useMessages();

  const tm = useTrackingMessages();

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
        title: tm?.accessToken.deleteTitle,
        message: tm?.accessToken.delete(accessToken.token),
        confirmLabel: m?.general.delete,
        confirmStyle: 'danger',
      })
    ) {
      dispatch(trackingActions.deleteAccessToken(accessToken.id));
    }
  }, [accessToken.id, accessToken.token, dispatch, confirm, m, tm]);

  const handleCopyClick = useCallback(() => {
    copyToClipboard(
      dispatch,
      `${location.origin}/?track=${encodeURIComponent(
        accessToken.token,
      )}&follow=${encodeURIComponent(accessToken.token)}`,
    );
  }, [accessToken.token, dispatch]);

  const handleView = useCallback(() => {
    dispatch(
      setActiveModal({ type: 'tracking-watched', token: accessToken.token }),
    );
  }, [accessToken.token, dispatch]);

  const meta: { key: string; label: string; value: ReactNode }[] = [];

  meta.push({
    key: 'createdAt',
    label: m?.general.createdAt ?? '',
    value: dateFormat.format(accessToken.createdAt),
  });

  if (accessToken.timeFrom) {
    meta.push({
      key: 'timeFrom',
      label: tm?.accessToken.timeFrom ?? '',
      value: dateFormat.format(accessToken.timeFrom),
    });
  }

  if (accessToken.timeTo) {
    meta.push({
      key: 'timeTo',
      label: tm?.accessToken.timeTo ?? '',
      value: dateFormat.format(accessToken.timeTo),
    });
  }

  if (accessToken.note) {
    meta.push({
      key: 'note',
      label: tm?.accessToken.note ?? '',
      value: accessToken.note,
    });
  }

  return (
    <ListGroup.Item className="d-flex align-items-center gap-2">
      <div className="flex-grow-1 me-2 min-w-0">
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
                {...props}
              >
                <FaClipboard />
              </Button>
            )}
          </LongPressTooltip>
        </div>

        <small className="text-muted">
          {meta.map((item, i) => (
            <Fragment key={item.key}>
              {i > 0 && ' · '}
              <span className="text-nowrap">
                {item.label}: <strong>{item.value}</strong>
              </span>
            </Fragment>
          ))}
        </small>
      </div>

      <div className="flex-shrink-0">
        <ResponsiveActions align="end" toggleLabel={m?.general.actions}>
          <Action
            icon={<FaRegEye />}
            label={tm?.devices.watch}
            onClick={handleView}
            showFrom="lg"
          />

          <Action
            icon={<FaEdit />}
            label={m?.general.modify}
            onClick={handleModify}
            showFrom="md"
          />

          <ActionDivider />

          <Action
            icon={<FaTrash />}
            label={m?.general.delete}
            variant="danger"
            onClick={handleDelete}
            showFrom="md"
          />
        </ResponsiveActions>
      </div>
    </ListGroup.Item>
  );
}
