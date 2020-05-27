import {
  ProKaaConsumerState,
  ActionUpdateProtoFiles,
  ActionCleanAppCache,
  ProtoFile
} from '../reducers/types';
import {
  UPDATE_PROTO_PATH,
  CLEAN_APP_CACHE,
  TOGGLE_IS_CONSUMER_CONNECTING
} from '../reducers/actionTypes';

export function updateProtoPathsAction(
  updatedProtos: ProtoFile[]
): ActionUpdateProtoFiles {
  return {
    type: UPDATE_PROTO_PATH,
    updatedProtos
  };
}

export function cleanAction(): ActionCleanAppCache {
  return {
    type: CLEAN_APP_CACHE
  };
}

export function toggleIsConsumerConnectingAction(
  consumerState: ProKaaConsumerState
): ActionCleanAppCache {
  return {
    type: TOGGLE_IS_CONSUMER_CONNECTING,
    consumerState
  };
}
