export type AuthMessages = {
  connectLabel: string;
  connectSuccess: string;
  disconnectLabel: string;
  disconnectSuccess: string;
  logInWith: string;
  logInSuccess: string;
  logInError: (props: { err: unknown }) => string;
  logInError2: string;
  verifyError: (props: { err: unknown }) => string;
  logOutSuccess: string;
  logOutError: (props: { err: unknown }) => string;
};
