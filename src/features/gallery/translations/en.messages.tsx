import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { GalleryMessages } from './GalleryMessages.js';

const en: GalleryMessages = {
  sendGalleryEmails: 'Notify photos comments via email',
  stats: {
    leaderboard: 'Leaderboard',
    country: 'Country',
    perUserPerCountry: 'Photos per Author per Country',
    perUser: 'Photos per Author',
    more: 'More',
    less: 'Less',
    user: 'Author',
    photos: 'Photos',
    numberOfPhotos: 'Number of Photos',
    timePeriod: 'Time Period',
    allTime: 'All Time',
    last3months: 'Last 3 Months',
    last30days: 'Last 30 Days',
  },
  legend: 'Legend',
  recentTags: 'Recent tags to assign:',
  filter: 'Filter',
  showPhotosFrom: 'View photos',
  showLayer: 'Show the layer',
  upload: 'Upload',
  f: {
    '-createdAt': 'from last uploaded',
    '-takenAt': 'from newest',
    '-rating': 'from most rated',
    '-lastCommentedAt': 'from last comment',
  },
  colorizeBy: 'Colorize by',
  showDirection: 'Show shooting direction',
  showLegend: 'Show colorizing legend',
  c: {
    disable: "Don't colorize",
    mine: 'Differ mine',
    userId: 'Author',
    rating: 'Rating',
    takenAt: 'Taken date',
    createdAt: 'Upload date',
    season: 'Season',
    premium: 'Premium',
  },
  viewer: {
    title: 'Photo',
    comments: 'Comments',
    newComment: 'New comment',
    addComment: 'Add',
    yourRating: 'Your rating:',
    showOnTheMap: 'Show on the map',
    openInNewWindow: 'Open in…',
    uploaded: ({ username, createdAt }) => (
      <>
        Uploaded by {username} on {createdAt}
      </>
    ),
    captured: (takenAt) => <>Captured on {takenAt}</>,
    deletePrompt: (title) =>
      title ? (
        <>
          Do you really want to delete picture <i>{title}</i>?
        </>
      ) : (
        <>Do you really want to delete this picture?</>
      ),
    deleteTitle: 'Picture deletion',
    modify: 'Modify',
    premiumOnly:
      'This photo has been made available by its author only to users with premium access.',
    noComments: 'No comments',
  },
  editForm: {
    name: 'Name',
    description: 'Description',
    takenAt: {
      datetime: 'Capture date and time',
      date: 'Capture date',
      time: 'Capture time',
    },
    location: 'Location',
    azimuth: 'Azimuth',
    tags: 'Tags',
    setLocation: 'Set the location',
  },
  uploadModal: {
    title: 'Upload photos',
    uploading: (n) => `Uploading (${n})`,
    upload: 'Upload',
    rules: `
      <p>Drop your photos here or click here to select them.</p>
      <ul>
        <li>Do not upload too small photos (thumbnails). Maximum dimensions are not limited. The maximum file size is limited to 10MB. Bigger files will be rejected.</li>
        <li>Upload only photos of landscapes or documentation pictures. Portraits and macro photos are undesirable and will be deleted without warning.</li>
        <li>Please upload only your own photos.</li>
        <li>Captions or comments that do not directly relate to the content of the uploaded photos, or contradict generally accepted principles of civilized coexistence will be removed. Violators of this rule will be warned, and in case of repeated violations, their account in the application may be canceled.</li>
        <li>By uploading the photos, you agree they will be distributed under the terms of CC BY-SA 4.0 license.</li>
        <li>The operator (Freemap.sk) hereby disclaims all liability and is not liable for direct or indirect damages resulting from publication of a photo in the gallery. The person who has uploaded the picture on the server is fully responsible for the photo.</li>
        <li>The operator reserves the right to edit the description, name, position and tags of photo, or to delete the photo if the content is inappropriate (violate these rules).</li>
        <li>The operator reserves the right to delete the account in case that the user repeatedly violates the gallery policy by publishing inappropriate content.</li>
      </ul>
    `,
    success: 'Pictures have been successfully uploaded.',
    showPreview: 'Automatically show previews (uses more CPU load and memory)',
    loadPreview: 'Load preview',
    premium: 'Make available only to users with premium access',
  },
  locationPicking: {
    title: 'Select photo location',
  },
  deletingError: ({ err }) =>
    addError(getMessages()!, 'Error deleting photo', err),
  tagsFetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching tags', err),
  pictureFetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching photo', err),
  picturesFetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching photos', err),
  savingError: ({ err }) => addError(getMessages()!, 'Error saving photo', err),
  commentAddingError: ({ err }) =>
    addError(getMessages()!, 'Error adding comment', err),
  ratingError: ({ err }) => addError(getMessages()!, 'Error rating photo', err),
  missingPositionError: 'Missing location.',
  invalidPositionError: 'Invalid location coordinates format.',
  invalidTakenAt: 'Invalid capture date and time.',
  filterModal: {
    title: 'Photo filtering',
    tag: 'Tag',
    createdAt: 'Upload date',
    takenAt: 'Capture date',
    author: 'Author',
    rating: 'Rating',
    noTags: 'no tags',
    pano: 'Panorama',
    premium: 'Premium',
  },
  noPicturesFound: 'There were no photos found on this place.',
  linkToWww: 'photo at www.freemap.sk',
  linkToImage: 'photo image file',
  allMyPhotos: {
    title: 'Access change',
    premium: 'Include all my photos in premium content',
    free: 'Make all my photos accessible to everyone',
    confirmPremium:
      'Include all your photos in premium content? Only users with premium access will be able to see them.',
    confirmFree: 'Make all your photos accessible to everyone?',
  },
};

export default en;
