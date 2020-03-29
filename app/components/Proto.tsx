import React, { PureComponent } from 'react';
import Protobuf from 'protobufjs';

import styles from './Proto.css';

type Item = {
  name: string;
  messages: string[];
};

type State = {
  items: Item[];
};

type Props = {
  path: string;
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
        this.setItems(packageName, messages);
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

    console.log(this.state);
  };

  render() {
    const { items } = this.state;
    return items.map(item => {
      return (
        <div key={item}>
          <span>{item.name}</span>
          <ul>
            {item.messages.map(message => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      );
    });
  }
}
