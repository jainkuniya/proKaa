import {
  ActionSideBarItemSelect,
  ActionToggleProtoEnabled,
  ActionUpdateKafkaHost,
  ActionUpdateKafkaTopic
} from './types';
import {
  SIDE_BAR_ITEM_SELECT,
  TOGGLE_PROTO_ENABLED,
  UPDATE_KAFKA_HOST,
  UPDATE_KAFKA_TOPIC
} from './actionTypes';

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
    | ActionSideBarItemSelect
) => {
  switch (action.type) {
    case SIDE_BAR_ITEM_SELECT:
      return { ...state, protoEnabled: true };
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
