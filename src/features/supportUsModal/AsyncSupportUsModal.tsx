import { AsyncModal } from '@shared/components/AsyncModal.js';
import type { ReactElement } from 'react';
import { ShowProps } from '../../hooks/useShow.js';

const supportUsModalFactory = () =>
  import(
    /* webpackChunkName: "support-us-modal" */
    './SupportUsModal.js'
  );

export function AsyncSupportUsModal({ show }: ShowProps): ReactElement | null {
  return <AsyncModal show={show} factory={supportUsModalFactory} />;
}
