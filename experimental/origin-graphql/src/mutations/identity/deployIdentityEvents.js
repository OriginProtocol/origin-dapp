import IdentityEvents from 'origin-contracts/build/contracts/IdentityEvents'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function deployIdentityEvents(_, { from }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(IdentityEvents.abi)
  const tx = Contract.deploy({ data: IdentityEvents.bytecode }).send({
    gas: 5500000,
    from
  })

  return txHelper({
    tx,
    from,
    mutation: 'deployIdentityEvents',
    onReceipt: receipt => {
      Contract.options.address = receipt.contractAddress
      window.localStorage.identityEventsContract = receipt.contractAddress
      contracts.identityEvents = Contract
      contracts.identityEventsExec = Contract
    }
  })
}

export default deployIdentityEvents
