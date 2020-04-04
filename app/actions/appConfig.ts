import { GetState, Dispatch } from '../reducers/types';

export const TOGGLE_PROTO_ENABLED = 'TOGGLE_PROTO_ENABLED';

export function toggleEnableProtoAction(enabled: boolean) {
  return {
    type: TOGGLE_PROTO_ENABLED,
    enabled
  };
}

export function toggleEnableProto() {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch(toggleEnableProtoAction(!getState().protoEnabled));
  };
}
