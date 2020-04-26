export const TOGGLE_PROTO_ENABLED = 'TOGGLE_PROTO_ENABLED';
export const UPDATE_KAFKA_HOST = 'UPDATE_KAFKA_HOST';

export function toggleEnableProtoAction(enabled: boolean) {
  return {
    type: TOGGLE_PROTO_ENABLED,
    enabled
  };
}

export function updateKafkaHostAction(kafkaHost: string) {
  return {
    type: UPDATE_KAFKA_HOST,
    kafkaHost
  };
}
