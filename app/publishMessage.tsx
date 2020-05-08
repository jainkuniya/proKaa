import { Producer, ProduceRequest } from 'kafka-node';
import Protobuf, { Root } from 'protobufjs';

const publishMessage = async (
  isProtoEnabled: boolean,
  message,
  key: string,
  topic: string,

  onError: (errMsg: string) => void,
  updateLoading: (isLoading: boolean) => void,
  producer?: Producer,
  messageName?: string,
  protoFilePath?: string,
  packageName?: string
) => {
  if (!producer) {
    onError('please connect to the producer');
    return;
  }
  onError('');

  let payloads: ProduceRequest[];

  if (!isProtoEnabled) {
    payloads = [{ topic, messages: message.content }];
  } else if (typeof message.content !== 'string') {
    if (!messageName || !protoFilePath) {
      onError('please select proto message');
      return;
    }
    const root: Root = await Protobuf.load(protoFilePath);
    const protoMessage = root.lookupType(`${packageName}.${messageName}`);
    const errMsg = protoMessage.verify(message.content);
    if (errMsg) {
      onError(errMsg);
      return;
    }
    const msg = protoMessage.create(message.content);
    const buffer = protoMessage.encode(msg).finish();
    payloads = [{ topic, messages: buffer, key }];
  } else {
    return;
  }

  updateLoading(true);

  producer.send(payloads, err => {
    updateLoading(false);
    if (err) {
      onError(err);
    }
  });
};

export default publishMessage;
