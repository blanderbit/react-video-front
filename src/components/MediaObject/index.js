import React, {Component} from 'react';
import {Icon} from '../../atoms';
import FontAwesome from 'react-fontawesome';
import {SortableHandle} from 'react-sortable-hoc';
import classNames from 'classnames';
import styles from './styles.scss';
import {observer, inject} from 'mobx-react';
import {Preview, SelectAsset, EditTitle, EditFade} from '../';
import fallback from '../../../assets/placeholder.png';
import {isEmpty} from 'lodash-es';

const formatTime = number => {
  const minutes = Math.floor(number / 60);
  const seconds = Math.floor(number % 60);
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const isFade = mediatype => ['fadein', 'fadeout', 'fadeoutin', 'crossfade'].includes(mediatype);

const DragHandle = SortableHandle(() =>
  <div className={styles.handle}>
    <FontAwesome name="bars" />
  </div>
);

const getOverlay = mediatype => ({
  video: Preview,
  asset: SelectAsset,
  title: EditTitle,
  fadein: EditFade,
  fadeout: EditFade,
  fadeoutin: EditFade,
  crossfade: EditFade
}[mediatype]);

@inject('overlay')
@observer
export default class MediaObject extends Component {

  getProps = mediaObj => ({
    onSave: this.props.onChange,
    ...{
      video: {video: mediaObj},
      asset: {asset: mediaObj},
      title: {title: mediaObj},
      fadein: {},
      fadeout: {},
      fadeoutin: {},
      crossfade: {}
    }[mediaObj.mediatype]
  });

  renderThumb = mediaObj => {
    const openOverlay = this.props.overlay.openOverlay(getOverlay(mediaObj.mediatype));
    const props = this.getProps(mediaObj);
    const onClick = openOverlay(props);

    if (['video', 'asset'].includes(mediaObj.mediatype)) {
      return <img className={styles.thumb} src={mediaObj.thumb} onError={e => e.target.src = fallback} onClick={onClick}/>;
    }

    if(isFade(mediaObj.mediatype)) {
      return <Icon className={styles.icon} name="fade" onClick={onClick}/>;
    }

    return <Icon className={styles.icon} name={mediaObj.mediatype} onClick={onClick}/>;
  }

  renderVideoDesc = video => (
    <div className={styles.videoDesc}>
      <div className={styles.oldDuration}>{video.duration}</div>
      <div className={styles.newDuration}>
        <Icon className={styles.icon} name="trim"/>
        <div>{formatTime(video.outpoint - video.inpoint)}</div>
      </div>
      {this.props.chronoIndex && <div className={styles.chronoIndex}>{this.props.chronoIndex}</div>}
    </div>
  )

  renderMeta = mediaObj => {
    const {mediatype, videoname, title, text, inpoint, outpoint, duration, seconds} = mediaObj;
    const chosenIcon = {
      video: 'camcorder',
      asset: 'asset',
      title: 'title',
      fadein: 'fade',
      fadeout: 'fade',
      fadeoutin: 'fade',
      crossfade: 'fade'
    }[mediatype];

    const chosenTitle = {
      video: videoname,
      asset: title,
      title: text,
      fadein: 'Fade-In',
      fadeout: 'Fade-Out',
      fadeoutin: 'Fade-Out / Fade-In',
      crossfade: 'Crossfade'
    }[mediatype];

    const chosenDesc = {
      video: <React.Fragment>
        {!isEmpty(mediaObj.overlay) && <Icon className={styles.icon} name="lowerThird"/>}
        {seconds > outpoint - inpoint ? this.renderVideoDesc(mediaObj) : duration}
      </React.Fragment>,
      asset: formatTime(duration),
      title: formatTime(duration),
      fadein: formatTime(duration),
      fadeout: formatTime(duration),
      fadeoutin: formatTime(duration),
      crossfade: formatTime(duration)
    }[mediatype];

    return (
      <div className={styles.meta}>
        <div className={styles.title}>
          <Icon className={classNames(styles.icon, styles.tiny)} name={chosenIcon}/>
          <div>{chosenTitle}</div>
        </div>
        <div className={styles.desc}>{chosenDesc}</div>
      </div>
    );
  }

  render() {
    const {value, immutable, className} = this.props;
    return (
      <div className={classNames(styles.container, className)}>
        {this.renderThumb(value)}
        {this.renderMeta(value)}
        {!immutable && <DragHandle />}
      </div>
    );
  }
}
