import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import get from 'lodash.get'

import {
  calculateNextVestLocked,
  getNextVest
} from '@origin/token-transfer-server/src/shared'

import { fetchAccounts } from '@/actions/account'
import {
  getAccounts,
  getIsLoading as getAccountIsLoading
} from '@/reducers/account'
import { fetchConfig } from '@/actions/config'
import {
  getConfig,
  getIsLoading as getConfigIsLoading
} from '@/reducers/config'
import { fetchGrants } from '@/actions/grant'
import {
  getGrants,
  getIsLoading as getGrantIsLoading,
  getTotals as getGrantTotals
} from '@/reducers/grant'
import { fetchLockups } from '@/actions/lockup'
import {
  getLockups,
  getIsLoading as getLockupIsLoading,
  getTotals as getLockupTotals
} from '@/reducers/lockup'
import { fetchTransfers } from '@/actions/transfer'
import {
  getIsLoading as getTransferIsLoading,
  getWithdrawnAmount
} from '@/reducers/transfer'
import BalanceCard from '@/components/BalanceCard'
import NewsHeadlinesCard from '@/components/NewsHeadlinesCard'
import VestingCard from '@/components/VestingCard'
import GrantDetailCard from '@/components/GrantDetailCard'
import WithdrawalSummaryCard from '@/components/WithdrawalSummaryCard'
import BonusCard from '@/components/BonusCard'
import BonusModal from '@/components/BonusModal'
import BonusCta from '@/components/BonusCta'
import WithdrawModal from '@/components/WithdrawModal'
import OtcRequestModal from '@/components/OtcRequestModal'

