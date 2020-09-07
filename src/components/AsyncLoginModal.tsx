import React, { lazy, Suspense } from 'react';
import { AsyncLoadingIndicator } from 'fm3/components/AsyncLoadingIndicator';

const LoginModal = lazy(() =>
  import(
    /* webpackChunkName: "loginModal" */ 'fm3/components/LoginModal'
  ).then(({ LoginModal }) => ({ default: LoginModal })),
);

export const AsyncLoginModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <LoginModal />
  </Suspense>
);
