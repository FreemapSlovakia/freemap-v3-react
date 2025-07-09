import { Card } from 'react-bootstrap';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';

export function PictureLegend() {
  const colorizeBy = useAppSelector(
    (state) => state.map.layers.includes('I') && state.gallery.colorizeBy,
  );

  const m = useMessages();

  const byDate = colorizeBy === 'takenAt' || colorizeBy === 'createdAt';

  const background =
    colorizeBy === 'rating'
      ? 'linear-gradient(to right in hsl, hsl(60 100% 1%), hsl(60 100% 99%))'
      : byDate
        ? 'linear-gradient(to right in hsl, hsl(60 100% 99%), hsl(60 100% 1%))'
        : colorizeBy === 'season'
          ? `linear-gradient(
              to right in lab,
              lab(70 -5 -52) 0%,  /* winter */
              lab(70 -62 42) 25%, /* spring */
              lab(90 -4 74) 50%,  /* summer */
              lab(70 48 43) 75%,  /* fall */
              lab(70 -5 -52) 100% /* wrap back to winter */
            )`
          : undefined;

  if (!background) {
    return null;
  }

  return (
    <div className="w-100" style={{ maxWidth: '400px' }}>
      <Card className="fm-toolbar mt-2 d-flex">
        <div>{m?.gallery.legend}</div>

        <div
          className="mx-2"
          style={{
            flexGrow: '1',
            position: 'relative',
            height: '34px',
          }}
        >
          <div
            className="border rounded position-absolute"
            style={{
              inset: 0,
              background,
            }}
          />

          <div
            className="text-body position-absolute"
            style={{
              inset: 0,
              paintOrder: 'stroke',
              WebkitTextStrokeWidth: '2px',
              WebkitTextStrokeColor: 'var(--bs-body-bg)',
            }}
          >
            {colorizeBy === 'rating' ? (
              <>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `calc(${(i * 100) / 4}% - 20px)`,
                        top: '16%',
                        width: '40px',
                        textWrap: 'nowrap',
                        textAlign: 'center',
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
              </>
            ) : byDate ? (
              <>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 40].map((i, j) => (
                  <div
                    key={i}
                    style={{
                      transform: 'rotate(90deg)',
                      fontSize: '0.75em',
                      position: 'absolute',
                      left: `calc(${(0.333 * i * 100) / (1 + 0.333 * i)}% - 4px)`,
                      top: j % 2 ? '3px' : '13px',
                    }}
                  >
                    {-i}
                  </div>
                ))}
              </>
            ) : colorizeBy === 'season' ? (
              <>
                {Array(13)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `calc(${(i * 100) / 12}% - 20px)`,
                        top: '16%',
                        width: '40px',
                        textWrap: 'nowrap',
                        textAlign: 'center',
                      }}
                    >
                      {(i % 12) + 1}
                    </div>
                  ))}
              </>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
