import { JSX, ReactNode } from 'react';

export type Messages = {
  trackedDevices: {
    button: string;
    modalTitle: string;
    desc: string;
    modifyTitle: (name: ReactNode) => JSX.Element;
    createTitle: (name: ReactNode) => JSX.Element;
    storageWarning: string;
  };
  accessToken: {
    token: string;
    timeFrom: string; // TODO move to general
    timeTo: string; // TODO move to general
    listingLabel: string;
    note: string; // TODO move to general
    delete: string;
  };
  accessTokens: {
    modalTitle: (deviceName: string) => JSX.Element;
    desc: (deviceName: string) => JSX.Element;
    createTitle: (deviceName: string) => JSX.Element;
    modifyTitle: (props: { token: string; deviceName: string }) => JSX.Element;
  };
  trackedDevice: {
    token: string;
    label: string;
    fromTime: string;
    maxAge: string;
    maxCount: string;
    splitDistance: string;
    splitDuration: string;
    color: string;
    width: string;
  };
  devices: {
    button: string;
    modalTitle: string;
    createTitle: string;
    watchTokens: string;
    watchPrivately: string;
    watch: string;
    delete: string;
    modifyTitle: (props: { name: string }) => JSX.Element;
    desc: () => JSX.Element;
  };
  device: {
    token: string;
    name: string;
    maxAge: string;
    maxCount: string;
    generatedToken: string;
  };
  visual: {
    line: string;
    points: string;
    'line+points': string;
  };
  subscribeNotFound: (props: { id: string | number }) => JSX.Element;
  subscribeError: (props: { id: string | number }) => JSX.Element;
};
