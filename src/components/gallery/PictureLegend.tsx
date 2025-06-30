import { Card } from 'react-bootstrap';

export function PictureLegend() {
  return (
    <div>
      <Card className="fm-toolbar mt-2">
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
              background:
                'linear-gradient(to right in hsl, hsl(60 100% 7%), hsl(60 100% 99%))',
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
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
