/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import Home from './Home';
import Source from './Source';
import Product from "./Product"
import Expence from './Expence';
import Reports from './Reports';
import Register from './Register';
import Login from './Login';

AppRegistry.registerComponent(appName, () => Login);
