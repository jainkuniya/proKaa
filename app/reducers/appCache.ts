import { UPDATE_PROTO_PATH, CLEAN_APP_CACHE } from './actionTypes';
import { ActionCleanAppCache, ActionUpdateProtoFiles } from './types';

export default (
  state = { protos: [] },
  action: ActionCleanAppCache | ActionUpdateProtoFiles
) => {
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
};
