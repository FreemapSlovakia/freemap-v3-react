export class NoElevationDataError extends Error {
  constructor() {
    super('no elevation data in the area');
  }
}
