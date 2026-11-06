import { describe, expect, it } from 'vitest';
import {
  type CommonsImage,
  captionOf,
  commonsFromTags,
  thumbnailUrl,
} from './commons.js';

const image = (width: number, vector = false): CommonsImage => ({
  title: 'File:X.jpg',
  width,
  height: 1000,
  thumbUrl: 'https://upload.wikimedia.org/thumb/a/ab/X.jpg/120px-X.jpg',
  vector,
  pageUrl: '',
  caption: '',
});

describe('thumbnailUrl', () => {
  it('takes the smallest standard width covering the need', () => {
    expect(thumbnailUrl(image(4000), 300)).toMatch(/\/330px-X\.jpg$/);
  });

  it('stays below the original width of a bitmap', () => {
    expect(thumbnailUrl(image(400), 900)).toMatch(/\/330px-X\.jpg$/);
  });

  it('scales a vector past its nominal width', () => {
    expect(thumbnailUrl(image(100, true), 400)).toMatch(/\/500px-X\.jpg$/);
  });
});

describe('captionOf', () => {
  it('keeps the first sentence of the visible text', () => {
    expect(
      captionOf(
        'Toto médium zobrazuje <i>pamiatku</i>. <span style="display:none">CHMSK</span>Ďalšie.',
        'File:X.jpg',
      ),
    ).toBe('Toto médium zobrazuje pamiatku.');
  });

  it('falls back to the file name', () => {
    expect(captionOf(undefined, 'File:Plesivec ulice.jpg')).toBe(
      'Plesivec ulice',
    );
  });
});

describe('commonsFromTags', () => {
  it('reads files and a category from tags and Commons URLs', () => {
    expect(
      commonsFromTags({
        wikimedia_commons: 'Category:Plešivec',
        image:
          'https://commons.wikimedia.org/wiki/File:Ple%C5%A1ivec_church.JPG;https://example.com/a.jpg',
      }),
    ).toEqual({
      files: ['File:Plešivec church.JPG'],
      category: 'Category:Plešivec',
    });
  });

  it('skips a Commons URL with a malformed escape', () => {
    expect(
      commonsFromTags({
        image: 'https://commons.wikimedia.org/wiki/File:100%_pure.jpg',
      }),
    ).toEqual({ files: [], category: undefined });
  });
});
