import { Card } from 'react-bootstrap';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';

export function PictureLegend() {
  const colorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  const m = useMessages();

  const background =
    colorizeBy === 'rating'
      ? 'linear-gradient(to right in hsl, hsl(60 100% 1%), hsl(60 100% 99%))'
      : colorizeBy === 'takenAt' || colorizeBy === 'createdAt'
        ? 'linear-gradient(to right in hsl, hsl(60 100% 99%), hsl(60 100% 1%))'
        : colorizeBy === 'season'
          ? `linear-gradient(
              to right in lab,
              lab(70 -5 -52) 0%,      /* winter */
              lab(70 -62 42) 25%,     /* spring */
              lab(90 -4 74) 50%,      /* summer */
              lab(70 48 43) 75%,      /* fall */
              lab(70 -5 -52) 100%     /* wrap back to winter */
            )`
          : undefined;

  if (!background) {
    return null;
  }

  console.log({ background });

  return (
    <div>
      <Card className="fm-toolbar mt-2">
        <div>{m?.gallery.legend}</div>
        <div
          style={{
            position: 'relative',
            width: '300px',
            height: '34px',
          }}
        >
          <div
            className="px-1"
            style={{
              position: 'absolute',
              inset: 0,
              background,
              margin: '0 7px',
              border: '1px solid #ccc',
            }}
          />

          <div
            className="px-1"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              textShadow: `
                -1px -1px 0 white,
                0px -1px 0 white,
                1px -1px 0 white,
                -1px  0px 0 white,
                0px  0px 0 white,
                1px  0px 0 white,
                -1px  1px 0 white,
                0px  1px 0 white,
                1px  1px 0 white`,
            }}
          >
            {colorizeBy === 'rating' ? (
              <>
                {' '}
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
              </>
            ) : colorizeBy === 'season' ? (
              <>
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
                <div>8</div>
                <div>9</div>
                <div>10</div>
                <div>11</div>
                <div>12</div>
                <div>1</div>
              </>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
