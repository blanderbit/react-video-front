import React, {Component} from 'react';
import {isNumber} from 'lodash-es';
import Swipeable from 'react-swipeable';
import classNames from 'classnames';
import styles from './styles.scss';

export default class Range extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      dragging: null,
      width: 1,
      startOffset: 0,
      stopOffset: 0
    };
  }

  componentDidMount() {
    this.setState({width: this.ref.current.offsetWidth});
  }

  clearOffsets = () => this.setState({startOffset: 0, stopOffset: 0})

  swiping = index => (e, deltaX) => {
    index === 0
      ? this.setState({startOffset: deltaX})
      : this.setState({stopOffset: deltaX});
  }

  onChange = index => (e, deltaX) => {
    const {value: [start, stop], limits: [min, max]} = this.props;
    const {width} = this.state;
    const adjustedDeltaX = deltaX / width * max;

    if (index === 0 && start - adjustedDeltaX < min) {
      this.props.onChange([min, stop]);
    } else if (index === 1 && stop - adjustedDeltaX > max) {
      this.props.onChange([start, max]);
    } else if (index === 0) {
      this.props.onChange([start - adjustedDeltaX, stop]);
    } else if (index === 1) {
      this.props.onChange([start, stop - adjustedDeltaX]);
    }

    this.clearOffsets();

  }

  render() {
    const {value: [start, stop], limits: [min, max]} = this.props;
    const {width, startOffset, stopOffset} = this.state;
    console.log('max', max);
    console.log(start, stop);
    return (
      <div ref={this.ref} className={styles.container}>
        <div className={styles.timestamps}>
          <div>{start.toFixed(2)}s</div>
          <div>{stop.toFixed(2)}s</div>
        </div>
        <div className={styles.wrapper}>
          <div
            className={styles.selection}
            style={{
              width: `${(stop - start) / max * width}px`,
              transform: `translateX(${start / max * width}px)`
            }}
          />
          <Swipeable
            trackMouse
            className={classNames(styles.ball, styles.left)}
            onSwiping={this.swiping(0)}
            onSwiped={this.onChange(0)}
            style={{transform: `translateX(${(start / max * width) - startOffset}px)`}}

          />
          <Swipeable
            trackMouse
            className={classNames(styles.ball, styles.right)}
            onSwiping={this.swiping(1)}
            onSwiped={this.onChange(1)}
            style={{transform: `translateX(${(stop / max * width) - stopOffset}px)`}}

          />
        </div>
      </div>
    );
  }
}