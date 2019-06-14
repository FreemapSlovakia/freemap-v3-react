export interface LatLon {
  lat: number;
  lon: number;
}

export interface IUser {
  name: string;
  email: string;
  id: number;
  authToken: string;
  isAdmin: boolean;
}
