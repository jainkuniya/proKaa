import { Action } from 'redux';

import { UPDATE_PROTO_PATH } from '../actions/appCache';

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
    default:
      return state;
  }
}
