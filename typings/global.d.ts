declare namespace NodeJS {
  interface Global {
    translations: any;
  }
}

declare var process: {
  env: {
    API_URL: string;
    NODE_ENV: string;
    BROWSER: string;
    DEPLOYMENT: string;
    MAX_GPX_TRACK_SIZE_IN_MB: number;
    MAPQUEST_API_KEY: string;
    GA_TRACKING_CODE: string;
  };
};
