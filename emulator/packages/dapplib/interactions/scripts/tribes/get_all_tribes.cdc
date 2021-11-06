import Tribes from "../../../contracts/Project/Tribes.cdc"

// We could technically pass in the tenantID right away, but it makes
// sense to do it through an address.

pub fun main(tenantOwner: Address): {String: String} {
    let tenantID = tenantOwner.toString()
                        .concat(".")
                        .concat(Tribes.getType().identifier)
    
    let returnedTribes: {String: String} = {}
    let allTribes = Tribes.getTenant(id: tenantID).getAllTribes()

    for tribe in allTribes.keys {
        returnedTribes[tribe] = allTribes[tribe]!.ipfsHash
    }

    return returnedTribes
}