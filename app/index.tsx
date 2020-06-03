import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { configureStore, history } from './store/configureStore';

import './app.global.css';
import Root from './containers/Root';
import { ProKaaKafkaClientState, GlobalState } from './reducers/types';

const initialState: GlobalState = {
  appCache: {
    protos: [],
    error: undefined,
    message: { value: '' },
    consumerState: ProKaaKafkaClientState.CONNECTING
  },
  appConfig: {
    protoEnabled: false,
    kafkaHost: 'localhost:9092',
    kafkaTopic: 'topic123'
  }
};

const store = configureStore(initialState);
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () =>
  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  )
);
