import React, {Component} from 'react';
import {Icon} from '../../atoms';
import FontAwesome from 'react-fontawesome';
import classNames from 'classnames';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import Swipeable from 'react-swipeable';
import styles from './styles.scss';
import {observer, inject} from 'mobx-react';
import {isEmpty} from 'lodash-es';
import placeholder from '../../../assets/vlogahead_applogo.png';

const formatTime = number => {
  const minutes = Math.floor(number / 60);
  const seconds = Math.floor(number % 60);
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

@inject('vlogEditor')
@observer
export default class Arranger extends Component {

  constructor(props) {
    super(props);
    this.state = {
      revealIndex: null,
      revealSide: null,
    };
  }

  actions = {
    trim: {
      label: 'Trim',
      icon: 'trim',
      func: this.props.vlogEditor.openTrimmer
    },
    lowerThird: {
      label: 'Overlay',
      icon: 'lowerThird',
      func: this.props.vlogEditor.openLowerThird
    },
    delete: {
      label: 'Delete',
      icon: 'trash',
      func: this.props.vlogEditor.deleteMedia
    }
  }

  mediaActionsMap = {
    video: [this.actions.trim, this.actions.lowerThird],
    fadein: [],
    fadeout: [],
    fadeoutin: [],
    crossfade: [],
    title: [],
    asset: []
  }

  generateActions = media => {
    if (this.mediaActionsMap[media.mediatype]) {
      return this.mediaActionsMap[media.mediatype];
    }
    throw new Error(`Tried to render media with mediatype ${media.mediatype}, must be one of ${Object.keys(this.mediaActionsMap)}`);
  }

  generateBody = ({thumb, videoname, duration, mediatype, trimmed, overlay, text, title, inpoint, outpoint}, index) => {
    const {openPreview} = this.props.vlogEditor;
    return ({
      video: (
        <div className={styles.itemBody}>
          <img className={styles.thumb} src={thumb} onClick={openPreview(index)} onError={e => e.target.src = placeholder}/>
          <div className={classNames(styles.stack, this.state.revealIndex === index && styles.active)}>
            <div className={styles.fileName}>{videoname}</div>
            <div className={styles.fileMeta}>
              <div className={classNames(styles.duration, trimmed && styles.strike)}>{duration}</div>
              {trimmed &&
                <div className={styles.row}>
                  <div className={styles.duration}>{formatTime(outpoint - inpoint)}</div>
                  <Icon className={styles.icon} name="trim" style={{marginLeft: '10px'}} />
                </div>}
              {!isEmpty(overlay) && <Icon className={styles.icon} name="lowerThird" />}
            </div>
          </div>
        </div>
      ),

      fadein: (
        <div className={styles.itemBody}>
          <Icon className={styles.bigIcon} name="fade" onClick={this.props.vlogEditor.openEditFade(index)} />
          <div className={classNames(styles.stack, this.state.revealIndex === index && styles.active)}>
            <div className={styles.fileName}>Fade-In</div>
            <div className={styles.fileMeta}>{`Duration: ${duration} seconds`}</div>
          </div>
        </div>
      ),

      fadeout: (
        <div className={styles.itemBody}>
          <Icon className={styles.bigIcon} name="fade" onClick={this.props.vlogEditor.openEditFade(index)} />
          <div className={classNames(styles.stack, this.state.revealIndex === index && styles.active)}>
            <div className={styles.fileName}>Fade-Out</div>
            <div className={styles.fileMeta}>{`Duration: ${duration} seconds`}</div>
          </div>
        </div>
      ),

      fadeoutin: (
        <div className={styles.itemBody}>
          <Icon className={styles.bigIcon} name="fade" onClick={this.props.vlogEditor.openEditFade(index)} />
          <div className={classNames(styles.stack, this.state.revealIndex === index && styles.active)}>
            <div className={styles.fileName}>Fade-Out / Fade-In</div>
            <div className={styles.fileMeta}>{`Duration: ${duration} seconds`}</div>
          </div>
        </div>
      ),

      crossfade: (
        <div className={styles.itemBody}>
          <Icon className={styles.bigIcon} name="fade" onClick={this.props.vlogEditor.openEditFade(index)} />
          <div className={classNames(styles.stack, this.state.revealIndex === index && styles.active)}>
            <div className={styles.fileName}>Crossfade</div>
            <div className={styles.fileMeta}>{`Duration: ${duration} seconds`}</div>
          </div>
        </div>
      ),

      title: (
        <div className={styles.itemBody}>
          <Icon className={styles.bigIcon} name="title" onClick={this.props.vlogEditor.openEditTitle(index)} />
          <div className={classNames(styles.stack, this.state.revealIndex === index && styles.active)}>
            <div className={styles.fileName}>Title</div>
            <div className={styles.fileMeta}>{text}</div>
          </div>
        </div>
      ),

      asset: (
        <div className={styles.itemBody}>
          <img className={styles.thumb} src={thumb} onClick={openPreview(index)} onError={e => e.target.src = placeholder}/>
          <div className={classNames(styles.stack, this.state.revealIndex === index && styles.active)}>
            <div className={styles.fileName}>Branding</div>
            <div className={styles.fileMeta}>{title}</div>
          </div>
        </div>
      )
    }[mediatype]);
  }

  DragHandle = SortableHandle(() => <FontAwesome className={styles.handle} name="bars" />);

  SortableItem = SortableElement(({value, revealIndex}) => (
    <div className={styles.item}>
      <Swipeable
        trackMouse
        className={styles.itemInner}
        onSwipedLeft={() => this.setReveal(revealIndex, 'left')}
        onSwipedRight={() => value.mediatype === 'video' && this.setReveal(revealIndex, 'right')}
      >
        {this.generateBody(value, revealIndex)}
      </Swipeable>
      <this.DragHandle />
    </div>
  ));

  SortableList = SortableContainer(({items}) => (
    <div className={styles.list}>
      {items.map((value, index) => (
        <div key={index} className={styles.itemContainer}>
          <div className={classNames(styles.leftActions,
            this.state.revealIndex === index
            && this.state.revealSide === 'right'
            && styles.active)}
          >{this.generateActions(value).map(this.renderAction(index))}</div>
          <this.SortableItem
            key={`item-${index}`}
            index={index}
            revealIndex={index}
            value={value} />
          <div className={classNames(styles.rightActions,
            this.state.revealIndex === index
            && this.state.revealSide === 'left'
            && styles.active)}
          >{this.renderAction(index)(this.actions.delete)}</div>
        </div>
      ))}
    </div>
  ));

  setReveal = (index, side) => {
    this.state.revealSide
      ? this.resetReveal()
      : this.setState({
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

  handleAction = (action, itemIndex) => () => {
    action.func(itemIndex);
    this.resetReveal();
  }

  renderAction = itemIndex => (action, i) =>
    <div key={i} className={styles.action} onClick={this.handleAction(action, itemIndex)}>
      <Icon name={action.icon} />
      <div>{action.label}</div>
    </div>

  render() {
    const {media, onSortEnd} = this.props.vlogEditor;
    return (
      <this.SortableList
        items={media}
        onSortEnd={onSortEnd}
        onSortStart={this.resetReveal}
        useDragHandle={true}
      />
    );
  }
}
