import getMockValueFor from './mockValues';
import { ProtoData, ProtoMessageFields, ProtoMessage } from '../reducers/types';
import ProKaaError from '../ProKaaError';

const getMsgFields = (
  msgName: string,
  packageName: string[],
  data: ProtoData[]
): ProtoMessageFields | void => {
  let currentData: (ProtoData | ProtoMessage)[] = data;
  for (let i = 0; i < packageName.length; i += 1) {
    const subPkg = packageName[i];
    const msgPackage = currentData.find(item => item.packageName === subPkg);
    if (!msgPackage || !msgPackage.messages) {
      return undefined;
    }
    currentData = msgPackage.messages;
  }
  const msgDefination = currentData.find(item => item.name === msgName);
  if (!msgDefination) {
    return undefined;
  }
  return msgDefination.fields;
};

const generateMockValue = (
  fieldName: string,
  fieldType: string,
  data: any,
  packageName: string,
  parentMsgName?: string
) => {
  let mockValue = getMockValueFor(fieldName, fieldType);
  if (!mockValue) {
    if (fieldType.includes('.')) {
      const customMsg = fieldType.split('.');
      const customMsgName = customMsg.pop();
      const customMsgPackageName = customMsg.join('.');
      mockValue = generateMockData(
        customMsgName,
        customMsgPackageName,
        data,
        packageName,
        parentMsgName
      );
    } else {
      mockValue = generateMockData(
        fieldType,
        packageName,
        data,
        packageName,
        parentMsgName
      );
    }
  }
  return mockValue;
};

const generateMockData = (
  msgName: string,
  packageName: string,
  data,
  parentPackageName: string,
  parentMsgName?: string
) => {
  const obj = {};
  let pkg = packageName.split('.').filter(str => str);
  let parentPkg = `${parentPackageName}.${packageName}`
    .split('.')
    .filter(str => str);

  let fields = getMsgFields(msgName, pkg, data);

  if (!fields) {
    fields = getMsgFields(msgName, parentPkg, data);
  }

  if (!fields && parentMsgName) {
    pkg = `${packageName}.${parentMsgName}`.split('.').filter(str => str);
    parentPkg = `${parentPackageName}.${parentMsgName}.${packageName}`
      .split('.')
      .filter(str => str);

    fields = getMsgFields(msgName, pkg, data);

    if (!fields) {
      fields = getMsgFields(msgName, parentPkg, data);
    }
  }

  if (!fields) {
    throw new ProKaaError(
      `Can not find ${msgName} while constructing ${msgName}`
    );
  }

  if (Object.keys(fields).length === 0) {
    // enum
    return 0;
  }

  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName];
    const mockValue = generateMockValue(
      fieldName,
      field.type,
      data,
      packageName,
      msgName
    );

    if (field.rule === 'repeated') {
      obj[fieldName] = [mockValue];

      if (field.keyType) {
        // map
        const typeMock = generateMockValue(
          '',
          field.keyType,
          data,
          packageName,
          msgName
        );
        obj[fieldName] = [{ [typeMock]: mockValue }];
      }
    } else {
      obj[fieldName] = mockValue;
      if (field.keyType) {
        // map
        const typeMock = generateMockValue(
          '',
          field.keyType,
          data,
          packageName,
          msgName
        );
        obj[fieldName] = {};
        obj[fieldName][typeMock] = mockValue;
      }
    }
  });
  return obj;
};

export default generateMockData;
