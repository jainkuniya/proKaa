import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import appConfig from './appConfig';
import cache from './appCache';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    appConfig,
    appCache: cache
  });
}
