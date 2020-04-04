import { Action } from 'redux';

import { TOGGLE_PROTO_ENABLED } from '../actions/appConfig';

export default function counter(
  state = { protoEnabled: false },
  action: Action<string>
) {
  switch (action.type) {
    case TOGGLE_PROTO_ENABLED:
      return { ...state, protoEnabled: action.enabled };
    default:
      return state;
  }
}
