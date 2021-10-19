import { ShowProps } from 'fm3/hooks/useShow';
import { ReactElement } from 'react';
import { AsyncModal } from '../AsyncModal';

const supportUsModalFactory = () =>
  import('fm3/components/supportUsModal/SupportUsModal');

export function AsyncSupportUsModal({ show }: ShowProps): ReactElement | null {
  return <AsyncModal show={show} factory={supportUsModalFactory} />;
}
