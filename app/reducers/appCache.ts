import { Action } from 'redux';

import { UPDATE_PROTO_PATH, CLEAN_APP_CACHE } from '../actions/appCache';

export default function counter(
  state = { protos: [] },
  action: Action<string>
) {
  switch (action.type) {
    case UPDATE_PROTO_PATH: {
      return {
        ...state,
        protos: [...state.protos, ...action.updatedProtos]
      };
    }
    case CLEAN_APP_CACHE: {
      return { protos: [] };
    }
    default:
      return state;
  }
}
