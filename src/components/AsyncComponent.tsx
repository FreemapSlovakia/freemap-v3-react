import { useLazy } from 'fm3/hooks/useLazy';
import { ComponentType, ReactElement } from 'react';

type Props<T extends ComponentType<any> = ComponentType<any>> = {
  factory(): Promise<{ default: T }>;
};

export function AsyncComponent({ factory }: Props): ReactElement | null {
  const Component = useLazy(factory);

  return Component ? <Component /> : null;
}
