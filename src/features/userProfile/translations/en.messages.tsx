import type { UserProfileMessages } from './UserProfileMessages.js';

const en: UserProfileMessages = {
  memberSince: (date) => `Member since ${date}`,
  photos: 'Uploaded photos',
  comments: "The user's comments on photos",
  events: 'Organized public events',
  showPhotos: 'Photos on the map',
  edit: 'Edit profile',
};

export default en;
