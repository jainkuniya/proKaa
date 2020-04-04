export const TOGGLE_PROTO_ENABLED = 'TOGGLE_PROTO_ENABLED';

export function toggleEnableProtoAction(enabled: boolean) {
  return {
    type: TOGGLE_PROTO_ENABLED,
    enabled
  };
}
