import {
  TOGGLE_PROTO_ENABLED,
  UPDATE_KAFKA_HOST,
  UPDATE_KAFKA_TOPIC
} from './actionTypes';
import {
  ActionToggleProtoEnabled,
  ActionUpdateKafkaHost,
  ActionUpdateKafkaTopic
} from './types';

export default (
  state = {
    protoEnabled: false,
    kafkaHost: 'localhost:9092',
    kafkaTopic: 'topic123'
  },
  action:
    | ActionToggleProtoEnabled
    | ActionUpdateKafkaHost
    | ActionUpdateKafkaTopic
) => {
  switch (action.type) {
    case TOGGLE_PROTO_ENABLED:
      return { ...state, protoEnabled: action.enabled };
    case UPDATE_KAFKA_HOST:
      return { ...state, kafkaHost: action.kafkaHost };
    case UPDATE_KAFKA_TOPIC:
      return { ...state, kafkaTopic: action.kafkaTopic };
    default:
      return state;
  }
};
