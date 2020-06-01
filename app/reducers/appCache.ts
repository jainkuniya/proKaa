import generateMockData from '../mock/generateMockData';
import {
  UPDATE_ERROR,
  TOGGLE_PROTO_ENABLED,
  SIDE_BAR_ITEM_SELECT,
  UPDATE_PROTO_PATH,
  CLEAN_APP_CACHE,
  TOGGLE_IS_CONSUMER_CONNECTING,
  UPDATE_MESSAGE
} from './actionTypes';
import {
  ActionUpdateError,
  ActionToggleProtoEnabled,
  ActionSideBarItemSelect,
  ActionUpdateMessage,
  ProKaaKafkaClientState,
  ActionCleanAppCache,
  ActionUpdateProtoFiles,
  ActionUpdateConsumerStatus
} from './types';

export default (
  state = {
    protos: [],
    consumerState: ProKaaKafkaClientState.CONNECTING,
    message: { value: '' },
    error: undefined
  },
  action:
    | ActionCleanAppCache
    | ActionUpdateProtoFiles
    | ActionUpdateConsumerStatus
    | ActionUpdateMessage
    | ActionSideBarItemSelect
    | ActionToggleProtoEnabled
    | ActionUpdateError
) => {
  switch (action.type) {
    case UPDATE_PROTO_PATH: {
      return {
        ...state,
        protos: [...state.protos, ...action.updatedProtos]
      };
    }
    case TOGGLE_PROTO_ENABLED: {
      return {
        ...state,
        message: action.enabled ? { value: {} } : { value: '' }
      };
    }
    case CLEAN_APP_CACHE: {
      return { protos: [], message: { value: '' } };
    }
    case TOGGLE_IS_CONSUMER_CONNECTING: {
      return { ...state, consumerState: action.consumerState };
    }
    case UPDATE_MESSAGE: {
      return { ...state, message: action.message };
    }
    case UPDATE_ERROR: {
      return { ...state, error: action.error };
    }
    case SIDE_BAR_ITEM_SELECT: {
      const { protos } = state;
      const protoFile = protos.find(
        proto => proto.filepath === action.protoPath
      );
      if (!protoFile) {
        return state;
      }

      try {
        const mockValue = generateMockData(
          action.name,
          action.packageName,
          protoFile.data,
          action.packageName
        );

        return {
          ...state,
          message: {
            value: mockValue,
            name: action.name,
            packageName: action.packageName,
            protoPath: protoFile.filepath
          },
          error: undefined
        };
      } catch (e) {
        return { ...state, message: { value: {} }, error: e };
      }
    }
    default:
      return state;
  }
};
