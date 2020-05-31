import { ProKaaMessage } from '../components/types';
import {
  UPDATE_ERROR,
  UPDATE_MESSAGE,
  UPDATE_PROTO_PATH,
  CLEAN_APP_CACHE,
  TOGGLE_IS_CONSUMER_CONNECTING,
  SIDE_BAR_ITEM_SELECT
} from '../reducers/actionTypes';
import {
  ActionSideBarItemSelect,
  ActionUpdateMessage,
  ProKaaKafkaClientState,
  ActionUpdateProtoFiles,
  ActionCleanAppCache,
  ProtoFile,
  ActionUpdateError
} from '../reducers/types';
import ProKaaError from '../ProKaaError';

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
  consumerState: ProKaaKafkaClientState
): ActionCleanAppCache {
  return {
    type: TOGGLE_IS_CONSUMER_CONNECTING,
    consumerState
  };
}

export function updateMessageAction(
  message: ProKaaMessage
): ActionUpdateMessage {
  return {
    type: UPDATE_MESSAGE,
    message
  };
}

export function updateErrorAction(error?: ProKaaError): ActionUpdateError {
  return {
    type: UPDATE_ERROR,
    error
  };
}

export function onSideBarItemSelectAction(
  protoPath: string,
  packageName: string,
  name: string
): ActionSideBarItemSelect {
  return {
    type: SIDE_BAR_ITEM_SELECT,
    protoPath,
    packageName,
    name
  };
}
