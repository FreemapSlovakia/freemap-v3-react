import { AsyncModal } from '@shared/components/AsyncModal.js';
import { ShowProps } from '@shared/hooks/useShow.js';
import type { ReactElement } from 'react';

const supportUsModalFactory = () =>
  import(
    /* webpackChunkName: "support-us-modal" */
    './SupportUsModal.js'
  );

export function AsyncSupportUsModal({ show }: ShowProps): ReactElement | null {
  return <AsyncModal show={show} factory={supportUsModalFactory} />;
}
