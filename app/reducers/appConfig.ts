import { TOGGLE_PROTO_ENABLED, UPDATE_KAFKA_HOST } from './actionTypes';
import { ActionToggleProtoEnabled, ActionUpdateKafkaHost } from './types';

export default (
  state = { protoEnabled: false },
  action: ActionToggleProtoEnabled | ActionUpdateKafkaHost
) => {
  switch (action.type) {
    case TOGGLE_PROTO_ENABLED:
      return { ...state, protoEnabled: action.enabled };
    case UPDATE_KAFKA_HOST:
      return { ...state, kafkaHost: action.kafkaHost };
    default:
      return state;
  }
};
