import React, {Component} from 'react';
import {isEmpty, clamp} from 'lodash-es';
import classNames from 'classnames';
import {Modal, Preview} from '../';
import styles from './styles.scss';
import {observer, inject} from 'mobx-react';
import {Input} from '../../atoms';

@inject('overlay')
@inject('assets')
@observer
export default class SelectAsset extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pending: true,
      currentAsset: null,
      duration: this.props.asset ? this.props.asset.duration : ''
    };
  }

  save = () => {
    this.props.onSave({
      ...this.props.assets.assetList[this.state.currentAsset],
      duration: this.state.duration
    });
    this.props.onClose();
  }

  modalActions = [
    {
      label: 'Cancel',
      func: this.props.onClose
    },
    {
      label: 'Save',
      func: this.save
    }
  ]

  componentWillMount() {
    this.props.assets.loadAssets()
    .then(() => {
      this.setState({pending: false});
      if(this.props.asset) {
        const assetIndex = this.props.assets.assetList.findIndex(asset => asset.id === this.props.asset.id);
        assetIndex >= 0 && this.selectAsset(assetIndex)();
      }
    });
  }

  componentDidMount() {
    (!this.state.currentAsset && !isEmpty(this.props.assets.assetList)) && this.selectAsset(0);
  }

  setDuration = e => (!e.target.value || parseInt(e.target.value, 10)) && this.setState({
    duration: e.target.value
      ? clamp(parseInt(e.target.value, 10), 1, 10)
      : ''
  })

  selectAsset = i => () => {
    this.setState({currentAsset: i});
  }

  renderAsset = (asset, i) => {
    const {id, thumb, title, type, src} = asset;
    return (
      <div key={id} className={classNames(styles.asset, this.state.currentAsset === i && styles.selected)} onClick={this.selectAsset(i)}>
        <img className={styles.thumb} src={thumb} onClick={this.props.overlay.openOverlay(Preview)({src, image: type === 'image'})} />
        <div className={styles.assetData}>
          <div className={styles.assetTitle}>{title}</div>
          <div className={styles.assetType}>{type}</div>
        </div>
      </div>
    );
  }

  render() {
    const {noDuration} = this.props;
    const {pending, duration} = this.state;
    const {assetList} = this.props.assets;
    return (
      <Modal actions={this.modalActions} className={styles.modal}>
        <div className={styles.content}>
          <div className={styles.assets}>
            {assetList.map(this.renderAsset)}
          </div>
          {!noDuration && <Input modal value={duration} onChange={this.setDuration} name="Duration" placeholder="(Leave blank for auto)"/>}
        </div>
        {isEmpty(assetList)
          && (pending
            ? (
              <div className={styles.empty}>
                <div>Loading your assets...</div>
              </div>
            )

            : (
              <div className={styles.empty}>
                <div>No assets found.</div>
                <div>Add assets easily through the "Customize" panel!</div>
              </div>
            )
          )
        }
      </Modal>
    );
  }
}
