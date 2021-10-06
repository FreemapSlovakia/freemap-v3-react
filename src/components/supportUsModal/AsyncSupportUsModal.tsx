import { ShowProps } from 'fm3/hooks/useShow';
import { ReactElement } from 'react';
import { AsyncModal } from '../AsyncModal';

export function AsyncSupportUsModal({ show }: ShowProps): ReactElement | null {
  return (
    <AsyncModal
      show={show}
      factory={() => import('fm3/components/supportUsModal/SupportUsModal')}
    />
  );
}
