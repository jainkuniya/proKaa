export const UPDATE_PROTO_PATH = 'UPDATE_PROTO_PATH';
export const UPDATE_PROTO_MESSAGES = 'UPDATE_PROTO_MESSAGES';

export function updateProtoPathsAction(paths: string[]) {
  return {
    type: UPDATE_PROTO_PATH,
    paths
  };
}

export function updateProtoMessagesAction(messages: Record<string, any>[]) {
  return {
    type: UPDATE_PROTO_MESSAGES,
    messages
  };
}
