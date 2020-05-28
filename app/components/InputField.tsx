import React, { PureComponent, ChangeEvent } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { Button } from '@material-ui/core';

import styles from './Home.css';

type State = {
  value: string;
};

type Props = {
  actionText: string;
  label: string;
  initialValue: string;
  isInputDisable: boolean;
  isSubmitDisable: boolean;
  isLoading: boolean;

  onSubmit: (value: string) => void;
};

export default class InputField extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: props.initialValue
    };
  }

  onSubmit = () => {
    const { onSubmit } = this.props;
    const { value } = this.state;
    onSubmit(value);
  };

  onChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      value: event.target.value
    });
  };

  render() {
    const {
      actionText,
      label,
      isInputDisable,
      isLoading,
      isSubmitDisable,
      initialValue
    } = this.props;
    const { value } = this.state;
    const isNotActionable = isSubmitDisable && value === initialValue;
    return (
      <span className={styles.inputRow}>
        <span className={styles.label}>{label}</span>
        <input
          value={value}
          className={styles.input}
          placeholder={value}
          onChange={this.onChange}
          disabled={isInputDisable}
        />
        <Button
          className={styles.connectButton}
          type="button"
          onClick={this.onSubmit}
          style={{
            backgroundColor: '#E91E63',
            color: '#fff',
            marginLeft: '2px'
          }}
          disabled={isNotActionable}
        >
          {isLoading ? (
            <ClipLoader size={20} color="#ffffff" loading />
          ) : (
            <span>{isNotActionable ? '✓' : actionText}</span>
          )}
        </Button>
      </span>
    );
  }
}
