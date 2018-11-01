import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {Carousel, Icon} from '../../atoms';
import {isEmpty} from 'lodash-es';
import {observer, inject} from 'mobx-react';
import styles from './styles.scss';
import placeholder from '../../../assets/placeholder.png';

@withRouter
@inject('vlogs')
@inject('project')
@inject('vlogEditor')
@inject('session')
@observer
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pending: true
    };
  }

  componentDidMount() {
    this.props.vlogs.loadVlogs().then(() => this.setState({pending: false}));
  }

  viewDetails = vlog => {
    this.props.project.setProject(vlog);
    this.props.history.push('/vlog-details');
  }

  renderHighlight = () => {
    const video = this.props.vlogEditor.media.filter(media => media.mediatype === 'video')[0];
    return (
      <div className={styles.center}>
        <div className={styles.highlight} onClick={() => this.props.history.push('/edit-vlog')}>
          <img
            className={styles.thumb}
            src={video.thumb}
            onError={e => e.target.src = placeholder}
          />
          <div className={styles.title}>{video.title || 'Untitled'}</div>
          <div className={styles.duration}>{video.duration}</div>
        </div>
      </div>
    );
  }

renderItem = (item, i) =>
  <div key={`${item.thumb}-${i}`} className={styles.item} onClick={() => this.viewDetails(item)}>
    <img
      className={styles.thumb}
      src={item.thumb}
      onError={e => e.target.src = placeholder}
    />
    <div className={styles.title}>{item.title || 'Untitled'}</div>
    <div className={styles.duration}>{item.duration}</div>
  </div>

render() {

  return (
    <div className={styles.container}>
      {!isEmpty(this.props.vlogEditor.media) && this.renderHighlight()}
      <div className={styles.carousels}>
        <Carousel
          title="Saved Vlogs"
          items={this.props.vlogs.list.filter(vlog => ['new', 'saved'].includes(vlog.status))}
          renderFunction={this.renderItem}
          scrollStep={310}
          onClick={this.viewDetails}
          pending={this.state.pending}
          className={styles.carousel}
        />
        <Carousel
          title="Rendered Vlogs"
          items={this.props.vlogs.list.filter(vlog => vlog.status === 'exported')}
          renderFunction={this.renderItem}
          scrollStep={310}
          onClick={this.viewDetails}
          pending={this.state.pending}
          className={styles.carousel}
        />
        <Carousel
          title="Shared Vlogs"
          items={this.props.vlogs.list.filter(vlog => vlog.access === 'team')}
          renderFunction={this.renderItem}
          scrollStep={310}
          onClick={this.viewDetails}
          pending={this.state.pending}
          className={styles.carousel}
        />
      </div>
    </div>
  );
}
}
