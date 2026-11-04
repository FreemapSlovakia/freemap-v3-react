export type UserProfileMessages = {
  memberSince: string;
  roles: string;
  email: string;
  photos: string;
  /** Comments the user wrote on photos. */
  comments: string;
  /** Public events the user organizes. */
  events: string;
  showPhotos: string;
  /** Opens the account settings, on one's own profile. */
  edit: string;
};
