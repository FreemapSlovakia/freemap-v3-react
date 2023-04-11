import { galleryAddTag, GalleryTag } from 'fm3/actions/galleryActions';
import { getMessageByKey, useMessages } from 'fm3/l10nInjector';
import 'fm3/styles/react-tag-autocomplete.css';
import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import { FaRegDotCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import ReactTags, { Tag } from 'react-tag-autocomplete';
import { DateTime } from '../DateTime';
import { RecentTags } from './RecentTags';

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
}

export function GalleryEditForm({
  model,
  allTags,
  errors,
  onPositionPick,
  onModelChange,
}: Props): ReactElement {
  const m = useMessages();

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

  const dispatch = useDispatch();

  const handleTagAddition = useCallback(
    ({ name }: Tag) => {
      const fixed = name.toLowerCase().trim().replace(/ {2,}/g, ' ');

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
              <FaRegDotCircle /> {m?.gallery.editForm.setLocation}
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </FormGroup>

      <FormGroup key={key}>
        <ReactTags
          placeholderText={m?.gallery.editForm.tags}
          tags={model.tags.map((tag) => ({ id: tag, name: tag }))}
          suggestions={allTags.map(({ name }) => ({ id: name, name }))}
          onAddition={handleTagAddition}
          onDelete={handleTagDelete}
          allowNew
        />

        <RecentTags
          className="mt-1"
          existingTags={model.tags}
          onAdd={(tag) => handleTagAddition({ id: tag, name: tag })}
        />
      </FormGroup>
    </div>
  );
}
