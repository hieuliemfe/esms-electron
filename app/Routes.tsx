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
const LazyCheckinPage = React.lazy(() =>
  import(/* webpackChunkName: "CheckinPage" */ './containers/CheckinPage')
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CheckinPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<LoadingPage />}>
    <LazyCheckinPage {...props} />
  </React.Suspense>
);

// Lazily load routes and code split with webpack
const LazyWaitingListPage = React.lazy(() =>
  import(
    /* webpackChunkName: "WaitingListPage" */ './containers/WaitingListPage'
  )
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WaitingListPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<LoadingPage />}>
    <LazyWaitingListPage {...props} />
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

// Lazily load routes and code split with webpack
const LazySessionHistoryDetailPage = React.lazy(() =>
  import(
    /* webpackChunkName: "SessionHistoryDetailPage" */ './containers/SessionHistoryDetailPage'
  )
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SessionHistoryDetailPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<LoadingPage />}>
    <LazySessionHistoryDetailPage {...props} />
  </React.Suspense>
);

// Lazily load routes and code split with webpack
const LazySessionHistoryPage = React.lazy(() =>
  import(
    /* webpackChunkName: "SessionHistoryPage" */ './containers/SessionHistoryPage'
  )
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SessionHistoryPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<LoadingPage />}>
    <LazySessionHistoryPage {...props} />
  </React.Suspense>
);

// Lazily load routes and code split with webpack
const LazyCounterPage = React.lazy(() =>
  import(/* webpackChunkName: "CounterPage" */ './containers/CounterPage')
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<LoadingPage />}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);

// Lazily load routes and code split with webpack
const LazyCameraPage = React.lazy(() =>
  import(/* webpackChunkName: "CameraPage" */ './containers/CameraPage')
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CameraPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<LoadingPage />}>
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
        <Route
          path={routes.SESSION_HISTORY_DETAIL}
          component={SessionHistoryDetailPage}
        />
        <Route path={routes.SESSION_HISTORY} component={SessionHistoryPage} />
        <Route path={routes.SESSION} component={SessionPage} />
        <Route path={routes.WAITING_LIST} component={WaitingListPage} />
        <Route path={routes.CHECKIN} component={CheckinPage} />
        <Route path={routes.LOGIN} component={LoginPage} />
      </Switch>
    </App>
  );
}
