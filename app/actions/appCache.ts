export const UPDATE_PROTO_PATH = 'UPDATE_PROTO_PATH';

export function updateProtoPathsAction(paths: string[]) {
  return {
    type: UPDATE_PROTO_PATH,
    paths
  };
}
