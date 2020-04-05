import { Action } from 'redux';

import { UPDATE_PROTO_PATH, UPDATE_PROTO_MESSAGES } from '../actions/appCache';

export default function counter(
  state = { paths: [], messages: [] },
  action: Action<string>
) {
  switch (action.type) {
    case UPDATE_PROTO_PATH:
      return { ...state, paths: [...action.paths, ...state.paths] };
    case UPDATE_PROTO_MESSAGES:
      return { ...state, messages: [...state.messages, action.messages] };
    default:
      return state;
  }
}
