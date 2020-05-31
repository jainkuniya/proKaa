import React, { PureComponent } from 'react';

import { connect } from 'react-redux';

import Alert from '@material-ui/lab/Alert';
import { GlobalState } from '../reducers/types';

import ProKaaError from '../ProKaaError';

type Props = {
  error?: ProKaaError;
};

class ErrorBar extends PureComponent<Props> {
  render() {
    const { error } = this.props;
    return error ? <Alert severity="error">{error.message}</Alert> : null;
  }
}

export default connect((state: GlobalState) => {
  return {
    error: state.appCache.error
  };
}, undefined)(ErrorBar);
