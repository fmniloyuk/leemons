import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import loadable from '@loadable/component';

const ScoresPage = loadable(() => import('@scores/components/ScoresPage'));
const PeriodsPage = loadable(() => import('@scores/pages/PeriodsPage'));

export default function Private() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/periods`}>
        <PeriodsPage />
      </Route>
      {/* <Route exact path={`${path}/`}>
        <ScoresPage />
      </Route>
      <Route exact path={`${path}/class/:class`}>
        <ScoresPage />
      </Route>
      <Route exact path={`${path}/class/:class/from/:from/to/:to`}>
        <ScoresPage />
      </Route> */}
    </Switch>
  );
}
