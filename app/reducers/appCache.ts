import {
  ProKaaKafkaClientState,
  ActionCleanAppCache,
  ActionUpdateProtoFiles,
  ActionUpdateConsumerStatus
} from './types';
import {
  UPDATE_PROTO_PATH,
  CLEAN_APP_CACHE,
  TOGGLE_IS_CONSUMER_CONNECTING
} from './actionTypes';

export default (
  state = { protos: [], consumerState: ProKaaKafkaClientState.CONNECTING },
  action:
    | ActionCleanAppCache
    | ActionUpdateProtoFiles
    | ActionUpdateConsumerStatus
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
    case TOGGLE_IS_CONSUMER_CONNECTING: {
      return { ...state, consumerState: action.consumerState };
    }
    default:
      return state;
  }
};
