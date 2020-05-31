import { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux';
import { Field, MapField } from 'protobufjs';
import { ProKaaMessage } from '../components/types';
import {
  SIDE_BAR_ITEM_SELECT,
  UPDATE_MESSAGE,
  TOGGLE_IS_CONSUMER_CONNECTING as UPDATE_CONSUMER_STATE,
  UPDATE_KAFKA_TOPIC,
  UPDATE_KAFKA_HOST,
  UPDATE_PROTO_PATH,
  CLEAN_APP_CACHE,
  TOGGLE_PROTO_ENABLED,
  UPDATE_ERROR
} from './actionTypes';
import ProKaaError from '../ProKaaError';

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

export enum ProKaaKafkaClientState {
  CONNECTED,
  CONNECTING,
  ERROR
}

export type GlobalState = {
  appCache: {
    protos: ProtoFile[];
    consumerState: ProKaaKafkaClientState;
    message: ProKaaMessage;
    error?: ProKaaError;
  };
  appConfig: { protoEnabled: boolean; kafkaHost: string; kafkaTopic: string };
};

export type ActionUpdateProtoFiles = {
  type: typeof UPDATE_PROTO_PATH;
  updatedProtos: ProtoFile[];
};

export type ActionCleanAppCache = {
  type: typeof CLEAN_APP_CACHE;
};

export type ActionUpdateConsumerStatus = {
  type: typeof UPDATE_CONSUMER_STATE;
  consumerState: ProKaaKafkaClientState;
};

export type ActionUpdateMessage = {
  type: typeof UPDATE_MESSAGE;
  message: ProKaaMessage;
};

export type ActionUpdateError = {
  type: typeof UPDATE_ERROR;
  error?: ProKaaError;
};

export type ActionSideBarItemSelect = {
  type: typeof SIDE_BAR_ITEM_SELECT;
  protoPath: string;
  packageName: string;
  name: string;
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
