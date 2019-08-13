import React, { Component } from 'react'
import get from 'lodash/get'

import withCreatorConfig from 'hoc/withCreatorConfig'
import withCurrencies from 'hoc/withCurrencies'
import CreateListing from '../create-listing/CreateListing'
import { getStateFromListing } from 'pages/create-listing/mutations/_listingData'

class EditListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listing: getStateFromListing(props)
    }
  }

  render() {
    const listing = this.state.listing,
      currencies = this.props.currencies

    // Convert legacy listings priced in ETH to USD
    if (listing.currency === 'token-ETH') {
      listing.currency = 'fiat-USD'
      const ethCurrency = currencies.find(c => c.id === 'token-ETH')
      if (ethCurrency) {
        listing.price = String(
          Number(listing.price) * ethCurrency.priceInUSD
        ).replace(/^([0-9]+\.[0-9]{2}).*/, '$1')
        if (listing.weekendPrice) {
          listing.weekendPrice = String(
            Number(listing.weekendPrice) * ethCurrency.priceInUSD
          ).replace(/^([0-9]+\.[0-9]{2}).*/, '$1')
        }
      }
    }

    return (
      <CreateListing
        seller={get(this.props, 'listing.seller.id')}
        listing={listing}
        refetch={this.props.refetch}
      />
    )
  }
}

export default withCreatorConfig(withCurrencies(EditListing))

require('react-styl')(`
`)
