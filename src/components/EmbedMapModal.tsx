import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import InputGroup from 'react-bootstrap/lib/InputGroup';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setActiveModal } from 'fm3/actions/mainActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapDispatchToProps> & {
  t: Translator;
};

export class EmbedMapModal extends React.Component<Props> {
  state = {
    width: 500,
    height: 300,
    enableSearch: true,
    enableMapSwitch: true,
    enableLocateMe: true,
  };

  textarea: HTMLInputElement | null = null;

  setFormControl = (textarea: HTMLInputElement | null) => {
    this.textarea = textarea;
    setTimeout(() => {
      if (textarea) {
        textarea.setSelectionRange(0, 9999);
      }
    });
  };

  handleCopyClick = () => {
    if (this.textarea) {
      this.textarea.focus();
      setTimeout(() => {
        if (this.textarea) {
          this.textarea.setSelectionRange(0, 9999);
        }
      });
      document.execCommand('copy');
    }
  };

  handleWidthChange = (e: React.FormEvent<FormControl>) => {
    this.setState({
      width: (e.target as HTMLInputElement).value,
    });
  };

  handleHeightChange = (e: React.FormEvent<FormControl>) => {
    this.setState({
      height: (e.target as HTMLInputElement).value,
    });
  };

  handleEnableSearchChange = (e: React.FormEvent<Checkbox>) => {
    this.setState({
      enableSearch: (e.target as HTMLInputElement).checked,
    });
  };

  handleEnableMapSwitchChange = (e: React.FormEvent<Checkbox>) => {
    this.setState({
      enableMapSwitch: (e.target as HTMLInputElement).checked,
    });
  };

  handleEnableLocateMeChange = (e: React.FormEvent<Checkbox>) => {
    this.setState({
      enableLocateMe: (e.target as HTMLInputElement).checked,
    });
  };

  render() {
    const { onModalClose, t } = this.props;
    const {
      width,
      height,
      enableSearch,
      enableMapSwitch,
      enableLocateMe,
    } = this.state;

    const embedFeatures = [
      enableSearch && 'search',
      !enableMapSwitch && 'noMapSwitch',
      !enableLocateMe && 'noLocateMe',
    ].filter(x => x);
    const shareURL = `${window.location.href.replace(/&show=[^&]*/, '')}${
      embedFeatures.length ? `&embed=${embedFeatures.join(',')}` : ''
    }`;

    return (
      <Modal show onHide={onModalClose} className="dynamic">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon="code" /> {t('more.embedMap')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup style={{ maxWidth: '542px' }}>
            <ControlLabel>{t('embed.dimensions')}</ControlLabel>
            <InputGroup>
              <InputGroup.Addon>{t('embed.width')}</InputGroup.Addon>
              <FormControl
                type="number"
                value={width}
                min={100}
                max={1600}
                step={10}
                required
                onChange={this.handleWidthChange}
              />
              <InputGroup.Addon>{t('embed.height')}</InputGroup.Addon>
              <FormControl
                type="number"
                value={height}
                min={100}
                max={1200}
                step={10}
                required
                onChange={this.handleHeightChange}
              />
            </InputGroup>
          </FormGroup>

          <strong>{t('embed.enableFeatures')}</strong>
          <Checkbox
            onChange={this.handleEnableSearchChange}
            checked={enableSearch}
          >
            {t('embed.enableSearch')}
          </Checkbox>
          <Checkbox
            onChange={this.handleEnableMapSwitchChange}
            checked={enableMapSwitch}
          >
            {t('embed.enableMapSwitch')}
          </Checkbox>
          <Checkbox
            onChange={this.handleEnableLocateMeChange}
            checked={enableLocateMe}
          >
            {t('embed.enableLocateMe')}
          </Checkbox>
          <hr />
          <p>{t('embed.code')}</p>
          <FormControl
            inputRef={this.setFormControl}
            componentClass="textarea"
            value={`<iframe src="${shareURL}" style="width: ${width}px; height: ${height}px; border: 0" allowfullscreen />`}
            readOnly
            rows={3}
          />
          <br />
          <p>{t('embed.example')}</p>
          <iframe
            title="Freemap.sk"
            style={{ width: `${width}px`, height: `${height}px`, border: '0' }}
            src={shareURL}
            allowFullScreen
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleCopyClick}>
            <Glyphicon glyph="copy" /> {t('general.copyCode')}
          </Button>{' '}
          <Button onClick={onModalClose}>
            <Glyphicon glyph="remove" /> {t('general.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModalClose() {
    dispatch(setActiveModal(null));
  },
});

export default connect(
  null,
  mapDispatchToProps,
)(withTranslator(EmbedMapModal));
