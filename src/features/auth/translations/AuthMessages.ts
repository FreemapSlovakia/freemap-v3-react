import type { ReactNode } from 'react';
import type { AppTokenScope, Role } from '../model/types.js';

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
    homeLocation: string;
    homeLocationUnset: string;
    setHomeLocation: string;
    roles: string;
    /**
     * Labels the checkboxes of what the public profile shows; `profile` links
     * its words to one's own profile as others see it.
     */
    publicFields: (props: {
      profile: (text: ReactNode) => ReactNode;
    }) => ReactNode;
    /** The stored address has not been proven by a code. */
    emailUnconfirmed: string;
    /** Shown while the field holds another address than the stored one. */
    emailChangeHint: string;
    emailConfirmed: string;
    /** Confirming would join an account with a clashing login provider. */
    mergeConflict: string;
    /** Under an empty email field: what goes missing without one. */
    emailMissing: string;
    /** Clearing refused: the email is the account's only login. */
    emailOnlyLogin: string;
    /** The page-top strip for an address not confirmed yet. */
    emailUnconfirmedBar: string;
    /** Its link to the account's personal information. */
    emailUnconfirmedBarLink: string;
    /** The page-top strip for an account with no address. */
    emailMissingBar: string;
    emailMissingBarLink: string;
    /** Turns that strip off for good. */
    dontRemind: string;
  };
  /** Logging in, or confirming an address, by a code sent there by email. */
  emailCode: {
    /** Separates the login providers from email login. */
    or: string;
    email: string;
    send: string;
    sent: (props: { email: string }) => ReactNode;
    code: string;
    logIn: string;
    confirm: string;
    resend: string;
    /** Send again, while the server would still refuse it. */
    resendIn: (props: { seconds: number }) => string;
    otherAddress: string;
    /** Confirming the code failed for another reason than the code. */
    confirmError: (props: { err: unknown }) => string;
    wrongCode: string;
    tooMany: string;
    error: (props: { err: unknown }) => string;
  };
  roleNames: Record<Role, string>;
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
    roleScopeExpiry: string;
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