const Dashboard = props => {
  const [displayBonusModal, setDisplayBonusModal] = useState(false)
  const [displayWithdrawModal, setDisplayWithdrawModal] = useState(false)
  const [displayOtcRequestModal, setDisplayOtcRequestModal] = useState(false)

  useEffect(() => {
    props.fetchAccounts(),
      props.fetchConfig(),
      props.fetchGrants(),
      props.fetchLockups(),
      props.fetchTransfers()
  }, [])

  if (
    props.accountIsLoading ||
    props.configIsLoading ||
    props.transferIsLoading ||
    props.grantIsLoading ||
    props.lockupIsLoading
  ) {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  const isEmployee = !!get(props.user, 'employee')

  const nextVest = getNextVest(props.grants, props.user)
  const nextVestBalanceAvailable = nextVest.amount.minus(
    props.lockupTotals.nextVestLocked
  )

  // Calculate balances
  const balanceAvailable = props.grantTotals.vestedTotal
    // Subtract any withdrawn
    .minus(props.withdrawnAmount)
    // Subtract any locked tokens
    .minus(props.lockupTotals.locked)
    // Earnings from lockups that are unlocked
    .plus(props.lockupTotals.unlockedEarnings)
    // Exclude lockups against next vest that were included in props.lockupTotals.locked
    .plus(props.lockupTotals.nextVestLocked)

  const hasLockups = props.lockups.length > 0
  const displayBonusCta = props.config.lockupsEnabled && !props.config.isLocked
  const isEarlyLockup = displayBonusModal === 'early'

  return (
    <>
      {displayBonusModal && (
        <BonusModal
          balance={isEarlyLockup ? nextVestBalanceAvailable : balanceAvailable}
          nextVest={nextVest}
          isEarlyLockup={isEarlyLockup}
          enabledUntil={props.config.earlyLockupsEnabledUntil}
          lockupBonusRate={
            isEarlyLockup
              ? props.config.earlyLockupBonusRate
              : props.config.lockupBonusRate
          }
          onModalClose={() => setDisplayBonusModal(false)}
        />
      )}
      {displayWithdrawModal && (
        <WithdrawModal
          balance={balanceAvailable}
          accounts={props.accounts}
          isLocked={props.config.isLocked}
          otcRequestEnabled={props.config.otcRequestEnabled}
          onCreateOtcRequest={() => setDisplayOtcRequestModal(true)}
          onModalClose={() => setDisplayWithdrawModal(false)}
        />
      )}
      {displayOtcRequestModal && (
        <OtcRequestModal
          onModalClose={() => setDisplayOtcRequestModal(false)}
        />
      )}

      {displayBonusCta && hasLockups && props.config.earlyLockupsEnabled && (
        <div className="row">
          <div className="col mb-4">
            <BonusCta
              enabledUntil={props.config.earlyLockupsEnabledUntil}
              nextVest={nextVest}
              lockupRate={props.config.earlyLockupBonusRate}
              fullWidth={true}
              onDisplayBonusModal={() => setDisplayBonusModal('early')}
            />
          </div>
        </div>
      )}
      <div className="row">
        <div className={`${props.config.isLocked ? 'col-12' : 'col'} mb-4`}>
          <BalanceCard
            balance={balanceAvailable}
            accounts={props.accounts}
            locked={props.lockupTotals.locked}
            lockupsEnabled={props.config.lockupsEnabled}
            isLocked={props.config.isLocked}
            unlockDate={props.config.unlockDate}
            onDisplayBonusModal={() => setDisplayBonusModal(true)}
            onDisplayWithdrawModal={() => setDisplayWithdrawModal(true)}
          />
        </div>
        {displayBonusCta && !hasLockups && (
          <div className="col mb-4">
            <BonusCta
              enabledUntil={props.config.earlyLockupsEnabledUntil}
              nextVest={nextVest}
              lockupRate={props.config.earlyLockupBonusRate}
              onDisplayBonusModal={() => setDisplayBonusModal('early')}
            />
          </div>
        )}
        {hasLockups && (
          <div className="col mb-4">
            <BonusCard
              lockups={props.lockups}
              locked={props.lockupTotals.locked}
              earnings={props.lockupTotals.earnings}
              isLocked={props.config.isLocked}
              onDisplayBonusModal={() => setDisplayBonusModal(true)}
            />
          </div>
        )}
      </div>
      <div className="row">
        <div className="col-12 col-xl-6 mb-4">
          <VestingCard
            grants={props.grants}
            user={props.user}
            vested={props.grantTotals.vestedTotal}
            unvested={props.grantTotals.unvestedTotal}
            isLocked={props.config.isLocked}
            isEmployee={isEmployee}
          />
        </div>
        <div className="col-12 col-xl-6 mb-4">
          <div>
            <WithdrawalSummaryCard
              vested={props.grantTotals.vestedTotal}
              unvested={props.grantTotals.unvestedTotal}
              isLocked={props.config.isLocked}
              withdrawnAmount={props.withdrawnAmount}
              onDisplayWithdrawModal={() => setDisplayWithdrawModal(true)}
            />
          </div>
          <div className="mt-4">
            <NewsHeadlinesCard />
          </div>
          {!isEmployee && (
            <div className="mt-4">
              <GrantDetailCard grants={props.grants} user={props.user} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const mapStateToProps = ({
  account,
  config,
  grant,
  lockup,
  transfer,
  user
}) => {
  return {
    accounts: getAccounts(account),
    accountIsLoading: getAccountIsLoading(account),
    config: getConfig(config),
    configIsLoading: getConfigIsLoading(config),
    grants: getGrants(grant),
    grantIsLoading: getGrantIsLoading(grant),
    grantTotals: getGrantTotals(user.user, grant),
    lockups: getLockups(lockup),
    lockupIsLoading: getLockupIsLoading(lockup),
    lockupTotals: getLockupTotals(lockup),
    transferIsLoading: getTransferIsLoading(transfer),
    withdrawnAmount: getWithdrawnAmount(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchAccounts: fetchAccounts,
      fetchConfig: fetchConfig,
      fetchGrants: fetchGrants,
      fetchLockups: fetchLockups,
      fetchTransfers: fetchTransfers
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
