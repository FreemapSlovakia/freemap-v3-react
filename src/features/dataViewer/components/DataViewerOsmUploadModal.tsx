import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { authWithPopupOAuth } from '@features/auth/model/actions.js';
import {
  OAUTH_PROGRESS_ID,
  OSM_GPX_SCOPE,
} from '@features/auth/popupOAuthProviders.js';
import { prefetchOAuthClientId } from '@features/auth/startPopupOAuth.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import {
  type ReactElement,
  type SubmitEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Form, Modal, Spinner } from 'react-bootstrap';
import { FaUpload } from 'react-icons/fa';
import { SiOpenstreetmap } from 'react-icons/si';
import { useDispatch, useStore } from 'react-redux';
import {
  dataViewerCheckOsmAuthorization,
  dataViewerUploadToOsm,
  OSM_GPX_CHECK_PROGRESS_ID,
  OSM_GPX_UPLOAD_PROGRESS_ID,
  type OsmGpxVisibility,
  OsmGpxVisibilitySchema,
} from '../model/actions.js';
import { hasOsmTraceLine, isOsmTraceLine } from '../osmTrace.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

type Props = { show: boolean };

const toVisibility = (value: string | null) =>
  OsmGpxVisibilitySchema.safeParse(value).data ?? 'identifiable';

export default function DataViewerOsmUploadModal({
  show,
}: Props): ReactElement {
  const m = useMessages();

  const dvm = useDataViewerMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const store = useStore<RootState>();

  useDocumentTitle(show ? dvm?.osmUpload.title : undefined);

  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  // The modal has a URL id of its own, so it can open with nothing to upload.
  const hasTrace = useMemo(() => hasOsmTraceLine(trackGeojson), [trackGeojson]);

  const user = useAppSelector((state) => state.auth.user);

  // Busy through the check and the OSM authorization too, which hands over to
  // the upload.
  const busy = useAppSelector((state) =>
    [
      OSM_GPX_UPLOAD_PROGRESS_ID,
      OSM_GPX_CHECK_PROGRESS_ID,
      OAUTH_PROGRESS_ID,
    ].some((id) => state.progress.includes(id)),
  );

  const authorized = useAppSelector(
    (state) => state.auth.user?.osmGpxAuthorized,
  );

  const online = useOnline();

  const cookieConsentResult = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult,
  );

  const checked = useRef(false);

  // A revoked authorization has to be known before the Upload click, which is
  // what lets the authorization popup open. Once per opening, as soon as the
  // user (on a deep link, loaded later) says there is one.
  useEffect(() => {
    if (!show) {
      checked.current = false;

      return;
    }

    if (authorized && !checked.current) {
      checked.current = true;

      dispatch(dataViewerCheckOsmAuthorization());
    }
  }, [show, authorized, dispatch]);

  useEffect(() => {
    if (show) {
      prefetchOAuthClientId('osm', store.getState);
    }
  }, [show, store]);

  // Read once: the loaded track's name only seeds the field.
  const [description, setDescription] = useState(() => {
    const name = store
      .getState()
      .trackViewer.trackGeojson?.features.find(isOsmTraceLine)?.properties?.[
      'name'
    ];

    // OSM's limit; `maxLength` stops only what is typed.
    return typeof name === 'string' ? name.slice(0, 255) : '';
  });

  const [tags, setTags] = useState('');

  const [visibility, setVisibility] = usePersistentState<OsmGpxVisibility>(
    'fm.dataViewer.osmGpxVisibility',
    String,
    toVisibility,
  );

  const tagList = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  // What OSM refuses in a trace tag.
  const tagsInvalid = tagList.some(
    (tag) => tag.length > 255 || /[.;/?%#]/.test(tag),
  );

  const close = () => {
    dispatch(setActiveModal(null));
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (tagsInvalid) {
      return;
    }

    const uploadAction = dataViewerUploadToOsm({
      description: description.trim(),
      tags: tagList,
      visibility,
    });

    if (user?.osmGpxAuthorized) {
      dispatch(uploadAction);

      return;
    }

    // Logging in needs the cookie consent, which the login modal asks for.
    if (!user && cookieConsentResult === null) {
      dispatch(setActiveModal({ type: 'login' }));

      return;
    }

    if (
      await confirm({
        message: !user
          ? dvm?.osmUpload.loginPrompt
          : user.authProviders.includes('osm')
            ? dvm?.osmUpload.authorizePrompt
            : dvm?.osmUpload.connectPrompt,
      })
    ) {
      dispatch(
        authWithPopupOAuth({
          provider: 'osm',
          connect: Boolean(user),
          scope: OSM_GPX_SCOPE,
          successAction: uploadAction,
        }),
      );
    }
  };

  return (
    <Modal show={show} onHide={close} contentClassName="bg-body-tertiary">
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <SiOpenstreetmap /> <Text m={dvm} k="osmUpload.title" />
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <fieldset disabled={busy}>
            <Form.Text muted className="d-block mb-3">
              <Text m={dvm} k="osmUpload.help" />
            </Form.Text>

            <Form.Group controlId="osmGpxDescription" className="mb-3">
              <Form.Label className="required">
                <Text m={dvm} k="osmUpload.description" />
              </Form.Label>

              <Form.Control
                value={description}
                required
                maxLength={255}
                onChange={(e) => setDescription(e.currentTarget.value)}
              />
            </Form.Group>

            <Form.Group controlId="osmGpxTags" className="mb-3">
              <Form.Label>
                <Text m={dvm} k="osmUpload.tags" />
              </Form.Label>

              <Form.Control
                value={tags}
                isInvalid={tagsInvalid}
                onChange={(e) => setTags(e.currentTarget.value)}
              />

              {tagsInvalid ? (
                <Form.Control.Feedback type="invalid">
                  <Text m={dvm} k="osmUpload.tagsInvalid" />
                </Form.Control.Feedback>
              ) : (
                <Form.Text muted>
                  <Text m={dvm} k="osmUpload.tagsHint" />
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group>
              <Form.Label>
                <Text m={dvm} k="osmUpload.visibility" />
              </Form.Label>

              {OsmGpxVisibilitySchema.options.map((option) => (
                <Form.Check
                  key={option}
                  type="radio"
                  id={`osmGpxVisibility-${option}`}
                  name="osmGpxVisibility"
                  checked={visibility === option}
                  onChange={() => setVisibility(option)}
                  label={
                    <>
                      <Text m={dvm} k={`osmUpload.visibilities.${option}`} />
                      <Form.Text muted className="d-block mt-0">
                        <Text
                          m={dvm}
                          k={`osmUpload.visibilityHints.${option}`}
                        />
                      </Form.Text>
                    </>
                  }
                />
              ))}
            </Form.Group>
          </fieldset>
        </Modal.Body>

        <FmModalFooter>
          <FmFooterButton
            variant="primary"
            type="submit"
            disabled={
              busy || !online || !hasTrace || !description.trim() || tagsInvalid
            }
            icon={
              busy ? (
                <Spinner as="span" size="sm" role="status" />
              ) : (
                <FaUpload />
              )
            }
            label={dvm?.osmUpload.upload}
          />

          <FmDismissButton label={m?.general.cancel} onClick={close} />
        </FmModalFooter>
      </form>
    </Modal>
  );
}
