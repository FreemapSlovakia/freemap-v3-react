export type UserProfileMessages = {
  memberSince: string;
  email: string;
  photos: string;
  /** Comments the user wrote on photos. */
  comments: string;
  /** Public events the user organizes. */
  events: string;
  showPhotos: string;
  /** Opens the account settings, on one's own profile. */
  edit: string;
  /** Hint on the icon before the user's role badges. */
  roles: string;
  /** Section heading. */
  photosHeading: string;
  /** Section heading over the period-dependent photo count, rank and top 3. */
  rankingHeading: string;
  /** Place among all users by the number of uploaded photos. */
  /** Photos uploaded in the period chosen by the toggle. */
  periodPhotos: string;
  rank: string;
  /** Toggle choosing the period the uploaded photos are counted over. */
  periodAll: string;
  period90: string;
  period30: string;
  /** Countries where the user is among the top 3 by uploaded photos. */
  podiums: string;
  /** Countries the user's photos were taken in. */
  countries: string;
  /** How many times the user's photos were viewed. */
  views: string;
  /** Average rating of the user's photos by others. */
  averageRating: string;
  /** Photos the user rated. */
  ratingsGiven: string;
  osmMapperSince: string;
  osmChangesets: string;
  osmTraces: string;
  osmLastEdit: string;
  /** Labels a link to a third-party statistics site. */
  osmMoreStats: string;
};
