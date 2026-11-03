import type { ReactNode } from 'react';
import type { AppTokenScope } from '../model/types.js';

export type AuthMessages = {
  connectLabel: string;
  connectSuccess: (props: { provider: string }) => string;
  /** Re-authorizing as another remote user than the one connected. */
  differentAccount: (props: { provider: string }) => string;
  disconnectLabel: string;
  disconnectSuccess: string;
  lastProvider: string;
  logInWith: string;
  logInSuccess: string;
  logInError: (props: { err: unknown }) => string;
  logInError2: string;
  verifyError: (props: { err: unknown }) => string;
  logOutSuccess: string;
  logOutError: (props: { err: unknown }) => string;
  account: {
    name: string;
    email: string;
    description: string;
    delete: string;
    deleteWarning: string;
    personalInfo: string;
    authProviders: string;
    picture: string;
    choosePicture: string;
    pictureTooLarge: string;
  };
  appTokens: {
    title: string;
    about: string;
    intro: string;
    usage: ReactNode;
    tiles: ReactNode;
    keepSecret: string;
    none: string;
    create: string;
    note: string;
    scopes: string;
    scopeNames: Record<AppTokenScope, string>;
    expiration: string;
    never: string;
    days: (props: { count: number }) => string;
    customDate: string;
    pastDate: string;
    lastUsed: string;
    neverUsed: string;
    created: string;
    revoke: string;
    revokeConfirm: (props: { name: string }) => string;
    noNote: string;
    edit: string;
  };
};
