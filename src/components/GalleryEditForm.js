import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import ReactTags from 'react-tag-autocomplete';
import 'fm3/styles/react-tag-autocomplete.css';

import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Alert from 'react-bootstrap/lib/Alert';

import { formatGpsCoord } from 'fm3/geoutils';
import * as FmPropTypes from 'fm3/propTypes';

function checkDatetimeLocalInput() {
  const input = document.createElement('input');
  input.setAttribute('type', 'datetime-local');

  const notADateValue = 'not-a-date';
  input.setAttribute('value', notADateValue);

  return input.value !== notADateValue;
}

const supportsDatetimeLocal = checkDatetimeLocalInput();

export default class GalleryEditForm extends React.Component {
  static propTypes = {
    model: FmPropTypes.galleryPictureModel.isRequired,
    allTags: FmPropTypes.allTags.isRequired,
    error: PropTypes.string,
    onPositionPick: PropTypes.func,
    onModelChange: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    language: PropTypes.string.isRequired,
  }

  handleTitleChange = (e) => {
    this.changeModel('title', e.target.value || null);
  }

  handleDescriptionChange = (e) => {
    this.changeModel('description', e.target.value || null);
  }

  handleTakenAtChange = (e) => {
    this.changeModel('takenAt', e.target.value ? new Date(e.target.value) : null);
  }

  handleTakenAtDateChange = (e) => {
    if (e.target.value) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.target.value);
      if (m) {
        const { takenAt } = this.props.model;
        if (takenAt && e.target.value) {
          const d = new Date(takenAt.getTime());
          d.setFullYear(parseInt(m[1], 10));
          d.setMonth(parseInt(m[2], 10), parseInt(m[3], 10));
          this.changeModel('takenAt', d);
        } else {
          this.changeModel('takenAt', new Date(e.target.value));
        }
      }
    } else {
      this.changeModel('takenAt', null);
    }
  }

  handleTakenAtTimeChange = (e) => {
    const m = e.target.value ? /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(e.target.value) : ['00', '00', '00'];
    const { takenAt } = this.props.model;
    if (m && takenAt) {
      const d = new Date(takenAt.getTime());
      d.setHours(parseInt(m[1], 10));
      d.setMinutes(parseInt(m[2], 10));
      d.setSeconds(parseInt(m[3], 10) || 0);
      d.setMilliseconds(0);
      this.changeModel('takenAt', d);
    }
  }

  handleTagAdded = ({ name }) => {
    const fixed = name.toLowerCase().trim().replace(/ {2,}/g, ' ');
    if (!this.props.model.tags.includes(fixed)) {
      this.changeModel('tags', [...this.props.model.tags, fixed]);
    }
  }

  handleTagDeleted = (i) => {
    const tags = [...this.props.model.tags];
    tags.splice(i, 1);
    this.changeModel('tags', tags);
  }

  changeModel(key, value) {
    this.props.onModelChange({ ...this.props.model, [key]: value });
  }

  render() {
    const { model, allTags, error, onPositionPick, t, language } = this.props;

    return (
      <div>
        {error && <Alert bsStyle="danger">{error}</Alert>}
        <FormGroup>
          <FormControl
            placeholder={t('gallery.editForm.name')}
            type="text"
            value={model.title}
            onChange={this.handleTitleChange}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            placeholder={t('gallery.editForm.description')}
            componentClass="textarea"
            value={model.description}
            onChange={this.handleDescriptionChange}
          />
        </FormGroup>
        {
          supportsDatetimeLocal ? (
            <FormGroup>
              <FormControl
                type="datetime-local"
                placeholder={t('gallery.editForm.takenAt.datetime')}
                value={model.takenAt ? `${zeropad(model.takenAt.getFullYear(), 4)}-${zeropad(model.takenAt.getMonth() + 1)}-${zeropad(model.takenAt.getDate())}T${zeropad(model.takenAt.getHours())}:${zeropad(model.takenAt.getMinutes())}:${zeropad(model.takenAt.getSeconds())}` : ''}
                onChange={this.handleTakenAtChange}
              />
            </FormGroup>
          ) : (
            <>
              <FormGroup>
                <FormControl
                  type="date"
                  placeholder={t('gallery.editForm.takenAt.date')}
                  value={model.takenAt ? `${zeropad(model.takenAt.getFullYear(), 4)}-${zeropad(model.takenAt.getMonth() + 1)}-${zeropad(model.takenAt.getDate())}` : ''}
                  onChange={this.handleTakenAtDateChange}
                />
              </FormGroup>
              <FormGroup>
                <FormControl
                  type="time"
                  placeholder={t('gallery.editForm.takenAt.time')}
                  value={model.takenAt ? `${zeropad(model.takenAt.getHours())}:${zeropad(model.takenAt.getMinutes())}:${zeropad(model.takenAt.getSeconds())}` : ''}
                  onChange={this.handleTakenAtTimeChange}
                />
              </FormGroup>
            </>
          )
        }
        <FormGroup>
          <InputGroup>
            <FormControl
              type="text"
              placeholder={t('gallery.editForm.location')}
              value={model.position ? `${formatGpsCoord(model.position.lat, 'SN', 'DMS', language)}, ${formatGpsCoord(model.position.lon, 'WE', 'DMS', language)}` : ''}
              onClick={onPositionPick}
              readOnly
            />
            <InputGroup.Button>
              <Button onClick={onPositionPick}>
                <FontAwesomeIcon icon="dot-circle-o" />{t('gallery.editForm.setLocation')}
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <ReactTags
            placeholder={t('gallery.editForm.tags')}
            tags={model.tags.map(tag => ({ id: tag, name: tag }))}
            suggestions={allTags.map(({ name }) => ({ id: name, name }))}
            handleAddition={this.handleTagAdded}
            handleDelete={this.handleTagDeleted}
            allowNew
          />
        </FormGroup>
      </div>
    );
  }
}

function zeropad(v, n = 2) {
  const raw = `0000${v}`;
  return raw.substring(raw.length - n, raw.length);
}
