import { Modal as ReactOverlayModal } from 'react-overlays';

const focus = () => {};
const cDU = ReactOverlayModal.prototype.componentDidUpdate;
const cDM = ReactOverlayModal.prototype.componentDidMount;

ReactOverlayModal.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
  if (this.focus !== focus) {
    this.focus = focus;
  }
  cDU.call(this, prevProps);
};

ReactOverlayModal.prototype.componentDidMount = function componentDidMount() {
  if (this.focus !== focus) {
    this.focus = focus;
  }
  cDM.call(this);
};
