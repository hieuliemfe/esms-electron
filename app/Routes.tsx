/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';

// Lazily load routes and code split with webpack
const LazyCounterPage = React.lazy(() =>
  import(/* webpackChunkName: "CounterPage" */ './containers/CounterPage')
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);

// Lazily load routes and code split with webpack
const LazyCameraPage = React.lazy(() =>
  import(/* webpackChunkName: "CameraPage" */ './containers/CameraPage')
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CameraPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCameraPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.COUNTER} component={CounterPage} />
        <Route path={routes.CAMERA} component={CameraPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
