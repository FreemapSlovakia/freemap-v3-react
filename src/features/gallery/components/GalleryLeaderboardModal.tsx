import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { clsx } from 'clsx';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { FaCamera, FaTimes, FaTrophy } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { assert } from 'typia';
import { countryCodeToFlag, Emoji } from '../../../shared/components/Emoji.js';
import { useAppSelector } from '../../../shared/hooks/useAppSelector.js';
import { useNumberFormat } from '../../../shared/hooks/useNumberFormat.js';
import classes from './GalleryLeaderboardModal.module.scss';

type Props = { show: boolean };

type Stats = {
  perUserPerCountry: {
    [country: string]: {
      userId: number;
      userName: string;
      pictureCount: number;
    }[];
  };
  perUser: {
    pictureCount: number;
    userId: number;
    userName: string;
  }[];
  me?: {
    perCountry: {
      [country: string]: {
        pictureCount: number;
        userRank: number;
      };
    };
    pictureCount: number;
    userRank: number;
  };
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default GalleryLeaderboardModal;

export function GalleryLeaderboardModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const [state, setState] = useState<
    | { type: 'error'; error: unknown }
    | { type: 'fetching' }
    | { type: 'success'; result: Stats }
  >({ type: 'fetching' });

  const user = useAppSelector((s) => s.auth.user);

  const [period, setPeriod] = useState('');

  const authToken = user?.authToken;

  const nf = useNumberFormat();

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      const res = await fetch(
        process.env['API_URL'] + '/gallery/stats?period=' + period,
        {
          signal: ac.signal,
          headers: {
            accept: 'application/json',
            ...(authToken ? { authorization: 'Bearer ' + authToken } : {}),
          },
        },
      );

      if (!res.ok) {
        throw new Error();
      }

      setState({ type: 'success', result: assert<Stats>(await res.json()) });
    })().catch((error) => {
      if (ac.signal.aborted) {
        return;
      }

      setState({ type: 'error', error });
    });

    return () => {
      ac.abort();
    };
  }, [authToken, period]);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCamera /> <FaTrophy /> {m?.gallery.stats.leaderboard}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={clsx('d-flex', 'flex-column', classes['body'])}>
        <Form.Group className="mb-2">
          <Form.Label>{m?.gallery.stats.timePeriod}</Form.Label>
          <Form.Select
            value={period}
            onChange={(e) => setPeriod(e.currentTarget.value)}
          >
            <option value="">{m?.gallery.stats.allTime}</option>
            <option value="90">{m?.gallery.stats.last3months}</option>
            <option value="30">{m?.gallery.stats.last30days}</option>
          </Form.Select>
        </Form.Group>

        {(() => {
          switch (state.type) {
            case 'fetching':
              return (
                <Spinner className="align-self-center" animation="border" />
              );
            case 'success':
              return (
                <>
                  <h5 className="mt-2 mb-3">{m?.gallery.stats.perUser}</h5>

                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th className="text-end">#</th>
                        <th>{m?.gallery.stats.user}</th>
                        <th className="text-end">
                          <span className="d-none d-sm-inline">
                            {m?.gallery.stats.numberOfPhotos}
                          </span>
                          <span className="d-sm-none">
                            {m?.gallery.stats.photos}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.result.perUser.map((row, i) => (
                        <tr
                          key={i}
                          className={clsx({
                            [classes['hideable']]: i > 2,
                            'table-primary': row.userId === user?.id,
                          })}
                        >
                          <td className="text-end text-nowrap">
                            {MEDALS[i]} {i + 1}
                          </td>
                          <td>{row.userName}</td>
                          <td className="text-end">
                            {nf.format(row.pictureCount)}
                          </td>
                        </tr>
                      ))}
                      {user &&
                        state.result.me &&
                        state.result.me.userRank >
                          state.result.perUser.length && (
                          <tr
                            key="me"
                            className={clsx(
                              classes['hideable'],
                              'table-primary',
                            )}
                          >
                            <td className="text-end">
                              {state.result.me.userRank}
                            </td>
                            <td>{user.name}</td>
                            <td className="text-end">
                              {nf.format(state.result.me.pictureCount)}
                            </td>
                          </tr>
                        )}
                      {state.result.perUser.length > 3 && (
                        <tr>
                          <td colSpan={3}>
                            <Button
                              className="p-0"
                              variant="link"
                              onClick={(e) => {
                                e.currentTarget.parentElement?.parentElement?.parentElement?.classList.toggle(
                                  classes['more'],
                                );
                              }}
                            >
                              <span className={classes['more-btn']}>
                                {m?.gallery.stats.more}&hellip;
                              </span>
                              <span className={classes['less-btn']}>
                                {m?.gallery.stats.less}&hellip;
                              </span>
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  <h5 className="mt-2 mb-3">
                    {m?.gallery.stats.perUserPerCountry}
                  </h5>

                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th className="text-center">
                          <span className="d-none d-sm-inline">
                            {m?.gallery.stats.country}
                          </span>
                        </th>
                        <th className="text-end">#</th>
                        <th>{m?.gallery.stats.user}</th>
                        <th className="text-end">
                          <span className="d-none d-sm-inline">
                            {m?.gallery.stats.numberOfPhotos}
                          </span>
                          <span className="d-sm-none">
                            {m?.gallery.stats.photos}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    {Object.entries(state.result.perUserPerCountry).map(
                      ([country, data]) => {
                        const me = state.result.me?.perCountry[country];

                        const iAmExtra =
                          me && me.userRank > data.length ? 1 : 0;

                        return (
                          <tbody key={country}>
                            {data.map((item, i) => (
                              <tr
                                key={i}
                                className={clsx({
                                  [classes['separ']]: i === 0,
                                  [classes['hideable']]: i > 2,
                                  'table-primary': item.userId === user?.id,
                                })}
                              >
                                {i === 0 && (
                                  <th
                                    rowSpan={data.length + iAmExtra + 1}
                                    title={country}
                                    className="text-center"
                                  >
                                    <Emoji className="w-6">
                                      {countryCodeToFlag(country)}
                                    </Emoji>
                                  </th>
                                )}
                                <td className="text-end text-nowrap">
                                  {MEDALS[i]} {i + 1}
                                </td>
                                <td>{item.userName}</td>
                                <td className="text-end">
                                  {nf.format(item.pictureCount)}
                                </td>
                              </tr>
                            ))}
                            {user && me && Boolean(iAmExtra) && (
                              <tr
                                key="me"
                                className={clsx(
                                  classes['hideable'],
                                  'table-primary',
                                )}
                              >
                                <td className="text-end">{me.userRank}</td>
                                <td>{user.name}</td>
                                <td className="text-end">
                                  {nf.format(me.pictureCount)}
                                </td>
                              </tr>
                            )}
                            {data.length > 3 && (
                              <tr>
                                <td colSpan={3}>
                                  <Button
                                    className="p-0"
                                    variant="link"
                                    onClick={(e) => {
                                      e.currentTarget.parentElement?.parentElement?.parentElement?.classList.toggle(
                                        classes['more'],
                                      );
                                    }}
                                  >
                                    <span className={classes['more-btn']}>
                                      {m?.gallery.stats.more}&hellip;
                                    </span>
                                    <span className={classes['less-btn']}>
                                      {m?.gallery.stats.less}&hellip;
                                    </span>
                                  </Button>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        );
                      },
                    )}
                  </Table>
                </>
              );
            case 'error':
              return (
                <Alert variant="danger">
                  {m?.general.loadError({ err: state.error?.toString() ?? '' })}
                </Alert>
              );
          }
        })()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" type="button" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
