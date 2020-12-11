import { ChangeEvent, ReactElement, useCallback } from 'react';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import ReactTags, { Tag } from 'react-tag-autocomplete';
import 'fm3/styles/react-tag-autocomplete.css';

import { DateTime } from '../DateTime';
import { GalleryTag } from 'fm3/actions/galleryActions';
import { Messages } from 'fm3/translations/messagesInterface';
import { getMessageByKey } from 'fm3/l10nInjector';
import {
  Alert,
  Button,
  FormControl,
  FormGroup,
  InputGroup,
} from 'react-bootstrap';

export interface PictureModel {
  title: string;
  description: string;
  tags: string[];
  takenAt: string;
  dirtyPosition: string;
}

interface Props {
  model: PictureModel;
  allTags: GalleryTag[];
  errors: string[] | null | undefined;
  onPositionPick: undefined | (() => void);
  onModelChange: (model: PictureModel) => void;
  m?: Messages;
}

export function GalleryEditForm({
  model,
  allTags,
  errors,
  onPositionPick,
  m,
  onModelChange,
}: Props): ReactElement {
  const changeModel = useCallback(
    (key: keyof PictureModel, value: any) => {
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

  const handleTagAddition = useCallback(
    ({ name }: Tag) => {
      const fixed = name.toLowerCase().trim().replace(/ {2,}/g, ' ');

      if (!model.tags.includes(fixed)) {
        changeModel('tags', [...model.tags, fixed]);
      }
    },
    [changeModel, model.tags],
  );

  const handleTagDelete = useCallback(
    (i: number) => {
      const tags = [...model.tags];
      tags.splice(i, 1);
      changeModel('tags', tags);
    },
    [changeModel, model.tags],
  );

  const RT = ReactTags as any; // TODO temporary until ts definitions are updated

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
      <FormGroup>
        <FormControl
          placeholder={m?.gallery.editForm.name}
          type="text"
          value={model.title}
          onChange={handleTitleChange}
          maxLength={255}
        />
      </FormGroup>
      <FormGroup>
        <FormControl
          placeholder={m?.gallery.editForm.description}
          as="textarea"
          value={model.description}
          onChange={handleDescriptionChange}
          maxLength={4096}
        />
      </FormGroup>
      {m && (
        <FormGroup>
          <DateTime
            value={model.takenAt}
            onChange={handleTakenAtChange}
            placeholders={{
              date: m.gallery.editForm.takenAt.date,
              time: m.gallery.editForm.takenAt.time,
              datetime: m.gallery.editForm.takenAt.datetime,
            }}
          />
        </FormGroup>
      )}
      <FormGroup>
        <InputGroup>
          <FormControl
            type="text"
            placeholder={m?.gallery.editForm.location}
            onChange={handlePositionChange}
            value={model.dirtyPosition}
          />
          <InputGroup.Append>
            <Button onClick={onPositionPick}>
              <FontAwesomeIcon icon="dot-circle-o" />
              {m?.gallery.editForm.setLocation}
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </FormGroup>
      <FormGroup>
        <RT
          placeholderText={m?.gallery.editForm.tags}
          tags={model.tags.map((tag) => ({ id: tag, name: tag }))}
          suggestions={allTags.map(({ name }) => ({ id: name, name }))}
          onAddition={handleTagAddition}
          onDelete={handleTagDelete}
          allowNew
        />
      </FormGroup>
    </div>
  );
}
