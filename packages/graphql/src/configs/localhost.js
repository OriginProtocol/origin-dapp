const HOST = process.env.HOST || 'localhost'

let addresses = {}
try {
  addresses = require('@origin/contracts/build/contracts.json')
} catch (e) {
  /* No local contracts */
}

const config = {
  provider: `http://${HOST}:8545`,
  providerWS: `ws://${HOST}:8545`,
  ipfsGateway: `http://${HOST}:8080`,
  ipfsRPC: `http://${HOST}:5002`,
  relayer: `http://${HOST}:5100`,
  bridge: 'https://bridge.dev.originprotocol.com',
  notifications: `http://${HOST}:3456`,
  //growth: 'http://localhost:4001',
  automine: 2000,
  attestationIssuer: '0x5be37555816d258f5e316e0f84D59335DB2400B2',
  affiliate: addresses.Affiliate,
  arbitrator: addresses.Arbitrator,
  OriginToken: addresses.OGN,
  V00_Marketplace: addresses.Marketplace,
  V00_Marketplace_Epoch: addresses.MarketplaceEpoch,
  IdentityEvents: addresses.IdentityEvents,
  IdentityEvents_Epoch: addresses.IdentityEventsEpoch,
  DaiExchange: addresses.UniswapDaiExchange,
  ProxyFactory: addresses.ProxyFactory,
  IdentityProxyImplementation: addresses.IdentityProxyImplementation,
  tokens: []
}

if (addresses.DAI) {
  config.tokens.push({
    id: addresses.DAI,
    type: 'Standard',
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    decimals: '18'
  })
}

export default config
