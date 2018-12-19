import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {isEmpty, isNumber, noop} from 'lodash-es';
import FontAwesome from 'react-fontawesome';
import classNames from 'classnames';
import {Icon, Checkbox, Input, SwipeItem, SortableCollection, UploadButton} from '../../atoms';
import {SortableHandle} from 'react-sortable-hoc';
import {SelectAsset, EditTitle, MediaObject, SaveTemplate} from '../../components';
import {withRouter} from 'react-router';
import styles from './styles.scss';

const getOverlay = mediatype => ({
  asset: SelectAsset,
  title: EditTitle
}[mediatype]);

const DragHandle = SortableHandle(() =>
  <div className={styles.handle}>
    <FontAwesome name="bars" />
  </div>
);

@withRouter
@inject('template')
@inject('overlay')
@observer
export default class Template extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldRevealIndex: null,
      contentRevealIndex: null,
      revealSide: null
    };
  }

  addContent = index => content => this.props.template.addContent(index, content);

  setReveal = (fieldIndex, contentIndex) => side => () => this.setState(
    isNumber(contentIndex)
      ? {fieldRevealIndex: fieldIndex, contentRevealIndex: contentIndex, revealSide: side}
      : {fieldRevealIndex: fieldIndex, revealSide: side}
  )

  resetReveal = () => {
    this.setState({
      fieldRevealIndex: null,
      contentRevealIndex: null,
      revealSide: null
    });
  }

  isRevealed = (fieldIndex, contentIndex) => (
    fieldIndex === this.state.fieldRevealIndex && contentIndex === this.state.contentRevealIndex
  )

  getSwipeActions = (fieldIndex, contentIndex) => ({
    right: [
      {
        label: <div className={styles.swipeAction}><Icon name="trash" />Delete</div>,
        func: this.props.template.deleteContent(fieldIndex, contentIndex)
      }
    ]
  })

  renderAddButton = (mediatype, fieldIndex, fixed) => (
    <div
      className={classNames(styles.addButton, fixed && styles.disabled)}
      onClick={fixed ? noop : this.props.overlay.openOverlay(getOverlay(mediatype))({onSave: this.addContent(fieldIndex)})}
    >
      <FontAwesome className={styles.icon} name="plus" />
    </div>
  )

  renderAddContent = ({type, fixed}, fieldIndex) => {
    const {projectId} = this.props.template;
    if (type === 'video') {
      return <UploadButton projectId={projectId} onChange={this.addContent(fieldIndex)}/>;
    }

    return this.renderAddButton(type, fieldIndex, fixed);
  }

  renderFieldContent = (field, fieldIndex) => (mediaObj, contentIndex) => (
    field.fixed
      ? (
        <div className={styles.fieldContent}>
          <MediaObject value={mediaObj} immutable />
        </div>
      )

      : (
        <SwipeItem
          className={styles.fieldContent}
          actions={this.getSwipeActions(fieldIndex, contentIndex)}
          afterAction={this.resetReveal}
          onSwipe={this.setReveal(fieldIndex, contentIndex)}
          reveal={this.isRevealed(fieldIndex, contentIndex) && this.state.revealSide}
        >
          <MediaObject value={mediaObj} onChange={this.props.template.replaceContent(fieldIndex, contentIndex)} />
        </SwipeItem>
      )
  )

  renderField = (field, fieldIndex) => (
    <React.Fragment>
      <div className={styles.field}>
        <Icon className={styles.icon} name={field.type} />
        <div className={styles.name}>{field.name}</div>
        {this.renderAddContent(field, fieldIndex)}
      </div>
      {!isEmpty(field.contents)
        && <SortableCollection
          items={field.contents}
          renderFunc={this.renderFieldContent(field, fieldIndex)}
          onChange={this.props.template.rearrangeContents(fieldIndex)}
        />}
    </React.Fragment>
  )

  render() {
    const {activeTemplate, isValid, next} = this.props.template;
    return (
      <div className={styles.container}>
        <div className={styles.fields}>
          {activeTemplate.map(this.renderField)}
        </div>
        <div className={classNames(styles.next, isValid() && styles.active)} onClick={next}>
          <FontAwesome name="chevron-right" />
        </div>
      </div>
    );
  }
}
