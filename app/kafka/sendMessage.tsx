import Protobuf, { Root } from 'protobufjs';
import ProkaaKafkaClient from './ProkaaKafkaClient';
import ProKaaError from '../ProKaaError';
import { ProKaaMessage } from '../components/types';

const sendMessage = async (
  prokaaKafkaClient: ProkaaKafkaClient,
  message: ProKaaMessage,
  key: string,
  topic: string,

  onError: (errMsg?: ProKaaError) => void,
  updateLoading: (isLoading: boolean) => void
) => {
  if (!prokaaKafkaClient) {
    onError(new ProKaaError('Can not connect to the producer'));
    return;
  }
  onError();

  let value: string | Buffer = '';

  if (typeof message.value === 'string') {
    value = message.value;
  } else {
    if (!message.name || !message.protoPath) {
      onError(new ProKaaError('Can not find proto to encode message'));
      return;
    }
    const root: Root = await Protobuf.load(message.protoPath);
    const protoMessage = root.lookupType(
      `${message.packageName}.${message.name}`
    );
    const errMsg = protoMessage.verify(message.value);
    if (errMsg) {
      onError(new ProKaaError(errMsg));
      return;
    }
    const msg = protoMessage.create(message);
    value = Buffer.from(protoMessage.encode(msg).finish());
  }

  updateLoading(true);

  try {
    await prokaaKafkaClient.sendMessage(key, topic, value);
  } catch (e) {
    onError(e);
  }

  updateLoading(false);
};

export default sendMessage;
