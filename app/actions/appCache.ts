export const UPDATE_PROTO_PATH = 'UPDATE_PROTO_PATH';
export const CLEAN_APP_CACHE = 'CLEAN_APP_CACHE';

export function updateProtoPathsAction(updatedProtos: Record<string, any>[]) {
  return {
    type: UPDATE_PROTO_PATH,
    updatedProtos
  };
}

export function cleanAction() {
  return {
    type: CLEAN_APP_CACHE
  };
}
