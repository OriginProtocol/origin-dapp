import React, { Component } from 'react'
import PanelButtons from './panel-buttons'

export default class RightPanel extends Component {
  render() {
    const { currentStep={}, displayNextStep } = this.props
    const {img, heading, content, name} = currentStep
    const overviewButton = <button className='btn btn-primary' onClick={displayNextStep}>Connect a Wallet</button>
    const buttons = {
      Overview: [<button key={'first-btn'} className='btn btn-primary' onClick={displayNextStep}>Connect a Wallet</button>]
    }

    return(
      <div className="flex-column col-8 right-panel">
        <div className="text-right">
          <img src="/images/close-icon.svg" alt="close-icon" />
        </div>
        {img}
        <div>
          {heading}
          {content}
          <PanelButtons {...this.props}/>
        </div>
      </div>
    )
  }
}
