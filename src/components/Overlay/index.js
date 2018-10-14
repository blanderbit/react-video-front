import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import classNames from 'classnames';
import styles from './styles.scss';

export default class Overlay extends Component {

  onClose = () => this.props.onClose()

  render() {
    const {children, active, className} = this.props;
    return (
      <div className={classNames(styles.container, !active && styles.closed, className)}>
        <div className={classNames(styles.content, !active && styles.closed)}>
          {children}
        </div>
        <div className={styles.close} onClick={this.onClose}>
          <FontAwesome name="times"/>
        </div>
      </div>
    );
  }
}
