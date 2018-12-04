import moment from 'moment'
import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { enableMessaging } from 'actions/App'
import { updateMessage } from 'actions/Message'

import Avatar from 'components/avatar'

import truncateWithCenterEllipsis, { abbreviatedName } from 'utils/stringUtils'

const imageMaxSize = process.env.IMAGE_MAX_SIZE || (2 * 1024 * 1024) // 2 MiB

class Message extends Component {
  componentDidMount() {
    const { message } = this.props

    if (message.status === 'unread') {
      this.props.updateMessage({ ...message, status: 'read' })
    }
  }

  render() {
    const {
      enableMessaging,
      message,
      messagingEnabled,
      user,
      showTime,
      mobileDevice,
      web3Account
    } = this.props
    const { created, hash } = message
    const { address, profile } = user
    const userName = abbreviatedName(user)
    const currentUser = web3Account === user.address
    const chatContent = this.renderContent()
    const correctSide = currentUser ? 'right' : 'left'
    const bubbleAlignment = currentUser ? 'justify-content-end' : 'justify-content-start'
    const bubbleColor = currentUser && 'user'

    return (
      <div className="message-section">
        {showTime && (
          <div className="timestamp text-center ml-auto">
            {moment(created).format('MMM Do h:mm a')}
          </div>
        )}
        <div className="d-flex message">
          <div className={`content-container d-flex ${bubbleAlignment}`}>
            <div className="align-self-end conversation-avatar">
              {(!mobileDevice && correctSide === 'left') && (
                <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
              )}
            </div>
            <div className={`chat-bubble tail-${correctSide} ${bubbleColor}`}>
              <div className="chat-text">
                <div className="sender">
                  {userName && <div className="name text-truncate">{userName}</div>}
                  <span className="address">{truncateWithCenterEllipsis(address)}</span>
                  <p className="chat-content">{chatContent}</p>
                </div>
              </div>
            </div>
            <div className="align-self-end conversation-avatar right">
              {(!mobileDevice && correctSide === 'right') && (
                <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
              )}
            </div>
            {!messagingEnabled &&
              hash === 'origin-welcome-message' && (
              <div className="button-container">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={enableMessaging}
                  ga-category="messaging"
                  ga-label="message_component_enable"
                >
                  <FormattedMessage
                    id={'message.enable'}
                    defaultMessage={'Enable Messaging'}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  renderContent() {
    const { content } = this.props.message
    const contentWithLineBreak = `${content}\n`
    const contentIsData = content.match(/^data:/)
    const dataIsImage = contentIsData && content.match(/^data:image/)
    const imageTooLarge = content.length > imageMaxSize

    if (!contentIsData) {
      return contentWithLineBreak
    } else if (!dataIsImage) {
      return (
        <div className="system-message">
          <FormattedMessage
            id={'message.unrecognizedData'}
            defaultMessage={'Message data cannot be rendered.'}
          />
        </div>
      )
    } else if (imageTooLarge) {
      return (
        <div className="system-message">
          <FormattedMessage
            id={'message.imageTooLarge'}
            defaultMessage={'Message image is too large to display.'}
          />
        </div>
      )
    } else {
      const fileName = content.match(/name=.+;/).slice(5, -1)
      return (
        <div className="image-container">
          <img src={content} alt={fileName} />
        </div>
      )
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    messagingEnabled: state.app.messagingEnabled,
    mobileDevice: state.app.mobileDevice,
    user:
      state.users.find(u => u.address === ownProps.message.senderAddress) || {},
    web3Account: state.wallet.address
  }
}

const mapDispatchToProps = dispatch => ({
  enableMessaging: () => dispatch(enableMessaging()),
  updateMessage: obj => dispatch(updateMessage(obj))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Message)
