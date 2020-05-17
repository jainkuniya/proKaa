import Protobuf, { Root, Namespace, Type, Enum, Service } from 'protobufjs';

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
    Object.keys(tree.nestedArray).forEach((index: string) => {
      const data = findMessagesInProto(tree.nestedArray[parseInt(index, 10)]);
      // console.log(tree.nestedArray[parseInt(index, 10)], data);
      if (data) {
        messages = [...messages, ...data];
      }
    });
    if (messages.length === 0) {
      return [{ name: tree.name, fields: tree.fields }];
    }
    return [
      { name: tree.name, fields: tree.fields, packageName: tree.name, messages }
    ];
  }
  if (tree instanceof Namespace) {
    let messages = [];
    Object.keys(tree.nestedArray).forEach((index: string) => {
      const subTree = tree.nestedArray[parseInt(index, 10)];
      if (!(subTree instanceof Service)) {
        const data = findMessagesInProto(subTree);
        if (data) {
          messages = [...messages, ...data];
        }
      }
    });
    return [{ packageName: tree.name, messages }];
  }
  if (tree instanceof Enum) {
    return [{ name: tree.name, valuesById: tree.valuesById, fields: [] }];
  }
  return null;
};

export default findMessagesInProto;
