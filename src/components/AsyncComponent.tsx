import { useLazyComponent } from 'fm3/hooks/useLazyComponent';
import { ComponentType, ReactElement } from 'react';

type Props<T extends ComponentType<any> = ComponentType<any>> = {
  factory(): Promise<{ default: T }>;
};

export function AsyncComponent({ factory }: Props): ReactElement | null {
  const Component = useLazyComponent(factory, true);

  return Component ? <Component /> : null;
}
