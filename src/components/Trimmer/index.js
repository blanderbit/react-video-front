import React, {Component} from 'react';
import {Button, Slider} from '../../atoms';
import styles from './styles.scss';
import {observer, inject} from 'mobx-react';

@inject('vlogEditor')
@observer
export default class Trimmer extends Component {

  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
  }

  preview = () => {
    const {startTime, endTime} = this.props.vlogEditor.trimmer;
    setTimeout(() => this.videoRef.current.pause(), (endTime - startTime) * 1000);
    this.videoRef.current.currentTime = startTime;
    this.videoRef.current.play();
  }

  initEndTime = () => this.props.vlogEditor.initEndTime(this.videoRef.current.duration);

  render() {
    const {setStartTime, setEndTime, trimVideo, currentVideo} = this.props.vlogEditor;
    const {startTime, endTime, duration} = this.props.vlogEditor.trimmer;
    return (
      <div className={styles.container}>
        <video className={styles.video} ref={this.videoRef} src={currentVideo.src} autoPlay onLoadedMetadata={this.initEndTime}/>
        <Button text="Preview" onClick={this.preview}/>
        <Slider value={startTime} onChange={setStartTime} min={0} max={duration} step={0.001} label="Start point"/>
        <Slider value={endTime} onChange={setEndTime} min={0} max={duration} step={0.001} label="End point"/>
        <Button text="Save" onClick={trimVideo}/>
      </div>
    );
  }
}