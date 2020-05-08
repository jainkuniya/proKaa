import { Dispatch as ReduxDispatch, Store as ReduxStore, Action } from 'redux';
import {
  UPDATE_KAFKA_HOST,
  UPDATE_PROTO_PATH,
  CLEAN_APP_CACHE,
  TOGGLE_PROTO_ENABLED
} from './actionTypes';

export type ProtoMessageField = {};

export type ProtoMessage = {
  name: string;
  fields: ProtoMessageField[];
};

export type ProtoData = {
  packageName: string;
  messages: ProtoMessage[];
};

export type ProtoFile = {
  filepath: string;
  data: ProtoData[];
};

export type GlobalState = {
  appCache: { protos: ProtoFile[] };
  appConfig: { protoEnabled: boolean; kafkaHost?: string };
};

export type GetState = () => GlobalState;

export type Dispatch = ReduxDispatch<Action<string>>;

export type Store = ReduxStore<GlobalState, Action<string>>;

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
