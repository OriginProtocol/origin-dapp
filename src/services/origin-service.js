import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'

class OriginService {
  static instance

  submitListing(formListing, selectedSchemaType) {

    return new Promise((resolve, reject) => {

      const jsonBlob = {
        'schema': `http://localhost:3000/schemas/${selectedSchemaType.type}.json`,
        'data': formListing.formData,
      }

    	// Submit to IPFS
      ipfsService.submitListing(jsonBlob)
      .then((ipfsHash) => {
        console.log(`IPFS file created with hash: ${ipfsHash} for data:`)
        console.log(jsonBlob)

  	  	// Submit to ETH contract
        let units = 1; // TODO: Allow users to set number of units in form
  	    contractService.submitListing(ipfsHash, formListing.formData.price, units)
  	    .then((transactionReceipt) => {
          // Success!
  	    	console.log(`Submitted to ETH blockchain with transactionReceipt.tx: ${transactionReceipt.tx}`)
          resolve(transactionReceipt.tx)
  	    })
  	    .catch((error) => {
  	      console.error(error)
          reject(`ETH Failure: ${error}`)
  	    });
      })
      .catch((error) => {
        reject(`IPFS Failure: ${error}`)
      });
    });
  }

  getListing(self) {
    contractService.getListing(self.props.listingId)
    .then((listingContractObject) => {
      self.setState(listingContractObject)
        ipfsService.getListing(self.state.ipfsHash)
        .then((listingJson) => {
          self.setState(JSON.parse(listingJson).data)
        })
        .catch((error) => {
          console.error(`Error fetching IPFS info for listingId: ${self.props.listingId}`)
        })
    })
    .catch((error) => {
      console.error(`Error fetching conract info for listingId: ${self.props.listingId}`)
    })
  }
}

const originService = new OriginService()

export default originService
