/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import LoginPage from './containers/LoginPage';
import LoadingPage from './containers/LoadingPage';

// Lazily load routes and code split with webpack
const LazyHomePage = React.lazy(() =>
  import(/* webpackChunkName: "HomePage" */ './containers/HomePage')
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HomePage = (props: Record<string, any>) => (
  <React.Suspense fallback={<LoadingPage />}>
    <LazyHomePage {...props} />
  </React.Suspense>
);

// Lazily load routes and code split with webpack
const LazySessionPage = React.lazy(() =>
  import(/* webpackChunkName: "SessionPage" */ './containers/SessionPage')
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SessionPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<LoadingPage />}>
    <LazySessionPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.HOME} component={HomePage} />
        <Route path={routes.SESSION} component={SessionPage} />
        <Route path={routes.LOGIN} component={LoginPage} />
      </Switch>
    </App>
  );
}
