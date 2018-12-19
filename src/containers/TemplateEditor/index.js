import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {isEmpty, isNumber} from 'lodash-es';
import FontAwesome from 'react-fontawesome';
import classNames from 'classnames';
import {Icon, Checkbox, Input, SwipeItem, SortableCollection} from '../../atoms';
import {SortableHandle} from 'react-sortable-hoc';
import {SelectAsset, EditTitle, MediaObject, SaveTemplate} from '../../components';
import {withRouter} from 'react-router';
import styles from './styles.scss';

const fieldOptions = [
  {
    type: 'video',
    icon: 'video',
  },
  {
    type: 'asset',
    icon: 'asset'
  },
  {
    type: 'title',
    icon: 'title'
  },
].map(option => ({...option, contents: []}));

const columns = [
  'type',
  'name',
  'contents',
  'fixed',
  '', //the handle
];

const DragHandle = SortableHandle(() =>
  <div className={styles.handle}>
    <FontAwesome name="bars" />
  </div>
);

class Menu extends Component {

  onSelect = option => () => {
    this.props.onSelect(option);
    this.props.onClose();
  }

  renderOption = option => (
    <div className={styles.option} onClick={this.onSelect(option)}>
      {option.type}
    </div>
  )

  render() {
    return (
      <div className={styles.menu}>
        <div className={styles.menuInner}>
          {fieldOptions.map(this.renderOption)}
        </div>
      </div>
    );
  }
}

@withRouter
@inject('templateEditor')
@inject('overlay')
@observer
export default class TemplateEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldRevealIndex: null,
      contentRevealIndex: null,
      revealSide: null
    };
  }

  addField = field => {
    this.props.templateEditor.addField(field);
  }

  updateField = (index, changes) => e => {
    if (e) {
      this.props.templateEditor.updateField(index, {[changes]: e.target.value});
    } else {
      this.props.templateEditor.updateField(index, changes);
    }
  }

  addContent = index => content => this.props.templateEditor.addContent(index, content);

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

  isRevealed = (fieldIndex, contentIndex) => isNumber(contentIndex)
    ? fieldIndex === this.state.fieldRevealIndex && contentIndex === this.state.contentRevealIndex
    : fieldIndex === this.state.fieldRevealIndex && this.state.contentRevealIndex === null;

  getFieldSwipeActions = fieldIndex => ({
    right: [
      {
        label: <div className={styles.swipeAction}><Icon name="trash" />Delete</div>,
        func: this.props.templateEditor.deleteField(fieldIndex)
      }
    ]
  })

  getContentSwipeActions = (fieldIndex, contentIndex) => ({
    right: [
      {
        label: <div className={styles.swipeAction}><Icon name="trash" />Delete</div>,
        func: this.props.templateEditor.deleteContent(fieldIndex, contentIndex)
      }
    ]
  })

  onSave = meta => this.props.templateEditor.saveTemplate(meta)
  .then(this.props.history.goBack);

  renderColumn = column => (
    <div className={styles[column]}>
      {column}
    </div>
  )

  renderAddButton = () => (
    <div className={styles.addButton}>
      <FontAwesome className={styles.icon} name="plus" />
    </div>
  )

  renderAddContent = (type, fieldIndex) => ({
    asset: (
      <div
        onClick={this.props.overlay.openOverlay(SelectAsset)({onSave: this.addContent(fieldIndex)})}
      >
        {this.renderAddButton()}
      </div>
    ),
    title: <div onClick={this.props.overlay.openOverlay(EditTitle)({onSave: this.addContent(fieldIndex)})}>Add...</div>,

  }[type]
  )

  renderFieldContent = fieldIndex => (mediaObj, contentIndex) => (
    <SwipeItem
      className={styles.fieldContent}
      actions={this.getContentSwipeActions(fieldIndex, contentIndex)}
      afterAction={this.resetReveal}
      onSwipe={this.setReveal(fieldIndex, contentIndex)}
      reveal={this.isRevealed(fieldIndex, contentIndex) && this.state.revealSide}
    >
      <MediaObject value={mediaObj} onChange={this.props.templateEditor.replaceContent(fieldIndex, contentIndex)} />
    </SwipeItem>
  )

  renderField = (field, fieldIndex) => (
    <React.Fragment>
      <SwipeItem
        className={styles.field}
        actions={this.getFieldSwipeActions(fieldIndex)}
        afterAction={this.resetReveal}
        onSwipe={this.setReveal(fieldIndex)}
        reveal={this.isRevealed(fieldIndex) && this.state.revealSide}
      >
        <Icon className={styles.icon} name={field.icon} />
        <Input field className={styles.name} value={field.name} placeholder="What?" onChange={this.updateField(fieldIndex, 'name')} />
        {this.renderAddContent(field.type, fieldIndex)}
        <Checkbox className={styles.fixed} value={field.fixed} onChange={this.updateField(fieldIndex, {fixed: !field.fixed})} />
        <DragHandle />
      </SwipeItem>
      {!isEmpty(field.contents)
        && <SortableCollection
          items={field.contents}
          renderFunc={this.renderFieldContent(fieldIndex)}
          onChange={this.props.templateEditor.rearrangeContents(fieldIndex)}
        />}
    </React.Fragment>
  )

  render() {
    const {template, rearrangeFields, getErrors} = this.props.templateEditor;
    const {openOverlay, closeOverlay, showToast} = this.props.overlay;
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          {columns.map(this.renderColumn)}
        </div>
        <SortableCollection items={template} renderFunc={this.renderField} onChange={rearrangeFields} />
        <div className={styles.tools}>
          <div className={styles.add} onClick={openOverlay(Menu)({onSelect: this.addField})}>
            <FontAwesome name="plus" />
          </div>
          <div
            className={classNames(styles.next, template.length > 0 && styles.active)}
            onClick={getErrors()
              ? showToast(getErrors())
              : openOverlay(SaveTemplate)({onSave: this.onSave})}
          >
            <FontAwesome name="chevron-right" />
          </div>
        </div>
      </div>
    );
  }
}
