'use strict'

const express = require('express')
const router = express.Router()

const logger = require('../../logger')

const { redisClient } = require('../../utils/redis')
const { subscribeToHooks } = require('../../hooks/telegram')

/**
 * To register the webhook
 */
router.get('/__init', async (req, res) => {
  try {
    await subscribeToHooks()

    return res.status(200).send({
      success: true
    })
  } catch (err) {
    logger.error(err)
    return res.status(400).send({
      success: false,
      errors: [
        `Failed to subscribe: ${err.message ? err.message : 'Check logs'}`
      ]
    })
  }
})

router.post('/', (req, res) => {
  // Use redis batch for parallelization (without atomicity)
  const redisBatch = redisClient.batch()

  let followCount = 0
  let totalFollowEvents = 0

  if (req.body.message.new_chat_members) {
    const events = req.body.message.new_chat_members
    totalFollowEvents = events.length

    events.forEach(member => {
      if (member.is_bot) {
        // Ignore bots
        return
      }

      followCount++

      const key = `telegram/follow/${member.username}`
      redisBatch.set(key, JSON.stringify(member), 'EX', 60 * 30)
      logger.debug(`Pushing telegram new member event to ${key}`)
    })
  }

  redisBatch.exec(err => {
    if (err) {
      logger.error(
        `[TELEGRAM] Failed to push ${followCount}/${totalFollowEvents} new chat member events to redis`
      )
    } else {
      logger.debug(
        `[TELEGRAM] Pushed ${followCount}/${totalFollowEvents} new chat member events to redis`
      )
    }
  })
  res.status(200).end()
})

module.exports = router
