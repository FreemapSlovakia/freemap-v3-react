import {
  ElementType,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type RefCallback,
} from 'react';
import { Button, ButtonProps, Overlay, Tooltip } from 'react-bootstrap';
import { BsPrefixRefForwardingComponent } from 'react-bootstrap/helpers';

export function withContextTooltip<
  P extends {
    title?: string;
    ref?: RefCallback<R>;
    onContextMenu?: (e: MouseEvent<R>) => void;
  },
  R extends Element = Element,
>(WrappedComponent: BsPrefixRefForwardingComponent<ElementType, P>) {
  return function WithContextTooltip(props: P): ReactElement {
    const { title, ref: userRef, onContextMenu, ...rest } = props;

    const anchorRef = useRef<R | null>(null);

    const [show, setShow] = useState(false);

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      onContextMenu?.(e as MouseEvent<R>);

      setShow(true);

      setTimeout(() => setShow(false), 2000);
    };

    const composedRef: RefCallback<R> = (node) => {
      userRef?.(node);

      anchorRef.current = node;
    };

    return (
      <>
        <WrappedComponent
          {...(rest as any)}
          ref={composedRef}
          onContextMenu={handleContextMenu}
        />

        <Overlay target={anchorRef.current} show={show} placement="top">
          {(p) => (
            <Tooltip id="tooltip" {...p}>
              {title}
            </Tooltip>
          )}
        </Overlay>
      </>
    );
  };
}

export const ButtonWithTooltip = withContextTooltip<
  ButtonProps,
  HTMLButtonElement
>(Button);
