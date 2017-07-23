import { asyncComponent } from 'react-async-component';

export default asyncComponent({
  resolve: () => import(/* webpackChunkName: "elevationChart" */ 'fm3/components/ElevationChart'),
  // LoadingComponent: ({ productId }) => <div>Loading {productId}</div>, // Optional
  // ErrorComponent: ({ error }) => <div>{error.message}</div> // Optional
});
