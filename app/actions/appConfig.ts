import {
  UPDATE_KAFKA_TOPIC,
  TOGGLE_PROTO_ENABLED,
  UPDATE_KAFKA_HOST
} from '../reducers/actionTypes';
import {
  ActionUpdateKafkaTopic,
  ActionToggleProtoEnabled,
  ActionUpdateKafkaHost
} from '../reducers/types';

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

export function updateKafkaTopicAction(
  kafkaTopic: string
): ActionUpdateKafkaTopic {
  return {
    type: UPDATE_KAFKA_TOPIC,
    kafkaTopic
  };
}
