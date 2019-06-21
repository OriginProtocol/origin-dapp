'use strict'

import React, { Component } from 'react'
import { DeviceEventEmitter, Text } from 'react-native'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'

class NoInternetError extends Component {
  state = { loading: false }

  render() {
    return (
      <>
        <Text style={styles.errorText}>
          <fbt desc="NoInternetError.errorText">
            An error occurred loading the Origin Marketplace. Please check your
            internet connection.
          </fbt>
        </Text>
        <OriginButton
          size="large"
          type="white"
          style={styles.button}
          textStyle={{ fontSize: 18, fontWeight: '900' }}
          title={fbt('Retry', 'NoInternetError.retryButton')}
          onPress={() => {
            this.setState({ loading: true })
            DeviceEventEmitter.emit('reloadMarketplace')
            // Simulate a load to prevent instant flash
            setTimeout(() => {
              this.setState({ loading: false })
            }, 5000)
          }}
          loading={this.state.loading}
        />
      </>
    )
  }
}

const styles = {
  button: {
    marginTop: 30,
    marginHorizontal: 50
  },
  errorText: {
    width: '80%',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 30
  }
}

export default NoInternetError
