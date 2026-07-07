import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { UserChip } from '@shared/components/UserChip.js';
import { clsx } from 'clsx';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { FaCamera, FaTimes, FaTrophy } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import z from 'zod';
import { countryCodeToFlag, Emoji } from '../../../shared/components/Emoji.js';
import { useAppSelector } from '../../../shared/hooks/useAppSelector.js';
import { useNumberFormat } from '../../../shared/hooks/useNumberFormat.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';
import classes from './GalleryLeaderboardModal.module.css';

type Props = { show: boolean };

const UserSchema = z.object({
  id: z.uint32(),
  name: z.string(),
  hasPicture: z.boolean(),
  premium: z.boolean(),
});

const StatsSchema = z.object({
  perUserPerCountry: z.record(
    z.string(), // country
    z
      .object({
        user: UserSchema,
        pictureCount: z.uint32(),
      })
      .array(),
  ),
  perUser: z
    .object({
      user: UserSchema,
      pictureCount: z.uint32(),
    })
    .array(),
  me: z
    .object({
      perCountry: z.record(
        z.string(), // country
        z.object({
          pictureCount: z.number(),
          userRank: z.number(),
        }),
      ),
      pictureCount: z.number(),
      userRank: z.number(),
    })
    .optional(),
});

type Stats = z.infer<typeof StatsSchema>;

const MEDALS = ['🥇', '🥈', '🥉'];

export default function GalleryLeaderboardModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const gm = useGalleryMessages();

  const [state, setState] = useState<
    | { type: 'error'; error: unknown }
    | { type: 'fetching' }
    | { type: 'success'; result: Stats }
  >({ type: 'fetching' });

  const user = useAppSelector((s) => s.auth.user);

  const meUser = user && {
    ...user,
    premium: Boolean(
      user.premiumExpiration && user.premiumExpiration < new Date(),
    ),
  };

  const [period, setPeriod] = useState('');

  const authToken = user?.authToken;

  const nf = useNumberFormat();

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      const res = await fetch(
        `${process.env['API_URL']}/gallery/stats?period=${period}`,
        {
          signal: ac.signal,
          headers: {
            accept: 'application/json',
            ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
          },
        },
      );

      if (!res.ok) {
        throw new Error();
      }

      setState({
        type: 'success',
        result: StatsSchema.parse(await res.json()),
      });
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
    <Modal show={show} onHide={close} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCamera /> <FaTrophy /> {gm?.stats.leaderboard}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={clsx('d-flex', 'flex-column', classes.body)}>
        <Form.Group className="mb-2">
          <Form.Label>{gm?.stats.timePeriod}</Form.Label>
          <Form.Select
            value={period}
            onChange={(e) => setPeriod(e.currentTarget.value)}
          >
            <option value="">{gm?.stats.allTime}</option>
            <option value="90">{gm?.stats.last3months}</option>
            <option value="30">{gm?.stats.last30days}</option>
          </Form.Select>
        </Form.Group>

        {(() => {
          switch (state.type) {
            case 'fetching':
              return (
                <Spinner className="align-self-center" animation="border" />
              );
            case 'error':
              return (
                <Alert variant="danger">
                  {m?.general.loadError({ err: state.error })}
                </Alert>
              );
            case 'success':
              return (
                <>
                  <h5 className="mt-2 mb-3">{gm?.stats.perUser}</h5>

                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th className="text-end">#</th>
                        <th>{gm?.stats.user}</th>
                        <th className="text-end">
                          <span className="d-none d-sm-inline">
                            {gm?.stats.numberOfPhotos}
                          </span>
                          <span className="d-sm-none">{gm?.stats.photos}</span>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {state.result.perUser.map((row, i) => (
                        <tr
                          key={i}
                          className={clsx({
                            [classes.hideable]: i > 2,
                            'table-primary': row.user.id === user?.id,
                          })}
                        >
                          <td className="text-end text-nowrap">
                            {MEDALS[i]} {i + 1}
                          </td>
                          <td>
                            <UserChip user={row.user} />
                          </td>
                          <td className="text-end">
                            {nf.format(row.pictureCount)}
                          </td>
                        </tr>
                      ))}

                      {meUser &&
                        state.result.me &&
                        state.result.me.userRank >
                          state.result.perUser.length && (
                          <tr
                            key="me"
                            className={clsx(classes.hideable, 'table-primary')}
                          >
                            <td className="text-end">
                              {state.result.me.userRank}
                            </td>
                            <td>
                              <UserChip user={meUser} />
                            </td>
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
                                  classes.more,
                                );
                              }}
                            >
                              <span className={classes.moreBtn}>
                                {gm?.stats.more}&hellip;
                              </span>
                              <span className={classes.lessBtn}>
                                {gm?.stats.less}&hellip;
                              </span>
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  <h5 className="mt-2 mb-3">{gm?.stats.perUserPerCountry}</h5>

                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th className="text-center">
                          <span className="d-none d-sm-inline">
                            {gm?.stats.country}
                          </span>
                        </th>
                        <th className="text-end">#</th>
                        <th>{gm?.stats.user}</th>
                        <th className="text-end">
                          <span className="d-none d-sm-inline">
                            {gm?.stats.numberOfPhotos}
                          </span>
                          <span className="d-sm-none">{gm?.stats.photos}</span>
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
                                  [classes.separ]: i === 0,
                                  [classes.hideable]: i > 2,
                                  'table-primary': item.user.id === user?.id,
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
                                <td>
                                  <UserChip user={item.user} />
                                </td>
                                <td className="text-end">
                                  {nf.format(item.pictureCount)}
                                </td>
                              </tr>
                            ))}
                            {meUser && me && Boolean(iAmExtra) && (
                              <tr
                                key="me"
                                className={clsx(
                                  classes.hideable,
                                  'table-primary',
                                )}
                              >
                                <td className="text-end">{me.userRank}</td>
                                <td>
                                  <UserChip user={meUser} />
                                </td>
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
                                        classes.more,
                                      );
                                    }}
                                  >
                                    <span className={classes.moreBtn}>
                                      {gm?.stats.more}&hellip;
                                    </span>
                                    <span className={classes.lessBtn}>
                                      {gm?.stats.less}&hellip;
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
          }
        })()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
