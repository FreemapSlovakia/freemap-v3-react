import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { PlaceName } from '@features/search/components/PlaceName.js';
import { DateTime } from '@shared/components/DateTime.js';
import { safeParseCoordinates } from '@shared/coordinatesParser.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import '@shared/styles/react-tags.scss';
import {
  type ChangeEvent,
  type ReactElement,
  useLayoutEffect,
  useState,
} from 'react';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { FaMapMarkerAlt, FaRedo, FaUndo } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { ReactTags, type Tag } from 'react-tag-autocomplete';
import { useTagLabel } from '../hooks/useTagLabel.js';
import { useTagSuggestions } from '../hooks/useTagSuggestions.js';
import type { GalleryLicense } from '../licenses.js';
import {
  type GalleryItemError,
  type GalleryTag,
  type GalleryValidationError,
  galleryAddTag,
} from '../model/actions.js';
import { type Rotation, rotateBy } from '../rotation.js';
import { findTag, isSameTag, type TagRef } from '../tagRefs.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';
import { Azimuth } from './Azimuth.js';
import { GalleryLicenseSelect } from './GalleryLicenseSelect.js';
import { RecentTags } from './RecentTags.js';
import { TagSuggestionOption } from './TagSuggestionOption.js';

export interface PictureModel {
  title: string;
  description: string;
  tags: TagRef[];
  takenAt: string;
  dirtyPosition: string;
  azimuth: string;
  premium: boolean;
  license: GalleryLicense;
  rotation: Rotation;
}

interface Props {
  id?: number;
  /** Off for a panorama. */
  rotatable?: boolean;
  model: PictureModel;
  allTags: GalleryTag[];
  errors: GalleryItemError[] | null | undefined;
  onPositionPick: undefined | (() => void);
  onModelChange: (model: PictureModel) => void;
  /** Off in the upload list, where every photo at once would flood the geocoder. */
  showPlaceName?: boolean;
}

