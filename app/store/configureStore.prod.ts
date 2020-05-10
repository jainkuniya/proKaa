import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import createRootReducer from '../reducers';
import { Store, GlobalState } from '../reducers/types';

const history = createHashHistory();
const rootReducer = createRootReducer(history);
const enhancer = applyMiddleware(thunk);

function configureStore(initialState?: GlobalState): Store {
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };
