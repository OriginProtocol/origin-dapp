import React, { useEffect, memo } from 'react'

const TelegramLoginButton = ({ redirectURL, buttonText, className }) => {
  let rootEl

  useEffect(() => {
    const script = document.createElement('script')
    script.async = true
    script.setAttribute('src', 'https://telegram.org/js/telegram-widget.js?7')
    script.setAttribute(
      'data-telegram-login',
      process.env.TELEGRAM_BOT_USERNAME
    )
    script.setAttribute('data-auth-url', redirectURL)
    script.setAttribute('data-userpic', false)
    script.setAttribute('data-size', 'large')

    rootEl.appendChild(script)
  }, [redirectURL])

  return (
    <div ref={el => (rootEl = el)} className="telegram-login-button">
      <button className={className}>{buttonText}</button>
    </div>
  )
}

export default memo(TelegramLoginButton)

require('react-styl')(`
  .telegram-login-button
    position: relative
    max-width: 226px
    max-height: 40px
    button.btn
      max-width: 226px
      max-height: 40px
      padding: 0.375rem 2rem
      & + iframe
        z-index: 10000
        position: absolute
        left: 0
        right: 0
        bottom: 0
        top: 0
        opacity: 0
`)