export function GalleryEditForm({
  id,
  rotatable = true,
  model,
  allTags,
  errors,
  onPositionPick,
  onModelChange,
  showPlaceName,
}: Props): ReactElement {
  const m = useMessages();

  const gm = useGalleryMessages();

  const changeModel = (key: keyof PictureModel, value: unknown) => {
    onModelChange({ ...model, [key]: value });
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    changeModel('title', e.currentTarget.value || null);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    changeModel('description', e.currentTarget.value || null);
  };

  const handleAzimuthChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    changeModel('azimuth', e.currentTarget.value || null);
  };

  const handleTakenAtChange = (value: string) => {
    changeModel('takenAt', value);
  };

  const handlePositionChange = (e: ChangeEvent<HTMLInputElement>) => {
    changeModel('dirtyPosition', e.currentTarget.value || null);
  };

  const handlePremiumChange = (e: ChangeEvent<HTMLInputElement>) => {
    changeModel('premium', e.currentTarget.checked);
  };

  const handleRotate = (by: 90 | -90) => {
    trackMatomo(['trackEvent', 'Gallery', 'rotate']);

    changeModel('rotation', rotateBy(model.rotation, by));
  };

  const handleLicenseChange = (license: GalleryLicense) => {
    changeModel('license', license);
  };

  const dispatch = useDispatch();

  const { label: tagLabel } = useTagLabel();

  const addTag = (ref: TagRef) => {
    const found = findTag(allTags, ref);

    // Not found, an id stays (the list may not be loaded); a save sends one gone
    // by its name.
    const fixed: TagRef = found
      ? { id: found.id, name: found.name }
      : {
          id: ref.id,
          name: ref.name.toLowerCase().replace(/\s+/g, ' ').trim(),
        };

    dispatch(galleryAddTag(fixed));

    if (!model.tags.some((tag) => isSameTag(tag, fixed))) {
      changeModel('tags', [...model.tags, fixed]);
    }
  };

  const { optionByKey, keyOfId, suggestions, filterSuggestions } =
    useTagSuggestions(allTags);

  // A suggestion's value is its place in the tag tree; a new tag's value and
  // label are both the text typed.
  const handleTagAddition = ({ value, label }: Tag) => {
    if (label === value) {
      addTag({ name: label });

      return;
    }

    // Gone from a list reloaded meanwhile, nothing is added; the new list
    // offers it again.
    const option = optionByKey.get(String(value));

    if (option) {
      addTag({ id: option.id, name: option.name });
    }
  };

  const handleTagDelete = (i: number) => {
    changeModel('tags', model.tags.toSpliced(i, 1));
  };

  // hack to resize tags properly on modal re-appear
  const [key, setKey] = useState(0);

  useLayoutEffect(() => {
    setKey(1);
  }, []);

  const handleAzimuthChange2 = (a: number) =>
    changeModel('azimuth', a.toFixed(1));

  return (
    <div>
      {errors?.map((error) => (
        <Alert variant="danger" key={error}>
          {error.startsWith('~')
            ? error.slice(1)
            : (gm?.[error as GalleryValidationError] ?? error)}
        </Alert>
      ))}

      {rotatable && (
        <div className="mb-3 d-flex gap-2 justify-content-center">
          <Button variant="secondary" onClick={() => handleRotate(-90)}>
            <FaUndo /> <Text m={gm} k="editForm.rotateLeft" />
          </Button>

          <Button variant="secondary" onClick={() => handleRotate(90)}>
            <FaRedo /> <Text m={gm} k="editForm.rotateRight" />
          </Button>
        </div>
      )}

      <Form.Group controlId="pictureName" className="mb-3">
        <Form.Control
          placeholder={gm?.editForm.name}
          type="text"
          value={model.title}
          onChange={handleTitleChange}
          maxLength={255}
        />
      </Form.Group>

      <Form.Group controlId="pictureDescription" className="mb-3">
        <Form.Control
          placeholder={gm?.editForm.description}
          as="textarea"
          value={model.description}
          onChange={handleDescriptionChange}
          maxLength={4096}
        />
      </Form.Group>

      {gm && (
        <Form.Group controlId="takenAt" className="mb-3">
          <DateTime
            value={model.takenAt}
            onChange={handleTakenAtChange}
            placeholders={{
              date: gm.editForm.takenAt.date,
              time: gm.editForm.takenAt.time,
              datetime: gm.editForm.takenAt.datetime,
            }}
          />
        </Form.Group>
      )}

      <Form.Group
        controlId="location"
        className="mb-3"
        data-position-pick={id ?? -1}
      >
        <InputGroup>
          <Form.Control
            type="text"
            placeholder={gm?.editForm.location}
            onChange={handlePositionChange}
            value={model.dirtyPosition}
          />

          <Button variant="secondary" onClick={onPositionPick}>
            <FaMapMarkerAlt /> <Text m={gm} k="editForm.setLocation" />
          </Button>
        </InputGroup>

        {showPlaceName && (
          <PlaceName
            position={safeParseCoordinates(model.dirtyPosition)}
            className="mt-1"
          />
        )}
      </Form.Group>

      <Form.Group
        controlId="azimuth"
        className="mb-3 d-flex align-items-center"
      >
        <InputGroup>
          <Form.Control
            placeholder={gm?.editForm.azimuth}
            type="number"
            value={model.azimuth}
            onChange={handleAzimuthChange}
            min={0}
            max={360}
            step="any"
          />

          <InputGroup.Text>°</InputGroup.Text>
        </InputGroup>

        <Azimuth
          className="ms-2"
          value={model.azimuth ? parseFloat(model.azimuth) : null}
          size={34}
          onChange={handleAzimuthChange2}
        />
      </Form.Group>

      <Form.Group controlId="tags" className="mb-3" key={key}>
        <ReactTags
          placeholderText={gm?.editForm.tags}
          newOptionText={m?.general.newOptionText}
          deleteButtonText={m?.general.deleteButtonText}
          // Valued as its first suggestion, to show chosen in the list; picking
          // it there again removes it.
          // TODO: a new tag's value is its name, so typing it again and Enter
          // removes it.
          selected={model.tags.map((tag) => {
            const id = tag.id ?? findTag(allTags, tag)?.id;

            return {
              label: tagLabel(tag),
              value:
                (id === undefined ? undefined : keyOfId.get(id)) ?? tag.name,
            };
          })}
          suggestions={suggestions}
          suggestionsTransform={filterSuggestions}
          renderOption={TagSuggestionOption}
          noOptionsText={m?.general.noOptionsText}
          onAdd={handleTagAddition}
          onDelete={handleTagDelete}
          allowNew
          collapseOnSelect
        />

        <RecentTags className="mt-1" existingTags={model.tags} onAdd={addTag} />
      </Form.Group>

      <Form.Group controlId={`license-${id ?? 'x'}`} className="mb-3">
        <Form.Label>
          <Text m={gm} k="license.label" />
        </Form.Label>

        <GalleryLicenseSelect
          value={model.license}
          onChange={handleLicenseChange}
        />

        <Form.Text className="text-muted lh-sm d-block">
          <Text m={gm} k={`license.descriptions.${model.license}`} />
          {id === undefined && gm?.license.changeNote
            ? ` ${gm.license.changeNote}`
            : ''}
        </Form.Text>
      </Form.Group>

      <Form.Check
        id={`chk-premium-${id ?? 'x'}`}
        className="mb-3"
        type="checkbox"
        onChange={handlePremiumChange}
        checked={model.premium}
        label={gm?.uploadModal.premium}
      />
    </div>
  );
}
