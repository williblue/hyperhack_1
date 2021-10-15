import SimpleNFT from "../../../contracts/Project/SimpleNFT.cdc"

transaction(recipient: Address, tenant: Address, name: String) {
    let SimpleNFTTenant: &SimpleNFT.Tenant{SimpleNFT.IState}
    let SimpleNFTMinter: &SimpleNFT.NFTMinter
    let RecipientCollection: &SimpleNFT.Collection{SimpleNFT.CollectionPublic}

    prepare(signer: AuthAccount) {
        self.SimpleNFTTenant = getAccount(tenant).getCapability(SimpleNFT.getMetadata().tenantPublicPath)
                                    .borrow<&SimpleNFT.Tenant{SimpleNFT.IState}>()!

        let SignerSimpleNFTPackage = signer.borrow<&SimpleNFT.Package>(from: /storage/SimpleNFTPackage)
                                    ?? panic("Could not borrow the signer's SimpleNFT.Package.")
        self.SimpleNFTMinter = SignerSimpleNFTPackage.borrowMinter(tenantID: self.SimpleNFTTenant.id)

        let RecipientSimpleNFTPackage = getAccount(recipient).getCapability(/public/SimpleNFTPackage)
                                            .borrow<&SimpleNFT.Package{SimpleNFT.PackagePublic}>()
                                            ?? panic("Could not borrow the recipient's SimpleNFT.Package.")
        self.RecipientCollection = RecipientSimpleNFTPackage.borrowCollectionPublic(tenantID: self.SimpleNFTTenant.id)
    }

    execute {
        let nft <- self.SimpleNFTMinter.mintNFT(tenant: self.SimpleNFTTenant, name: name) 
        self.RecipientCollection.deposit(token: <-nft)
        log("Minted a SimpleNFT into the recipient's SimpleNFT Collection.")
    }
}

