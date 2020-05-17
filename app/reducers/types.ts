import { Dispatch as ReduxDispatch, Store as ReduxStore, Action } from 'redux';
import { Field, MapField } from 'protobufjs';
import {
  UPDATE_KAFKA_TOPIC,
  UPDATE_KAFKA_HOST,
  UPDATE_PROTO_PATH,
  CLEAN_APP_CACHE,
  TOGGLE_PROTO_ENABLED
} from './actionTypes';

export type ProtoMessageFields = { [string]: Field | MapField };

export type ProtoMessage = {
  name: string;
  fields?: ProtoMessageFields; // present in messages
  valuesById?: Map<number, string>; // present in enums
};

export type ProtoData = {
  packageName: string;
  messages: (ProtoMessage | ProtoData)[];
};

export type ProtoFile = {
  filepath: string;
  data: ProtoData[];
};

export type GlobalState = {
  appCache: { protos: ProtoFile[] };
  appConfig: { protoEnabled: boolean; kafkaHost: string; kafkaTopic: string };
};

export type ActionUpdateProtoFiles = {
  type: typeof UPDATE_PROTO_PATH;
  updatedProtos: ProtoFile[];
};

export type ActionCleanAppCache = {
  type: typeof CLEAN_APP_CACHE;
};

export type ActionToggleProtoEnabled = {
  type: typeof TOGGLE_PROTO_ENABLED;
  enabled: boolean;
};

export type ActionUpdateKafkaHost = {
  type: typeof UPDATE_KAFKA_HOST;
  kafkaHost: string;
};

export type ActionUpdateKafkaTopic = {
  type: typeof UPDATE_KAFKA_TOPIC;
  kafkaTopic: string;
};

type ReduxActions =
  | ActionUpdateProtoFiles
  | ActionCleanAppCache
  | ActionToggleProtoEnabled
  | ActionUpdateKafkaHost
  | ActionUpdateKafkaTopic;

export type GetState = () => GlobalState;

export type Dispatch = ReduxDispatch<ReduxActions>;

export type Store = ReduxStore<GlobalState, ReduxActions>;
