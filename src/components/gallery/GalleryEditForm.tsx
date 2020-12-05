import React, { useCallback } from 'react';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import ReactTags, { Tag } from 'react-tag-autocomplete';
import 'fm3/styles/react-tag-autocomplete.css';

import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Alert from 'react-bootstrap/lib/Alert';

import { DateTime } from '../DateTime';
import { GalleryTag } from 'fm3/actions/galleryActions';
import { Messages } from 'fm3/translations/messagesInterface';
import { getMessageByKey } from 'fm3/l10nInjector';

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

export const GalleryEditForm: React.FC<Props> = ({
  model,
  allTags,
  errors,
  onPositionPick,
  m,
  onModelChange,
}) => {
  const changeModel = useCallback(
    (key: keyof PictureModel, value: any) => {
      onModelChange({ ...model, [key]: value });
    },
    [model, onModelChange],
  );

  const handleTitleChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      changeModel('title', (e.target as HTMLInputElement).value || null);
    },
    [changeModel],
  );

  const handleDescriptionChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      changeModel(
        'description',
        (e.target as HTMLTextAreaElement).value || null,
      );
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
    (e: React.FormEvent<FormControl>) => {
      changeModel(
        'dirtyPosition',
        (e.target as HTMLTextAreaElement).value || null,
      );
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
        <Alert bsStyle="danger" key={error}>
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
          componentClass="textarea"
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
          <InputGroup.Button>
            <Button onClick={onPositionPick}>
              <FontAwesomeIcon icon="dot-circle-o" />
              {m?.gallery.editForm.setLocation}
            </Button>
          </InputGroup.Button>
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
};
