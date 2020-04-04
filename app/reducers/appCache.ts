import { Action } from 'redux';

import { UPDATE_PROTO_PATH } from '../actions/appCache';

export default function counter(state = { paths: [] }, action: Action<string>) {
  switch (action.type) {
    case UPDATE_PROTO_PATH:
      return { ...state, paths: [...action.paths, ...state.paths] };
    default:
      return state;
  }
}
