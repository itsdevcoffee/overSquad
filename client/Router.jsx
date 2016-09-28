import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Layout from './modules/shared/Layout.jsx';
import Home from './modules/home/home.jsx';
import Hero from './modules/hero/Hero.jsx';

const rootRoute = (
  <Router history={browserHistory}>
      <Route path='/' component={Layout}>
          <IndexRoute component={Home} />
          <Route path='heros/:heroName' component={Hero} />
      </Route>
  </Router>
);

render(
	rootRoute,
	document.getElementById('app')
);
