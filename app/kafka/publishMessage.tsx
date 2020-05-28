import Protobuf, { Root } from 'protobufjs';
import ProkaaKafkaClient from './ProkaaKafkaClient';
import ProKaaError from '../ProKaaError';

const publishMessage = async (
  prokaaKafkaClient: ProkaaKafkaClient,
  // eslint-disable-next-line @typescript-eslint/ban-types
  message: string | Object,
  key: string,
  topic: string,

  onError: (errMsg: ProKaaError) => void,
  updateLoading: (isLoading: boolean) => void,
  messageName?: string,
  protoFilePath?: string,
  packageName?: string
) => {
  if (!prokaaKafkaClient) {
    onError('please connect to the producer');
    return;
  }
  onError('');

  let value: string | Buffer = '';

  if (typeof message === 'string') {
    value = message;
  } else {
    if (!messageName || !protoFilePath) {
      onError('please select proto message');
      return;
    }
    const root: Root = await Protobuf.load(protoFilePath);
    const protoMessage = root.lookupType(`${packageName}.${messageName}`);
    const errMsg = protoMessage.verify(message);
    if (errMsg) {
      onError(errMsg);
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

export default publishMessage;
