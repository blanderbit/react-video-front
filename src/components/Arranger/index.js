import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import classNames from 'classnames';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import Swipeable from 'react-swipeable';
import styles from './styles';

export default class Arranger extends Component {

  constructor(props) {
    super(props);
    this.state = {
      revealIndex: null,
      revealSide: null,
    };
  }

  actions = {
    left: [
      {
        label: 'Trim',
        icon: 'cut',
        func: () => null
      },
      {
        label: 'Lower Third',
        icon: 'tag',
        func: () => null
      },
    ],
    right: [
      {
        label: 'Delete',
        icon: 'trash',
        func: this.props.onDelete
      }
    ]
  };

  itemBody = ({thumb, file, duration}, index) => (
    <div className={styles.itemBody}>
      <div className={styles.thumb} onClick={() => this.props.onThumbClick(index)} style={{background: `url(${thumb})`}}/>
      <div className={styles.stack}>
        <div className={styles.fileName}>{file}</div>
        <div className={styles.fileDuration}>{duration}</div>
      </div>
    </div>
  )

  DragHandle = SortableHandle(() => <FontAwesome className={styles.handle} name="bars"/>);

  SortableItem = SortableElement(({value, revealIndex}) => (
    <div className={styles.item}>
      <Swipeable
        trackMouse
        className={styles.itemInner}
        onSwipedLeft={() => this.setReveal(revealIndex, 'left')}
        onSwipedRight={() => this.setReveal(revealIndex, 'right')}
      >
        {this.itemBody(value, revealIndex)}
      </Swipeable>
      <this.DragHandle />
    </div>
  ));

    SortableList = SortableContainer(({items}) => (
      <div className={styles.list}>
        {items.map((value, index) => (
          <div className={styles.itemContainer}>
            <div className={classNames(styles.leftActions,
              this.state.revealIndex === index
              && this.state.revealSide === 'right'
              && styles.active)}
            >{this.actions.left.map(this.renderAction)}</div>
            <this.SortableItem
              key={`item-${index}`}
              index={index}
              revealIndex={index}
              value={value}/>
            <div className={classNames(styles.rightActions,
              this.state.revealIndex === index
              && this.state.revealSide === 'left'
              && styles.active)}
            >{this.actions.right.map(this.renderAction)}</div>
          </div>
        ))}
      </div>
    ));

  setReveal = (index, side) => {
    this.resetReveal();
    this.setState({
      revealIndex: index,
      revealSide: side
    });
  }

  resetReveal = () => {
    this.setState({
      revealIndex: null,
      revealSide: null
    });
  }

  renderAction = (action, i) => {
    console.log(action);
    return <div className={styles.action} onClick={() => action.func(i)}>
      <FontAwesome name={action.icon}/>
      <div>{action.label}</div>
    </div>;
  }

  render() {
    return (
      <this.SortableList
        items={this.props.items}
        onSortEnd={this.props.onSortEnd}
        onSortStart={this.resetReveal}
        useDragHandle={true}
      />
    );
  }
}
