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

describe('springs', () => {
  it('a mineral spring is that alone, whatever else it is', () => {
    for (const tags of [
      {} as Record<string, string>,
      { drinking_water: 'yes' },
      { drinking_water: 'no' },
      { refitted: 'yes' },
      { refitted: 'yes', drinking_water: 'yes' },
      { drinking_water: 'yes', refitted: 'yes' },
    ]) {
      expect(
        icon({ natural: 'spring', water_characteristic: 'mineral', ...tags }),
        JSON.stringify(tags),
      ).toEqual(['mineral-spring']);
    }
  });

  it('a spring without it keeps its own icon', () => {
    expect(
      icon({ natural: 'spring', refitted: 'yes', drinking_water: 'yes' }),
    ).toEqual(['refitted_drinking_spring']);

    expect(icon({ natural: 'spring', drinking_water: 'no' })).toEqual([
      'not_drinking_spring',
    ]);

    // A value saying the water is not mineral.
    expect(
      icon({
        natural: 'spring',
        drinking_water: 'yes',
        water_characteristic: 'fresh',
      }),
    ).toEqual(['drinking_spring']);
  });
});

describe('shops', () => {
  it('finds a hardware store under either spelling', () => {
    expect(icon({ shop: 'doityourself' })[0]).toBe('doityourself');
    expect(icon({ shop: 'diy' })[0]).toBe('doityourself');
  });
});

describe('drinkable marks', () => {
  it('marks a well both ways', () => {
    expect(icon({ man_made: 'water_well', drinking_water: 'yes' })[0]).toBe(
      'water_well_drinkable',
    );

    expect(icon({ man_made: 'water_well', drinking_water: 'no' })[0]).toBe(
      'water_well_not_drinkable',
    );

    expect(icon({ man_made: 'water_well' })[0]).toBe('water_well');
  });

  it('marks only what the glyph does not say', () => {
    expect(icon({ amenity: 'fountain', drinking_water: 'no' })[0]).toBe(
      'fountain',
    );

    expect(icon({ amenity: 'drinking_water', drinking_water: 'yes' })[0]).toBe(
      'drinking_water',
    );

    expect(icon({ amenity: 'drinking_water', drinking_water: 'no' })[0]).toBe(
      'drinking_water_not_drinkable',
    );
  });
});

describe('peaks and memorials', () => {
  it('draws a summit cross', () => {
    expect(icon({ natural: 'peak', 'summit:cross': 'yes' })[0]).toBe(
      'peak_cross',
    );
  });

  it('draws a blue plaque as a plaque', () => {
    expect(icon({ historic: 'memorial', memorial: 'blue_plaque' })[0]).toBe(
      'plaque',
    );
  });
});

// As in the outdoor map: car, else bicycle, else scooter or motorcycle, else
// the bare bolt on motorcar=no; any value but no admits a vehicle.
describe('charging stations', () => {
  const station = (tags: Record<string, string>) =>
    icon({ amenity: 'charging_station', ...tags });

  it('shows one icon by vehicle precedence', () => {
    for (const [tags, expected] of [
      [{}, 'charging_station'],
      [{ motorcar: 'yes' }, 'charging_station'],
      [{ motorcar: 'no' }, 'charging_station_other'],
      [{ bicycle: 'designated' }, 'charging_station_bicycle'],
      [{ bicycle: 'yes', motorcar: 'yes' }, 'charging_station'],
      [{ motorcar: 'yes', bicycle: 'yes' }, 'charging_station'],
      [{ motorcar: 'no', bicycle: 'yes' }, 'charging_station_bicycle'],
      [{ scooter: 'yes', bicycle: 'yes' }, 'charging_station_bicycle'],
      [{ bicycle: 'no', scooter: 'yes' }, 'charging_station_scooter'],
      [{ motorcar: 'no', motorcycle: 'yes' }, 'charging_station_scooter'],
      [{ scooter: 'yes', bicycle: 'yes', motorcar: 'yes' }, 'charging_station'],
      [{ bicycle: 'no' }, 'charging_station'],
      [{ bicycle: 'no', motorcar: 'no' }, 'charging_station_other'],
    ] as const) {
      expect(station(tags), JSON.stringify(tags)).toEqual([expected]);
    }
  });
});
