import { getMessageByKey, useMessages } from '@features/l10n/l10nInjector.js';
import { DateTime } from '@shared/components/DateTime.js';
import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { FaRegDotCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { ReactTags, Tag } from 'react-tag-autocomplete';
import '../../../styles/react-tags.scss';
import { galleryAddTag, GalleryTag } from '../model/actions.js';
import { Azimuth } from './Azimuth.js';
import { RecentTags } from './RecentTags.js';

export interface PictureModel {
  title: string;
  description: string;
  tags: string[];
  takenAt: string;
  dirtyPosition: string;
  azimuth: string;
  premium: boolean;
}

interface Props {
  id?: number;
  model: PictureModel;
  allTags: GalleryTag[];
  errors: string[] | null | undefined;
  onPositionPick: undefined | (() => void);
  onModelChange: (model: PictureModel) => void;
}

export function GalleryEditForm({
  id,
  model,
  allTags,
  errors,
  onPositionPick,
  onModelChange,
}: Props): ReactElement {
  const m = useMessages();

  const changeModel = useCallback(
    (key: keyof PictureModel, value: unknown) => {
      onModelChange({ ...model, [key]: value });
    },
    [model, onModelChange],
  );

  const handleTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      changeModel('title', e.currentTarget.value || null);
    },
    [changeModel],
  );

  const handleDescriptionChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      changeModel('description', e.currentTarget.value || null);
    },
    [changeModel],
  );

  const handleAzimuthChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      changeModel('azimuth', e.currentTarget.value || null);
    },
    [changeModel],
  );

  const handleTakenAtChange = useCallback(
    (value: string) => {
      changeModel('takenAt', value);
    },
    [changeModel],
  );

  const handlePositionChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      changeModel('dirtyPosition', e.currentTarget.value || null);
    },
    [changeModel],
  );

  const handlePremiumChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      changeModel('premium', e.currentTarget.checked);
    },
    [changeModel],
  );

  const dispatch = useDispatch();

  const handleTagAddition = useCallback(
    ({ value }: Tag) => {
      const fixed = String(value).toLowerCase().trim().replace(/ {2,}/g, ' ');

      dispatch(galleryAddTag(fixed));

      if (!model.tags.includes(fixed)) {
        changeModel('tags', [...model.tags, fixed]);
      }
    },
    [changeModel, dispatch, model.tags],
  );

  const handleTagDelete = useCallback(
    (i: number) => {
      const tags = [...model.tags];

      tags.splice(i, 1);

      changeModel('tags', tags);
    },
    [changeModel, model.tags],
  );

  // hack to resize tags properly on modal re-appear
  const [key, setKey] = useState(0);

  useLayoutEffect(() => {
    setKey(1);
  }, []);

  const handleAzimuthChange2 = useCallback(
    (a: number) => changeModel('azimuth', a.toFixed(1)),
    [changeModel],
  );

  return (
    <div>
      {errors?.map((error) => (
        <Alert variant="danger" key={error}>
          {error.startsWith('~')
            ? error.slice(1)
            : (() => {
                const v = getMessageByKey(m, error);

                return typeof v === 'string' ? v : error;
              })()}
        </Alert>
      ))}

      <Form.Group controlId="pictureName" className="mb-3">
        <Form.Control
          placeholder={m?.gallery.editForm.name}
          type="text"
          value={model.title}
          onChange={handleTitleChange}
          maxLength={255}
        />
      </Form.Group>

      <Form.Group controlId="pictureDescription" className="mb-3">
        <Form.Control
          placeholder={m?.gallery.editForm.description}
          as="textarea"
          value={model.description}
          onChange={handleDescriptionChange}
          maxLength={4096}
        />
      </Form.Group>

      {m && (
        <Form.Group controlId="takenAt" className="mb-3">
          <DateTime
            value={model.takenAt}
            onChange={handleTakenAtChange}
            placeholders={{
              date: m.gallery.editForm.takenAt.date,
              time: m.gallery.editForm.takenAt.time,
              datetime: m.gallery.editForm.takenAt.datetime,
            }}
          />
        </Form.Group>
      )}

      <Form.Group controlId="location" className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder={m?.gallery.editForm.location}
            onChange={handlePositionChange}
            value={model.dirtyPosition}
          />

          <Button onClick={onPositionPick}>
            <FaRegDotCircle /> {m?.gallery.editForm.setLocation}
          </Button>
        </InputGroup>
      </Form.Group>

      <Form.Group
        controlId="azimuth"
        className="mb-3 d-flex align-items-center"
      >
        <Form.Control
          placeholder={m?.gallery.editForm.azimuth}
          type="number"
          value={model.azimuth}
          onChange={handleAzimuthChange}
          min={0}
          max={360}
          step="any"
        />

        <Azimuth
          className="ms-2"
          value={model.azimuth ? parseFloat(model.azimuth) : null}
          size={34}
          onChange={handleAzimuthChange2}
        />
      </Form.Group>

      <Form.Group controlId="tags" className="mb-3" key={key}>
        <ReactTags
          placeholderText={m?.gallery.editForm.tags}
          newOptionText={m?.general.newOptionText}
          deleteButtonText={m?.general.deleteButtonText}
          selected={model.tags.map((tag) => ({ label: tag, value: tag }))}
          suggestions={allTags.map(({ name }) => ({
            label: name,
            value: name,
          }))}
          onAdd={handleTagAddition}
          onDelete={handleTagDelete}
          allowNew
          collapseOnSelect
        />

        <RecentTags
          className="mt-1"
          existingTags={model.tags}
          onAdd={(tag) => handleTagAddition({ label: tag, value: tag })}
        />
      </Form.Group>

      <Form.Check
        id={'chk-premium-' + (id ?? 'x')}
        className="mb-3"
        type="checkbox"
        onChange={handlePremiumChange}
        checked={model.premium}
        label={m?.gallery.uploadModal.premium}
      />
    </div>
  );
}
