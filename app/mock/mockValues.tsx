import { v4 as uuidv4 } from 'uuid';

const getMockValueFor = (fieldName: string, type: string) => {
  switch (type) {
    case 'string': {
      const fieldNameLower = fieldName.toLowerCase();

      if (fieldNameLower.startsWith('id') || fieldNameLower.endsWith('id')) {
        return uuidv4();
      }

      return 'Hello';
    }
    case 'number':
      return 10;
    case 'bool':
      return true;
    case 'int32':
      return 10;
    case 'int64':
      return 20;
    case 'uint32':
      return 100;
    case 'uint64':
      return 100;
    case 'sint32':
      return 100;
    case 'sint64':
      return 1200;
    case 'fixed32':
      return 1400;
    case 'fixed64':
      return 1500;
    case 'sfixed32':
      return 1600;
    case 'sfixed64':
      return 1700;
    case 'double':
      return 1.4;
    case 'float':
      return 1.1;
    case 'bytes':
      return Buffer.from('Hello');
    default:
      return undefined;
  }
};

export default getMockValueFor;
