import { Action } from 'redux';

import { TOGGLE_PROTO_ENABLED, UPDATE_KAFKA_HOST } from '../actions/appConfig';

export default function counter(
  state = { protoEnabled: false },
  action: Action<string>
) {
  switch (action.type) {
    case TOGGLE_PROTO_ENABLED:
      return { ...state, protoEnabled: action.enabled };
    case UPDATE_KAFKA_HOST:
      return { ...state, kafkaHost: action.kafkaHost };
    default:
      return state;
  }
}
