export type ProKaaMessage = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  value: string | Object;
  protoPath?: string;
  packageName?: string;
  name?: string;
};
