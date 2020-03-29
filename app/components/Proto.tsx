import React, { PureComponent } from 'react';
import Protobuf from 'protobufjs';

import styles, { message } from './Proto.css';

type Item = {
  name: string;
  messages: { name: string; fields: any };
};

type State = {
  items: Item[];
};

type Props = {
  path: string;
  onMessageItemSelect: (msg: {
    name: string;
    fields: Record<string, any>;
    proto: string;
    packageName: string;
  }) => void;
};

export default class Proto extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      items: []
    };
  }

  componentDidMount() {
    this.loadProto();
  }

  setItems = (packageName: string, messages: string[]) => {
    const { items } = this.state;
    this.setState({
      items: [...items, { name: packageName, messages }]
    });
  };

  findMessages = (tree, packageName?: string) => {
    const subPackages = Object.keys(tree.nested);

    for (let i = 0; i < subPackages.length; i += 1) {
      const subPackageName = subPackages[i];
      if (!tree.nested[subPackageName].nested) {
        const messages = Object.keys(tree.nested);
        this.setItems(
          packageName,
          messages
            .filter(msgName => tree.nested[msgName].fields)
            .map(msgName => ({
              name: msgName,
              fields: tree.nested[msgName].fields
            }))
        );
        break;
      }
      let str = '';
      if (packageName) {
        str = `${packageName}.`;
      }
      this.findMessages(tree.nested[subPackageName], `${str}${subPackageName}`);
    }
  };

  loadProto = async () => {
    const { path } = this.props;
    // eslint-disable-next-line @typescript-eslint/ban-types
    const root: Object = await Protobuf.load(path);

    this.findMessages(root);
  };

  render() {
    const { items } = this.state;
    const { onMessageItemSelect, path } = this.props;
    return items.map(item => {
      return (
        <div className={styles.wrapper} key={item}>
          <span className={styles.packageName}>{item.name}</span>
          <ul>
            {item.messages.map(msg => (
              <li key={msg.name}>
                <button
                  type="button"
                  onClick={
                    () =>
                      onMessageItemSelect({
                        ...msg,
                        proto: path,
                        packageName: item.name
                      })
                    // eslint-disable-next-line react/jsx-curly-newline
                  }
                >
                  {msg.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    });
  }
}
