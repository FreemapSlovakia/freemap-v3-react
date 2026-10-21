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
};
