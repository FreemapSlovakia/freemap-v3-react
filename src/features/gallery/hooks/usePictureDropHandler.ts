import ExifReader, { Tags } from 'exifreader';
import { useCallback } from 'react';
import { GalleryItem } from '../model/actions.js';
import { latLonToString } from '../../../geoutils.js';
import { loadPreview } from '../../../imagePreview.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';

let nextId = 1;

export function usePictureDropHandler(
  showPreview: boolean,
  language: string,
  onItemAdd: (item: GalleryItem) => void,
  onItemChange: (item: Pick<GalleryItem, 'id'> & Partial<GalleryItem>) => void,
): (files: File[]) => void {
  const premium = useAppSelector((state) => state.gallery.premium);

  const processFile = useCallback(
    (file: File, cb: (err?: unknown) => void) => {
      const reader = new FileReader();

      reader.onerror = () => {
        reader.abort();

        cb(new Error());
      };

      reader.onload = () => {
        let tags: Tags;

        try {
          tags = ExifReader.load(reader.result as ArrayBuffer);
        } catch (e) {
          console.error(e);

          tags = {} as Tags;
        }

        const keywords: string[] = [];

        // try {
        //   keywords.push(...tags.Keywords.description.split(',').map(x => x.trim()).filter(x => x));
        // } catch (e) {
        //   // ignore
        // }
        //
        // try {
        //   keywords.push(...tags.subject.value.map(({ description }) => description));
        // } catch (e) {
        //   // ignore
        // }

        const id = nextId;

        nextId += 1;

        const description = (
          tags['description']?.description ||
          tags.ImageDescription?.description ||
          ''
        ).trim();

        const takenAtRaw = tags.DateTimeOriginal || tags.DateTime;

        const rawAzimuth = tags.GPSImgDirection?.value;
        let azimuth: number | null = null;

        if (typeof rawAzimuth === 'number') {
          azimuth = rawAzimuth;
        } else if (
          Array.isArray(rawAzimuth) &&
          rawAzimuth.length === 2 &&
          typeof rawAzimuth[0] === 'number' &&
          typeof rawAzimuth[1] === 'number'
        ) {
          azimuth = rawAzimuth[0] / rawAzimuth[1];
        } else if (typeof rawAzimuth === 'string') {
          azimuth = parseFloat(rawAzimuth);
        }

        if (isNaN(azimuth ?? NaN)) {
          azimuth = null;
        }
        const [rawLat, latRef] = adaptGpsCoordinate(
          tags.GPSLatitude as WeirdGpsCoordinate,
        );

        const NS: Record<string, number> = { S: -1, N: 1 };

        const lat =
          rawLat *
          (NS[
            String(
              latRef ||
                ((tags.GPSLatitudeRef as { value: string[] }) ?? { value: [] })
                  .value[0] ||
                '',
            ).toUpperCase()
          ] ?? 1);

        const [rawLon, lonRef] = adaptGpsCoordinate(
          tags.GPSLongitude as WeirdGpsCoordinate,
        );

        const EW: Record<string, number> = { W: -1, E: 1 };

        const lon =
          rawLon *
          (EW[
            String(
              lonRef ||
                ((tags.GPSLongitudeRef as { value: string[] }) ?? { value: [] })
                  .value[0] ||
                '',
            ).toUpperCase()
          ] ?? 1);

        onItemAdd({
          id,
          file,
          dirtyPosition:
            Number.isNaN(lat) || Number.isNaN(lon)
              ? ''
              : latLonToString({ lat, lon }, language),
          azimuth,
          title: (
            tags['title']?.description ||
            tags['DocumentName']?.description ||
            ''
          ).trim(),
          description: /CAMERA|^DCIM/.test(description) ? '' : description,
          takenAt:
            (takenAtRaw && parseExifDateTime(takenAtRaw.description)) ?? null,
          tags: keywords,
          premium,
          errors: [],
        });

        if (showPreview) {
          // TODO adjust 618 by display width
          loadPreview(file, 618, (err, key) => {
            if (err) {
              cb(err);
            } else {
              onItemChange({ id, previewKey: key });

              cb();
            }
          });
        } else {
          cb();
        }
      };

      reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
    },
    [showPreview, language, onItemAdd, onItemChange, premium],
  );

  return useCallback(
    (acceptedFiles: File[] /* , rejectedFiles: File[] */) => {
      for (const accpetedFile of acceptedFiles) {
        processFile(accpetedFile, (err?: unknown) => {
          if (err) {
            console.error(err);

            // TODO return it
          }
        });
      }
    },
    [processFile],
  );
}

type WeirdGpsCoordinate = {
  description: string | number;
  value: string;
};

// adds support for Olympus and other weirdos
function adaptGpsCoordinate(coord: WeirdGpsCoordinate) {
  if (coord) {
    if (typeof coord.description === 'number') {
      return [coord.description];
    }

    // { value: "48,57.686031N", attributes: {}, description: "48.96143385N" }

    const { description, value } = coord;

    const p = /^(?:(\d+),)?(\d+(?:\.\d+)?)([NSWE])?$/;

    const m1 = p.exec(description);

    const m2 = p.exec(value);

    if (m1 && (!m2 || !m2[3])) {
      return parse2(m1);
    }

    if (m2) {
      return parse2(m2);
    }
  }

  return [Number.NaN, null] as const;
}

function parse2(m: RegExpExecArray) {
  return [
    m[1] === undefined
      ? parseFloat(m[2])
      : parseInt(m[1], 10) + parseFloat(m[2]) / 60,
    m[3] || null,
  ] as const;
}

function parseExifDateTime(s: string) {
  // try ISO
  if (s?.match(/\dT\d/)) {
    return new Date(s);
  }

  const m = /^(\d+):(\d+):(\d+)(?: (\d+)(?::(\d+)(?::(\d+))?)?)?$/.exec(s);

  return (
    (m &&
      new Date(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3]),
        m[4] ? Number(m[4]) : undefined,
        m[5] ? Number(m[5]) : undefined,
        m[6] ? Number(m[6]) : undefined,
      )) ||
    null
  );
}
