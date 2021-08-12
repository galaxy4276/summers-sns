import React, { ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';

const SignIn = loadable(() => import('@domain/Auth/SignIn'));
const MainPage = loadable(() => import('@domain/Main'));

function RouterSwitch(): ReactElement {
	return (
		<Switch>
			<Route path="/" component={MainPage} exact />
			<Route path="/auth" component={SignIn} />
			<Route path="/profile" />
			<Route path="/post/:id" />
		</Switch>
	);
}

export default RouterSwitch;
