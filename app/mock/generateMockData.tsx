import getMockValueFor from './mockValues';

const getMsgFields = (msgName: string, packageName: string[], data) => {
  let currentData = data;
  packageName.forEach(subPkg => {
    currentData = currentData.find(item => item.packageName === subPkg)
      .messages;
  });
  return currentData.find(item => item.name === msgName).fields;
};

const generateMockValue = (
  fieldName: string,
  fieldType: string,
  data: any,
  packageName: string
) => {
  let mockValue = getMockValueFor(fieldName, fieldType);
  if (!mockValue) {
    if (fieldType.includes('.')) {
      const customMsg = fieldType.split('.');
      const customMsgName = customMsg.pop();
      const customMsgPackageName = customMsg.join('.');
      mockValue = generateMockData(customMsgName, customMsgPackageName, data);
    } else {
      mockValue = generateMockData(fieldType, packageName, data);
    }
  }
  return mockValue;
};

const generateMockData = (msgName: string, packageName: string, data) => {
  const obj = {};
  const pkg = packageName.split('.').filter(str => str);

  const fields = getMsgFields(msgName, pkg, data);

  if (!fields) {
    // enum
    return 0;
  }

  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName];
    const mockValue = generateMockValue(
      fieldName,
      field.type,
      data,
      packageName
    );

    if (field.rule === 'repeated') {
      obj[fieldName] = [mockValue];

      if (field.keyType) {
        // map
        const typeMock = generateMockValue(
          '',
          field.keyType,
          data,
          packageName
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
          packageName
        );
        obj[fieldName] = {};
        obj[fieldName][typeMock] = mockValue;
      }
    }
  });
  return obj;
};

export default generateMockData;
