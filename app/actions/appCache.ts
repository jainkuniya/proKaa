import { UPDATE_PROTO_PATH, CLEAN_APP_CACHE } from '../reducers/actionTypes';
import {
  ActionUpdateProtoFiles,
  ActionCleanAppCache,
  ProtoFile
} from '../reducers/types';

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
