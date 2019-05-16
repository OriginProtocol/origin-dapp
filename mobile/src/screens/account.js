'use strict'

import React, { Component } from 'react'
import {
  Alert,
  Clipboard,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { connect } from 'react-redux'

import OriginButton from 'components/origin-button'
import { truncateAddress } from 'utils/user'

const ONE_MINUTE = 1000 * 60

class AccountScreen extends Component {
  constructor(props) {
    super(props)

    this.handleSetAccountActive = this.handleSetAccountActive.bind(this)
    this.handleDangerousCopy = this.handleDangerousCopy.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleSetAccountName = this.handleSetAccountName.bind(this)
  }

  static navigationOptions = {
    title: 'Account Details',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
    }
  }

  async handleDangerousCopy(privateKey) {
    Alert.alert(
      'Important!',
      'As a security precaution, the clipboard will be cleared after one minute.',
      [
        {
          text: 'Got it',
          onPress: async () => {
            await Clipboard.setString(privateKey)

            Alert.alert('Copied to clipboard!')

            setTimeout(async () => {
              const s = await Clipboard.getString()

              if (s === privateKey) {
                Clipboard.setString('')
              }
            }, ONE_MINUTE)
          }
        }
      ]
    )
  }

  handleDelete() {
    const { navigation, wallet } = this.props
    const isLastAccount = wallet.accounts.length === 1

    Alert.alert(
      'Important!',
      'Have you backed up your private key or recovery phrase for this account? ' +
        'The account will be permanently deleted and you must have the private key or recovery phrase to recover it. ' +
        'Are you sure that you want to delete this account?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: () => {
            try {
              DeviceEventEmitter.emit(
                'removeAccount',
                navigation.getParam('account')
              )
              if (isLastAccount) {
                // No accounts left, navigate back to welcome screen
                navigation.navigate('Welcome')
              } else {
                // There are still some accounts, go back to accounts list
                navigation.navigate('Accounts')
              }
            } catch (e) {
              console.error(e)
            }
          }
        }
      ]
    )
  }

  handleSetAccountActive() {
    const { navigation } = this.props
    DeviceEventEmitter.emit('setAccountActive', navigation.getParam('account'))
    navigation.goBack()
  }

  handleSetAccountName(event) {
    const { address } = this.props.navigation.getParam('account')
    const nameValue = event.nativeEvent.text
    DeviceEventEmitter.emit('setAccountName', { address, name: nameValue })
  }

  render() {
    const { navigation, wallet } = this.props
    const account = navigation.getParam('account')
    const { address, privateKey, mnemonic } = account
    const name = wallet.accountNameMapping[address]
    const multipleAccounts = wallet.accounts.length > 1
    const isActive = address === wallet.address

    return (
      <KeyboardAvoidingView style={styles.keyboardWrapper} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          style={styles.container}
        >
          <View contentContainerStyle={styles.content} style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.heading}>NAME</Text>
            </View>
            <TextInput
              placeholder={'Account name'}
              value={name}
              style={styles.input}
              onChange={this.handleSetAccountName}
              onSubmitEditing={this.handleNameUpdate}
            />
            <View style={styles.header}>
              <Text style={styles.heading}>ETH ADDRESS</Text>
            </View>
            <TextInput
              editable={false}
              value={truncateAddress(address, 14)}
              style={styles.input}
            />
          </View>
          <View style={styles.buttonsContainer}>
            {multipleAccounts && (
              <OriginButton
                size="large"
                type="primary"
                disabled={isActive}
                style={styles.button}
                textStyle={{ fontSize: 18, fontWeight: '900' }}
                title={'Make Active Account'}
                onPress={this.handleSetAccountActive}
              />
            )}
            {mnemonic !== undefined && (
              <>
                <OriginButton
                  size="large"
                  type="primary"
                  style={styles.button}
                  textStyle={{ fontSize: 18, fontWeight: '900' }}
                  title={'Show Recovery Phrase'}
                  onPress={() => Alert.alert('Recovery Phrase', mnemonic)}
                />
                <OriginButton
                  size="large"
                  type="primary"
                  style={styles.button}
                  textStyle={{ fontSize: 18, fontWeight: '900' }}
                  title={'Copy Recovery Phrase'}
                  onPress={() => this.handleDangerousCopy(mnemonic)}
                />
              </>
            )}
            {mnemonic === undefined && (
              <>
                <OriginButton
                  size="large"
                  type="primary"
                  style={styles.button}
                  textStyle={{ fontSize: 18, fontWeight: '900' }}
                  title={'Show Private Key'}
                  onPress={() => Alert.alert('Private Key', privateKey)}
                />
                <OriginButton
                  size="large"
                  type="primary"
                  style={styles.button}
                  textStyle={{ fontSize: 18, fontWeight: '900' }}
                  title={'Copy Private Key'}
                  onPress={() => this.handleDangerousCopy(privateKey)}
                />
              </>
            )}
            {(multipleAccounts || true) && (
              <OriginButton
                size="large"
                type="danger"
                disabled={isActive}
                style={styles.button}
                textStyle={{ fontSize: 18, fontWeight: '900' }}
                title={'Delete Account'}
                onPress={this.handleDelete}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1
  },
  container: {
    flex: 1
  },
  content: {
    paddingBottom: 20
  },
  button: {
    marginBottom: 10,
    marginHorizontal: 20
  },
  buttonsContainer: {
    marginBottom: 10,
    paddingTop: 20
  },
  header: {
    paddingBottom: 5,
    paddingHorizontal: 20,
    paddingTop: 30
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 13,
    opacity: 0.5
  },
  iconContainer: {
    height: 17,
    justifyContent: 'center'
  },
  image: {
    height: 24,
    width: 24
  },
  input: {
    backgroundColor: 'white',
    fontFamily: 'Lato',
    fontSize: 17,
    paddingHorizontal: 20,
    paddingVertical: '5%'
  },
  item: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: '5%'
  },
  text: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Lato'
  },
  wrapper: {
    backgroundColor: '#f7f8f8',
    flex: 1
  }
})

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(AccountScreen)
