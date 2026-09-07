import { FaRegCircle, FaRegDotCircle } from 'react-icons/fa';

type Props = {
  value: boolean;
};

export function Radio({ value }: Props) {
  return value ? <FaRegDotCircle /> : <FaRegCircle />;
}
