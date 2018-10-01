import React, {Component} from 'react';
import {isEmpty} from 'lodash-es';
import classNames from 'classnames';
import {Button} from '../../atoms';
import {Modal} from '../';
import styles from './styles.scss';
import {observer, inject} from 'mobx-react';

@inject('vlogEditor')
@inject('assets')
@observer
export default class AddBrandingElement extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentAsset: null
    };
  }

  componentWillMount() {
    this.props.assets.loadAssets();
  }

  componentDidMount() {
    !isEmpty(this.props.assets.assetList) && this.selectAsset(0);
  }

  selectAsset = i => {
    this.setState({currentAsset: i});
  }

  renderAsset = ({id, thumb, title, type}, i) => (
    <div key={id} className={classNames(styles.asset, this.state.currentAsset === i && styles.selected)} onClick={() => this.selectAsset(i)}>
      <img className={styles.thumb} src={thumb}/>
      <div className={styles.assetData}>
        <div className={styles.assetTitle}>{title}</div>
        <div className={styles.assetType}>{type}</div>
      </div>
    </div>
  )

  addAsset = () => this.props.vlogEditor.AddBrandingElement(this.props.assets.assetList[this.state.currentAsset])

  render() {
    const {assetList} = this.props.assets;
    const {closeOverlay} = this.props.vlogEditor;
    return (
      <Modal onCancel={closeOverlay} onPlace={this.addAsset}>
        {assetList.map(this.renderAsset)}
      </Modal>
    );
  }
}
