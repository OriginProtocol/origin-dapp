import React, { Component } from 'react'
import { Query } from 'react-apollo'

import gql from 'graphql-tag'

const AccountTokenBalance = gql`
  query AccountTokenBalance($account: String!, $token: String!){
    web3 {
      account(id: $account) {
        id
        token(symbol: $token) {
          id
          balance
          token {
            id
            decimals
          }
        }
      }
    }
  }
`

function tokenBalance(amount, decimals) {
  const supplyBN = web3.utils.toBN(amount)
  const decimalsBN = web3.utils.toBN(web3.utils.padRight('1', decimals + 1))
  return supplyBN.div(decimalsBN).toString()
}

class TokenBalance extends Component {
  render() {
    const { account, token } = this.props
    return (
      <Query query={AccountTokenBalance} variables={{ account, token }}>
        {({ loading, error, data }) => {
          if (loading || error) return null
          const tokenHolder = data.web3.account.token
          const decimals = tokenHolder.token.decimals
          return tokenBalance(tokenHolder.balance, decimals)
        }}
      </Query>
    )
  }
}

export default TokenBalance
