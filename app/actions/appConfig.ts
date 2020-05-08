import {
  ActionToggleProtoEnabled,
  ActionUpdateKafkaHost
} from '../reducers/types';
import {
  TOGGLE_PROTO_ENABLED,
  UPDATE_KAFKA_HOST
} from '../reducers/actionTypes';

export function toggleEnableProtoAction(
  enabled: boolean
): ActionToggleProtoEnabled {
  return {
    type: TOGGLE_PROTO_ENABLED,
    enabled
  };
}

export function updateKafkaHostAction(
  kafkaHost: string
): ActionUpdateKafkaHost {
  return {
    type: UPDATE_KAFKA_HOST,
    kafkaHost
  };
}
