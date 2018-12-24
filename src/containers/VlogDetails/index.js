import React, {Component} from 'react';
import {Segment, Icon, Input} from '../../atoms';
import {Preview, ConfirmationPrompt} from '../../components';
import FontAwesome from 'react-fontawesome';
import {withRouter} from 'react-router';
import styles from './styles.scss';
import {observer, inject} from 'mobx-react';
import {assign, isEmpty, noop, head} from 'lodash-es';
import trash from '../../../assets/trash.png';
import classNames from 'classnames';

const orientations = [
  'landscape',
  'portrait',
  'square'
];

class PreviewSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedType: 'landscape'
    };
  }

  selectType = type => () => this.setState({selectedType: type})

  renderOrientation = orientation => {
    const shouldRender = this.props.renders.map(renderObj => renderObj.orientation).includes(orientation);
    return shouldRender
      ? (
        <div className={orientation === this.state.selectedType && styles.active} onClick={this.selectType(orientation)}>
          {orientation}
        </div>
      )
      : null;
  }

  renderSelector = () => (
    <div className={styles.selector}>
      {orientations.map(this.renderOrientation)}
    </div>
  )

  render() {
    const {renders} = this.props;
    const rendersObj = {
      landscape: renders.filter(({orientation}) => orientation === 'landscape'),
      portrait: renders.filter(({orientation}) => orientation === 'portrait'),
      square: renders.filter(({orientation}) => orientation === 'square')
    };
    const renderObj = head(rendersObj[this.state.selectedType]);
    return (
      <div className={styles.previewSelector}>
        {this.renderSelector()}
        {renderObj
          ? <Preview src={renderObj.exporturl} />
          : <div className={styles.warning}>No renders with this orientation</div>}
      </div>
    );
  }

}

@withRouter
@inject('overlay')
@inject('vlogEditor')
@inject('project')
@inject('session')
@observer
export default class VlogDetails extends Component {

  editVlog = () => {
    this.props.history.push('/edit-vlog');
  }

  share = () => {
    this.props.history.push('/share');
  }

  deleteProject = () => {
    this.props.project.deleteProject()
    .then(() => this.props.history.push('/home'));
  }

  download = () => window.location = this.props.project.exportUrl

  sendDownload = () => this.props.project.sendDownload()

  renderInfo = (left, right, func, disabled) =>
    <div className={classNames(styles.row, disabled && styles.disabled)} onClick={func || noop}>
      <div className={styles.left}>{left}</div>
      <div className={styles.right}>{right}</div>
    </div>

  render() {
    const {
      title, updateTitle,
      description, updateDescription,
      status, access,
      renders, shareWithTeam, setProperty
    } = this.props.project;
    const {userType} = this.props.session;
    return (
      <div className={styles.container}>
        {status === 'exported' && <PreviewSelector renders={renders} />}
        <Segment title="Details">
          <Input
            field
            name="Title"
            value={title}
            onChange={e => setProperty('title', e.target.value)}
            onBlur={updateTitle}
          />
          <Input
            field
            name="Description"
            value={description}
            onChange={e => setProperty('description', e.target.value)}
            onBlur={updateDescription}
          />
          {userType !== 'regularUser' && this.renderInfo('Shared with Team', access === 'team' ? 'Yes' : 'No')}
        </Segment>
        <Segment title="Actions">
          {this.renderInfo('Edit Vlog', <FontAwesome name="chevron-right" />, this.editVlog)}
          {userType !== 'regularUser' && this.renderInfo('Share with Team', <FontAwesome name="users" />, shareWithTeam, access === 'team')}
          {/* {this.renderInfo('Share on Social Media', <FontAwesome name="share" />, this.share, !exportUrl)} */}
          {/* {this.renderInfo('Download', <FontAwesome name="download" />, this.download, !exportUrl)} */}
          {/* {this.renderInfo('Send me a download link', <FontAwesome name="envelope" />, this.sendDownload, !exportUrl)} */}
        </Segment>
        <img
          className={styles.delete}
          src={trash}
          onClick={this.props.overlay.openOverlay(ConfirmationPrompt)({
            onSelect: this.deleteProject,
            body: 'Are you sure you want to delete this vlog?'
          })}
        />
      </div>
    );
  }
}
