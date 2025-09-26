import type { ReactElement } from 'react';
import { ShowProps } from '../../hooks/useShow.js';
import { AsyncModal } from '../AsyncModal.js';

const supportUsModalFactory = () =>
  import(
    /* webpackChunkName: "support-us-modal" */
    '../../components/supportUsModal/SupportUsModal.js'
  );

export function AsyncSupportUsModal({ show }: ShowProps): ReactElement | null {
  return <AsyncModal show={show} factory={supportUsModalFactory} />;
}
