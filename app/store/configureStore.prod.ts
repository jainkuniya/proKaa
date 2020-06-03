import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';

import createElectronStorage from 'redux-persist-electron-storage';
import { persistStore, persistReducer } from 'redux-persist';

import createRootReducer from '../reducers';
import { Store, GlobalState } from '../reducers/types';

const history = createHashHistory();
const rootReducer = createRootReducer(history);
const enhancer = applyMiddleware(thunk);

function configureStore(initialState?: GlobalState): Store {
  const persistConfig = {
    key: 'prokaa-0.6.7',
    storage: createElectronStorage()
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);

  const store = createStore(persistedReducer, initialState, enhancer);
  persistStore(store);

  return store;
}

export default { configureStore, history };
