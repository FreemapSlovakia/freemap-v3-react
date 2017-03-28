import React from 'react';
import toastEmitter from 'fm3/emitters/toastEmitter';
import { ToastContainer, ToastMessage } from 'react-toastr';

const ToastMessageFactory = React.createFactory(ToastMessage.animation);

export default class Toasts extends React.Component {
  componentWillMount() {
    toastEmitter.on('showToast', this.showToast);
  }

  componentWillUnmount() {
    toastEmitter.removeListener('showToast', this.handlePoiAdded);
  }

  showToast = (toastType, line1, line2) => {
    this.toastContainer[toastType](
      line2,
      line1, // sic!
      { timeOut: 3000, showAnimation: 'animated fadeIn', hideAnimation: 'animated fadeOut' },
    );
  }

  render() {
    return (<ToastContainer
      ref={(toastContainer) => { this.toastContainer = toastContainer; }}
      toastMessageFactory={ToastMessageFactory}
      className="toast-top-right"
    />);
  }
}
