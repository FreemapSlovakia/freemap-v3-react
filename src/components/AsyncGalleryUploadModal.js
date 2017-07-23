import { asyncComponent } from 'react-async-component';

export default asyncComponent({
  resolve: () => import(/* webpackChunkName: "galleryUploadModal" */ 'fm3/components/GalleryUploadModal'),
  // LoadingComponent: ({ productId }) => <div>Loading {productId}</div>, // Optional
  // ErrorComponent: ({ error }) => <div>{error.message}</div> // Optional
});
