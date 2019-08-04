'use strict'

import React from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native'
import { withNavigation } from 'react-navigation'

class PinInput extends React.Component {
  componentDidMount() {
    this.focusListener = this.props.navigation.addListener(
      'didFocus',
      this.focus
    )
  }

  componentWillUnmount() {
    // Remove the event listener
    this.focusListener.remove()
  }

  // Workaround for Android bug of focus not popping the keyboard
  // https://github.com/facebook/react-native/issues/19366
  focus = () => {
    this.textInput.blur()
    setTimeout(() => {
      this.textInput.focus()
    }, 100)
  }

  render() {
    const placeholder = []
    for (let i = 0; i < this.props.pinLength; i++) {
      const value = this.props.value[i] ? this.props.value[i] : '-'
      placeholder.push(
        <Text style={styles.pinCodeText} key={i}>
          {value}
        </Text>
      )
    }

    return (
      <>
        <TouchableOpacity style={styles.pinCode} onPress={() => this.focus()}>
          {placeholder}
        </TouchableOpacity>
        <TextInput
          ref={ref => (this.textInput = ref)}
          autoFocus={true}
          value={this.props.value}
          keyboardType="numeric"
          pinLength={this.props.pinLength || 6}
          onChangeText={this.props.onChangeText}
          onSubmitEditing={this.props.onSubmitEditing}
          style={styles.input}
        />
      </>
    )
  }
}

export default withNavigation(PinInput)

const styles = StyleSheet.create({
  pinCode: {
    flex: -1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    width: '80%'
  },
  pinCodeText: {
    fontSize: 36,
    fontFamily: 'Lato'
  },
  input: {
    right: -1000,
    height: 0
  }
})
