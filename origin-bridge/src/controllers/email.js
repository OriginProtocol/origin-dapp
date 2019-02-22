const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()
const sendgridMail = require('@sendgrid/mail')
const { check, validationResult } = require('express-validator/check')

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const { generateSixDigitCode } = require('../utils')
const logger = require('../logger')

router.post(
  '/generate-code',
  [
    check('email')
      .not()
      .isEmpty()
      .isEmail()
      .trim()
  ],
  async (req, res) => {
    const code = generateSixDigitCode()

    // Hash the email so it doesn't get stored in the session in plain text
    const salt = bcrypt.genSaltSync(10)
    const emailHash = bcrypt.hashSync(req.body.email, salt)

    const now = new Date()
    req.session.emailAttestation = {
      emailHash: emailHash,
      code: code,
      expiry: now.setMinutes(now.getMinutes() + 30)
    }

    const email = {
      to: req.body.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Your Origin Verification Code',
      text: `Your Origin verification code is ${code}. It will expire in 30 minutes.`
    }

    try {
      await sendgridMail.send(email)
    } catch (error) {
      logger.error(`Could not send verification code via Sendgrid: ${error}`)
      return res.status(500).send({
        errors: [
          'Could not send email verification code, please try again shortly'
        ]
      })
    }

    res.end()
  }
)

router.post(
  '/verify',
  [
    check('email')
      .not()
      .isEmpty()
      .isEmail()
      .trim(),
    check('code')
      .not()
      .isEmpty()
      .trim()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: {
          [errors.array()[0].param]: errors.array()[0].msg
        }
      })
    }

    if (
      !req.session.emailAttestation ||
      !req.session.emailAttestation.emailHash
    ) {
      return res.status(400).send({
        errors: {
          email: 'No verification code was not found that email.'
        }
      })
    }

    const validHash = bcrypt.compareSync(
      req.body.email,
      req.session.emailAttestation.emailHash
    )

    if (!validHash) {
      return res.status(400).send({
        errors: {
          email: 'No verification code was not found that email.'
        }
      })
    }

    if (req.session.emailAttestation.expiry < new Date()) {
      return res.status(400).send({
        errors: {
          code: 'Verification code has expired.'
        }
      })
    }

    if (req.session.emailAttestation.code !== req.body.code) {
      return res.status(400).send({
        errors: {
          code: 'Verification code is incorrect.'
        }
      })
    }

    // Delete req.session.emailAttestation
    const attestationBody = {
      verificationMethod: {
        email: true
      },
      email: {
        verified: true
      }
    }

    const attestation = await generateAttestation(
      AttestationTypes.EMAIL,
      attestationBody,
      req.body.email,
      req.body.eth_address,
      req.ip
    )

    return res.send(attestation)
  }
)

module.exports = router
