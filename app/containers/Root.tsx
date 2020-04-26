import React from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Store } from '../reducers/types';
import Home from '../components/Home';

type Props = {
  store: Store;
  history: History;
};

const Root = ({ store }: Props) => {
  return (
    <Provider store={store}>
      <Home />
    </Provider>
  );
};

export default hot(Root);
