import React, { useEffect } from 'react'
import { Query } from 'react-apollo'
import QueryError from 'components/QueryError'
import get from 'lodash/get'

import enrollmentStatusQuery from 'queries/EnrollmentStatus'
import withWallet from './withWallet'

function withEnrolmentStatus(
  WrappedComponent,
  { fetchPolicy = 'network-only', suppressErrors } = {}
) {
  let refetchStatus

  const WithEnrolmentStatus = props => {
    useEffect(() => {
      if (refetchStatus) {
        refetchStatus()
      }
    }, [props.wallet])

    return (
      <Query
        query={enrollmentStatusQuery}
        variables={{ walletAddress: props.wallet }}
        skip={!props.wallet}
        fetchPolicy={fetchPolicy}
      >
        {({ data, error, loading, networkStatus, refetch }) => {
          refetchStatus = refetch

          if (error && !suppressErrors) {
            return <QueryError error={error} query={enrollmentStatusQuery} />
          }

          const growthEnrolmentStatusLoading =
            !networkStatus || loading || networkStatus === 1

          const enrollmentStatus = get(data, 'enrollmentStatus')

          return (
            <WrappedComponent
              {...props}
              growthEnrollmentStatus={enrollmentStatus}
              growthEnrollmentStatusLoading={growthEnrolmentStatusLoading}
            />
          )
        }}
      </Query>
    )
  }
  return withWallet(WithEnrolmentStatus)
}

export default withEnrolmentStatus
