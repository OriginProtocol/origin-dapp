const _growthModels = require('../models')
const _identityModels = require('origin-identity/src/models')
const db = { ..._growthModels, ..._identityModels }
const logger = require('../logger')
const Web3 = require('web3')
const enums = require('../enums')
const crypto = require('crypto')

const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545')
// TODO: have this stores somewhere in the db
const currentAgreementMessage = 'I accept the terms of growth campaign version: 1.0'

/**
 * Authenticates user's enrollment to the growth campaign
 * @param {string} referrer - Eth address of the referrer.
 * @param {Array<string>>} recipients - List of email addresses.
 */
async function authenticateEnrollment(accountId, agreementMessage, signature) {
  if (currentAgreementMessage !== agreementMessage) {
    throw new Error(`Incorrect agreementMessage. Expected: "${currentAgreementMessage}" received: "${agreementMessage}"`)
  }
  const recoveredAccountId = web3.eth.accounts.recover(agreementMessage, signature)

  if (accountId !== recoveredAccountId){
    throw new Error('Recovered and provided accounts do not match')
  }

  const participant = await db.GrowthParticipant.findOne({ where: {
    ethAddress: accountId
  }})

  if (participant !== null && participant.status === enums.GrowthParticipantStatuses.Banned) {
    throw new Error('This user is banned')
  }

  const authToken = participant === null ? crypto.randomBytes(64).toString('hex') : participant.authToken
  const participantData = {
    ethAddress: accountId,
    status: enums.GrowthParticipantStatuses.Active,
    agreementId: agreementMessage,
    // if user uses growth from 2 devices let them share the same auth token
    authToken: authToken
  }

  if (participant !== null) {
    participant.update(participantData)
  } else {
    await db.GrowthParticipant.create(participantData)
  }

  await createInviteCode(accountId)
  return authToken
}

/**
 * Fetches user's authentication status
 * @param {string} token - Growth authentication token
 *
 * returns GrowthParticipantAuthenticationStatus
 *  - Enrolled -> user participates in growth campaign
 *  - Banned -> user is banned
 *  - NotEnrolled -> user not a participant yet
 */
async function getUserAuthenticationStatus(token) {
  const growthParticipant =  await db.GrowthParticipant.findOne({ where: {
    authToken: token
  }})

  if (growthParticipant === null) {
    return enums.GrowthParticipantAuthenticationStatus.NotEnrolled
  } else if (growthParticipant.status === enums.GrowthParticipantStatuses.Banned) {
    return enums.GrowthParticipantAuthenticationStatus.Banned
  } else {
    return enums.GrowthParticipantAuthenticationStatus.Enrolled
  }
}

async function createInviteCode(accountId) {
  const existingInvite = await db.GrowthInviteCode.findOne({ where: {
    ethAddress: accountId
  }})

  if (existingInvite !== null) {
    return
  }

  await db.GrowthInviteCode.create({
    ethAddress: accountId,
    // Consists of first 6 and last 3 ether address letters
    code: `${accountId.substring(2,5)}-${accountId.substring(5,8)}-${accountId.substring(accountId.length - 3,accountId.length)}`
  })
}

module.exports = { authenticateEnrollment, getUserAuthenticationStatus }
