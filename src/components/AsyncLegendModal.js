import { asyncComponent } from 'react-async-component';

export default asyncComponent({
  resolve: () => import(/* webpackChunkName: "legendModal" */ 'fm3/components/LegendModal'),
  // LoadingComponent: ({ productId }) => <div>Loading {productId}</div>, // Optional
  // ErrorComponent: ({ error }) => <div>{error.message}</div> // Optional
});
