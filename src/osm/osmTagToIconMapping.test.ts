import { describe, expect, it } from 'vitest';
import { resolveGenericName } from './osmNameResolver.js';
import { osmTagToIconMapping } from './osmTagToIconMapping.js';

const icon = (tags: Record<string, string>) =>
  resolveGenericName(osmTagToIconMapping, tags);

// Two readings carrying the same tags cancel each other out, so a combination
// has to be named under one key whose reading carries both tags.
describe('towers', () => {
  it('names a lattice tower by what it carries', () => {
    expect(
      icon({
        man_made: 'tower',
        'tower:type': 'communication',
        'tower:construction': 'lattice',
      })[0],
    ).toBe('tower_lattice_communication');

    expect(
      icon({
        man_made: 'tower',
        'tower:type': 'lighting',
        'tower:construction': 'lattice',
      })[0],
    ).toBe('tower_lattice_lighting');
  });

  it('lets a distinctive type outrank the construction', () => {
    expect(
      icon({
        man_made: 'tower',
        'tower:construction': 'lattice',
        'tower:type': 'observation',
      })[0],
    ).toBe('tower_observation');
  });

  it('falls back to the construction where the type says nothing', () => {
    expect(
      icon({ man_made: 'tower', 'tower:construction': 'lattice' })[0],
    ).toBe('tower_lattice');

    expect(
      icon({
        man_made: 'tower',
        'tower:type': 'radar',
        'tower:construction': 'dome',
      })[0],
    ).toBe('tower_dome');
  });

  it('draws a plain tower as one', () => {
    expect(icon({ man_made: 'tower' })[0]).toBe('tower');
    expect(icon({ man_made: 'tower', 'tower:type': 'observation' })[0]).toBe(
      'tower_observation',
    );
  });
});

describe('places of worship', () => {
  it('reads the religion and the building alike', () => {
    expect(icon({ amenity: 'place_of_worship', religion: 'jewish' })[0]).toBe(
      'synagogue',
    );

    expect(icon({ amenity: 'place_of_worship', building: 'mosque' })[0]).toBe(
      'mosque',
    );
  });

  it('keeps its own reading where the building says nothing', () => {
    expect(
      icon({
        amenity: 'place_of_worship',
        religion: 'christian',
        building: 'yes',
      })[0],
    ).toBe('place_of_worship');
  });
});

describe('shops', () => {
  it('finds a hardware store under either spelling', () => {
    expect(icon({ shop: 'doityourself' })[0]).toBe('doityourself');
    expect(icon({ shop: 'diy' })[0]).toBe('doityourself');
  });
});
