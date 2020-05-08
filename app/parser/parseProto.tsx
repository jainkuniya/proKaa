import Protobuf, { Root, Namespace, Type, Enum } from 'protobufjs';

const findMessagesInProto = (tree: Root | Protobuf.ReflectionObject) => {
  if (tree instanceof Root) {
    let packages = [];
    Object.keys(tree.nestedArray).forEach((index: string) => {
      packages = [
        ...packages,
        ...findMessagesInProto(tree.nestedArray[parseInt(index, 10)])
      ];
    });
    return packages;
  }
  if (tree instanceof Type) {
    let messages = [];
    // look for nested messages
    Object.keys(tree.nestedArray).forEach((index: string) => {
      messages = [
        ...messages,
        ...findMessagesInProto(tree.nestedArray[parseInt(index, 10)])
      ];
    });
    return [...messages, { name: tree.name, fields: tree.fields }];
  }
  if (tree instanceof Namespace) {
    let messages = [];
    Object.keys(tree.nestedArray).forEach((index: string) => {
      const newLocal = findMessagesInProto(
        tree.nestedArray[parseInt(index, 10)]
      );
      messages = [...messages, ...newLocal];
    });
    return [{ packageName: tree.name, messages }];
  }
  if (tree instanceof Enum) {
    return [{ name: tree.name, valuesById: tree.valuesById }];
  }
  return null;
};

export default findMessagesInProto;
