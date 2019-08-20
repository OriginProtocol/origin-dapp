import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import get from 'lodash.get'

import { addAccount } from '@/actions/account'
import {
  getError as getAccountsError,
  getIsAdding as getAccountIsAdding
} from '@/reducers/account'
import { addTransfer } from '@/actions/transfer'
import {
  getError as getTransfersError,
  getIsAdding as getTransferIsAdding
} from '@/reducers/transfer'
import { formInput, formFeedback } from '@/utils/formHelpers'
import { unlockDate } from '@/constants'
import BorderedCard from '@/components/BorderedCard'
import Modal from '@/components/Modal'
import ExportIcon from '@/assets/export-icon.svg'
import ClockIcon from '@/assets/clock-icon.svg'

class BalanceCard extends Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState()
  }

  componentDidUpdate(prevProps) {
    // Parse server errors for account add
    if (get(prevProps, 'accountsError') !== this.props.accountsError) {
      this.handleErrors(this.props.accountsError)
    }
    // Parse server errors for transfer add
    if (get(prevProps, 'transfersError') !== this.props.transfersError) {
      this.handleServerError(this.props.transfersError)
    }
  }

  handleServerError(error) {
    if (error && error.status === 422) {
      // Parse validation errors from API
      if (error.response.body && error.response.body.errors) {
        error.response.body.errors.forEach(e => {
          this.setState({ [`${e.param}Error`]: e.msg })
        })
      } else {
        console.error(error.response.body)
      }
    }
  }

  getInitialState = () => {
    const initialState = {
      address:
        this.props.accounts.length > 0 ? this.props.accounts[0].address : '',
      addressError: null,
      amount: '',
      amountError: null,
      displayModal: false,
      modalAddAccount: this.props.accounts.length === 0,
      modalState: 'Disclaimer',
      nickname: '',
      nicknameError: null
    }
    return initialState
  }

  handleTransfer = event => {
    event.preventDefault()
    if (this.state.modalAddAccount) {
      // Add account before processing request
      this.props.addAccount({
        nickname: this.state.nickname,
        address: this.state.address
      })
    }

    // Do the transfer
    this.props.addTransfer({
      amount: this.state.amount,
      address: this.state.address
    })
  }

  handleModalClose = () => {
    // Reset the state of the modal back to defaults
    this.setState(this.getInitialState())
  }

  handleAddAccount = () => {
    this.setState({
      ...this.getInitialState(),
      address: '',
      amount: this.state.amount,
      displayModal: true,
      modalAddAccount: !this.state.modalAddAccount,
      modalState: this.state.modalState
    })
  }

  handleChooseAccount = () => {
    this.setState({
      ...this.getInitialState(),
      amount: this.state.amount,
      displayModal: true,
      modalAddAccount: !this.state.modalAddAccount,
      modalState: this.state.modalState
    })
  }

  isAdding = () => {
    return this.props.accountIsAdding || this.props.transferIsAdding
  }

  render() {
    return (
      <>
        {this.state.displayModal && this.renderModal()}

        <BorderedCard shadowed={true}>
          <div className="row header">
            <div className="col-8">
              <h2>Available Balance</h2>
            </div>
          </div>
          <div className="balance">
            {this.props.isLocked
              ? 0
              : Number(this.props.balance).toLocaleString()}{' '}
            <span className="ogn">OGN</span>
          </div>
          <div>
            {this.props.isLocked ? (
              <>
                Lockup Period Ends{' '}
                <img src={ClockIcon} className="ml-3 mr-1 mb-1" />{' '}
                <strong>{unlockDate.fromNow(true)}</strong>
                <div className="alert alert-warning mt-3 mb-1 small">
                  Tokens will become available for withdrawal on{' '}
                  {unlockDate.format('L')}
                </div>
              </>
            ) : (
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => this.setState({ displayModal: true })}
                disabled={
                  this.props.isLocked || Number(this.props.balance) === 0
                }
              >
                <img src={ExportIcon} className="mr-2 pb-1" />
                Withdraw
              </button>
            )}
          </div>
          {!this.props.isLocked && (
            <small>You will need an Ethereum wallet to withdraw OGN</small>
          )}
        </BorderedCard>
      </>
    )
  }

  renderModal() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <Modal appendToId="main" onClose={this.handleModalClose} closeBtn={true}>
        <h1 className="mb-2">Withdraw OGN</h1>
        {this.state.modalState === 'Disclaimer' && (
          <>
            <div className="alert alert-warning mt-4 mb-4 mx-auto">
              This transaction is not reversible and we cannot help you recover
              these funds
            </div>
            <ul className="my-4 mx-auto">
              <li className="mt-1">
                Ut non eleifend enim. Curabitur tempor tellus nunc, sit amet
                vehicula enim porttitor id.
              </li>
              <li className="mt-1">
                Nam consequat est mi, eu semper augue interdum nec.
              </li>
              <li className="mt-1">
                Duis posuere lectus velit, vitae cursus velit molestie congue.
              </li>
              <li className="mt-1">
                Aenean justo tellus, vestibulum sit amet pharetra id, ultricies
                ut neque.
              </li>
            </ul>
            <button
              className="btn btn-primary btn-lg mt-3"
              onClick={() => this.setState({ modalState: 'Form' })}
            >
              Continue
            </button>
          </>
        )}
        {this.state.modalState === 'Form' && (
          <form onSubmit={this.handleTransfer}>
            <div className="form-group">
              <label htmlFor="email">Amount of Tokens</label>
              <div className="input-group">
                <input {...input('amount')} />
                <div className="input-group-append">
                  <span className="badge badge-secondary">OGN</span>
                </div>
              </div>
              <div className={this.state.amountError ? 'input-group-fix' : ''}>
                {Feedback('amount')}
              </div>
            </div>
            {this.props.accounts.length > 0 && !this.state.modalAddAccount ? (
              <>
                <div className="form-group">
                  <label htmlFor="email">Destination Account</label>
                  <select
                    className="custom-select custom-select-lg"
                    value={this.state.address}
                    onChange={e => this.setState({ address: e.target.value })}
                  >
                    {this.props.accounts.map(account => (
                      <option key={account.address} value={account.address}>
                        {account.nickname}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <a href="#" onClick={this.handleAddAccount}>
                    Add Another Account
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="email">Destination Account</label>
                  <input {...input('address')} placeholder="0x..." />
                  {Feedback('address')}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Destination Account Nickname</label>
                  <input {...input('nickname')} />
                  {Feedback('nickname')}
                </div>
                {this.props.accounts.length > 0 && (
                  <div className="form-group">
                    <a href="#" onClick={this.handleChooseAccount}>
                      Choose Existing Account
                    </a>
                  </div>
                )}
              </>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-lg mt-5"
              disabled={this.isAdding()}
            >
              {this.isAdding() ? (
                <>
                  <span className="spinner-grow spinner-grow-sm"></span>
                  Loading...
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>
        )}
      </Modal>
    )
  }
}

const mapStateToProps = ({ account, transfer }) => {
  return {
    accountsError: getAccountsError(account),
    accountIsAdding: getAccountIsAdding(account),
    transfersError: getTransfersError(transfer),
    transferIsAdding: getTransferIsAdding(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addAccount: addAccount,
      addTransfer: addTransfer
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BalanceCard)

require('react-styl')(`
  .balance
    font-size: 40px
    font-weight: bold;
  .ogn
    font-size: 20px
    color: #007cff
  .modal
    .alert
      width: 80%
  ul
    text-align: left
    width: 90%
`)
