'use strict';
const Blockchain = require('./blockchain');
const dappConfig = require('./dapp-config.json');
const ClipboardJS = require('clipboard');
const BN = require('bn.js'); // Required for injected code
const manifest = require('../manifest.json');
const ipfsClient = require('ipfs-http-client');
const bs58 = require('bs58');
const t = require('@onflow/types');


module.exports = class DappLib {

  /****** AUTH ******/
  static async GetAuth(data) {
    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'auth_get_auth'
    )

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /****** SETUP ALL ******/
  static async SETUPALL(data) {
    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'setupall_setup_all'
    )

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  static async HasAll(data) {
    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'setupall_has_all',
      {
        account: { value: data.account, type: t.Address }
      }
    )

    return {
      type: DappLib.DAPP_RESULT_BOOLEAN,
      label: 'Has All Packages?',
      result: result.callData
    }
  }

  /****** HelloWorld ******/

  /*
    signer - account that will receive its own data
  */
  static async HelloWorldInstance(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'helloworld_instance'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    account - the account we want the Tenant ID for
  */
  static async HelloWorldGetClientTenants(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'helloworld_get_client_tenants',
      {
        account: { value: data.account, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_STRING,
      label: 'HelloWorld TenantID',
      result: result.callData
    }
  }

  /*
    tenantOwner - the owner of the Tenant you want to interact with
  */
  static async HelloWorldGreeting(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'helloworld_hello',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_STRING,
      label: 'Greeting',
      result: result.callData
    }
  }

  /****** Tribes ******/

  /*
    Do not call this function.
  */
  static async TribesGetPackage(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'tribes_get_package'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    signer - account that will receive its own data
  */
  static async TribesInstance(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'tribes_instance'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    tenantOwner - the owner of the Tenant you want to interact with
    newTribeName - the Tribe name to be created
    ipfsHash - either `N/A` (meaning no image provided) or a link to
      ipfs where the image lives
    description - a description of the Tribe
  */
  static async TribesAddTribe(data) {

    if (data.files.length > 1) {
      throw "Too many images! Please supply 1 image for your Tribe."
    }

    let image;
    if (data.files.length > 0) {
      let folder = false;
      let config = DappLib.getConfig();

      config.ipfs = {
        host: 'ipfs.infura.io',
        protocol: 'https',
        port: 5001
      }

      // Push files to IPFS
      let ipfsResult = await DappLib.ipfsUpload(config, data.files, folder, (bytes) => {
        console.log(bytes);
      });

      let file = ipfsResult[0];
      console.log('IPFS file', file);
      image = 'https://ipfs.infura.io/ipfs/' + file.cid.string;
    } else {
      image = "N/A"
    }


    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.tenantOwner
      }
    },
      'tribes_add_tribe',
      {
        newTribeName: { value: data.newTribeName, type: t.String },
        ipfsHash: { value: image, type: t.String },
        description: { value: data.description, type: t.String }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    signer - the account that is joining the Tribe
    tenantOwner - the owner of the Tenant you want to interact with
    tribeName - the name of the Tribe that `signer` wants to join
  */
  static async TribesJoinTribe(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'tribes_join_tribe',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address },
        tribeName: { value: data.tribeName, type: t.String }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    signer - the account that is leaving their Tribe
    tenantOwner - the owner of the Tenant you want to interact with
  */
  static async TribesLeaveTribe(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'tribes_leave_tribe',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    account - the account we are looking at to get their current Tribe
    tenantOwner - the owner of the Tenant you want to interact with
  */
  static async TribesGetCurrentTribe(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'tribes_get_current_tribe',
      {
        account: { value: data.account, type: t.Address },
        tenantOwner: { value: data.tenantOwner, type: t.Address }
      }
    );
    console.log(result.callData)

    return {
      type: DappLib.DAPP_RESULT_OBJECT,
      label: 'Current Tribe',
      result: result.callData
    }
  }

  /*
    tenantOwner - the owner of the Tenant you want to interact with
  */
  static async TribesGetAllTribes(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'tribes_get_all_tribes',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_OBJECT,
      label: 'All the Tribes',
      result: result.callData
    }
  }

  /*
    account - the account we want the Tenant ID for
  */
  static async TribesGetClientTenants(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'tribes_get_client_tenants',
      {
        account: { value: data.account, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_STRING,
      label: 'Tribes TenantID',
      result: result.callData
    }
  }

  /****** NFTMarketplace ******/

  /*
    Do not call this function
  */
  static async MarketplaceGetPackage(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'nftmarketplace_get_package'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    signer - account that will receive its own data
  */
  static async MarketplaceInstance(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'nftmarketplace_instance'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    signer - the account that is unlisting an NFT from their marketplace
    tenantOwner - the owner of the Tenant you want to interact with
    id - id of the NFT we'd like to unlist
  */
  static async MarketplaceUnlist(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'nftmarketplace_unlist_sale',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address },
        id: { value: parseInt(data.id), type: t.UInt64 }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    signer - the account that is listing NFTs for sale
    tenantOwner - the owner of the Tenant you want to interact with
    ids - an array of the ids `signer` wants to list (they must)
      own them
    price - the price of the NFTs (must be of type double, ex. `50.0`)
  */
  static async MarketplaceList(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'nftmarketplace_list_for_sale',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address },
        ids: DappLib.formatFlowArray(data.ids, t.UInt64),
        price: { value: data.price, type: t.UFix64 }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    signer - account purchasing the NFTs
    tenantOwner - the owner of the Tenant you want to interact with
    id - the id of the NFT to be purchased
    marketplace - the address of the person who's selling the NFTs
  */
  static async MarketplacePurchase(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'nftmarketplace_purchase',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address },
        id: { value: parseInt(data.id), type: t.UInt64 },
        marketplace: { value: data.marketplace, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    account - the account we are looking at to see their listed NFT ids
    tenantOwner - the owner of the Tenant you want to interact with
  */
  static async MarketplaceGetIDs(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'nftmarketplace_get_ids',
      {
        account: { value: data.account, type: t.Address },
        tenantOwner: { value: data.tenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_ARRAY,
      label: 'SaleCollection IDs',
      result: result.callData
    }
  }

  /*
    account - the account we want the Tenant ID for
  */
  static async MarketplaceGetClientTenants(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'nftmarketplace_get_client_tenants',
      {
        account: { value: data.account, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_STRING,
      label: 'Marketplace TenantID',
      result: result.callData
    }
  }

  /****** SimpleNFTMarketplace ******/

  /*
    Do not call this function
  */
  static async SimpleNFTMarketplaceGetPackage(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simplenftmarketplace_get_package'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    signer - account that will receive its own data
  */
  static async SimpleNFTMarketplaceInstance(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simplenftmarketplace_instance'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    signer - the account that is unlisting an NFT from their marketplace
    tenantOwner - the owner of the Tenant you want to interact with
    id - id of the NFT we'd like to unlist
    simpleNFTTenantOwner - the address of the owner of the SimpleNFT tenant
  */
  static async SimpleNFTMarketplaceUnlist(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simplenftmarketplace_unlist_sale',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address },
        id: { value: parseInt(data.id), type: t.UInt64 },
        simpleNFTTenantOwner: { value: data.simpleNFTTenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    signer - the account that is listing NFTs for sale
    tenantOwner - the owner of the Tenant you want to interact with
    ids - an array of the ids `signer` wants to list (they must)
      own them
    price - the price of the NFTs (must be of type double, ex. `50.0`)
    simpleNFTTenantOwner - the address of the owner of the SimpleNFT tenant
  */
  static async SimpleNFTMarketplaceList(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simplenftmarketplace_list_for_sale',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address },
        ids: DappLib.formatFlowArray(data.ids, t.UInt64),
        price: { value: data.price, type: t.UFix64 },
        simpleNFTTenantOwner: { value: data.simpleNFTTenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    signer - account purchasing the NFTs
    tenantOwner - the owner of the Tenant you want to interact with
    id - the id of the NFT to be purchased
    marketplace - the address of the person who's selling the NFTs
    simpleNFTTenantOwner - the address of the owner of the SimpleNFT tenant
  */
  static async SimpleNFTMarketplacePurchase(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simplenftmarketplace_purchase',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address },
        id: { value: parseInt(data.id), type: t.UInt64 },
        marketplace: { value: data.marketplace, type: t.Address },
        simpleNFTTenantOwner: { value: data.simpleNFTTenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    account - account we're looking at to see their listed NFT ids
    tenantOwner - the owner of the Tenant you want to interact with
    simpleNFTTenantOwner - the address of the owner of the SimpleNFT tenant
  */
  static async SimpleNFTMarketplaceGetIDs(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'simplenftmarketplace_get_ids',
      {
        account: { value: data.account, type: t.Address },
        tenantOwner: { value: data.tenantOwner, type: t.Address },
        simpleNFTTenantOwner: { value: data.simpleNFTTenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_ARRAY,
      label: 'SaleCollection IDs',
      result: result.callData
    }
  }

  /*
    account - the account we want the Tenant ID for
  */
  static async SimpleNFTMarketplaceGetClientTenants(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'simplenftmarketplace_get_client_tenants',
      {
        account: { value: data.account, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_STRING,
      label: 'SimpleNFTMarketplace TenantID',
      result: result.callData
    }
  }

  /*
    account - the account we're reading the FlowToken balance for
  */
  static async FlowTokenGetBalance(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'simplenftmarketplace_flowtoken_get_balance',
      {
        account: { value: data.account, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_BIG_NUMBER,
      label: 'FlowToken Balance',
      result: result.callData
    }
  }

  /****** SimpleToken ******/

  /*
    signer - account that will receive its own data
  */
  static async SimpleTokenInstance(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simple_ft_instance'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    Do not call this function
  */
  static async SimpleTokenGetPackage(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simple_ft_get_package'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    tenantOwner - the owner of the Tenant you want to interact with
    recipient - the address of the person receiving the minting capability
  */
  static async SimpleTokenGiveMinter(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.tenantOwner
      }
    },
      'simple_ft_give_minter',
      {
        recipient: { value: data.recipient, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    tenantOwner - the owner of the Tenant you want to interact with
    signer - the account minting the tokens
    amount - the amount of token to mint (must be of type double, ex. `50.0`)
    recipient - the address of the account receiving the tokens
  */
  static async SimpleTokenMintFT(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simple_ft_mint_ft',
      {
        recipient: { value: data.recipient, type: t.Address },
        tenantOwner: { value: data.tenantOwner, type: t.Address },
        amount: { value: data.amount, type: t.UFix64 }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    tenantOwner - the owner of the Tenant you want to interact with
    signer - the account transfering the tokens
    amount - the amount of token to transfer (must be of type double, ex. `50.0`)
    recipient - the address of the account receiving the tokens
  */
  static async SimpleTokenTransferFT(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simple_ft_transfer_ft',
      {
        recipient: { value: data.recipient, type: t.Address },
        amount: { value: data.amount, type: t.UFix64 },
        tenantOwner: { value: data.tenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    tenantOwner - the owner of the Tenant you want to interact with
    account - the account we're reading the SimpleToken balance for
  */
  static async SimpleTokenGetBalance(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'simple_ft_get_balance',
      {
        account: { value: data.account, type: t.Address },
        tenantOwner: { value: data.tenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_BIG_NUMBER,
      label: 'SimpleToken Balance',
      result: result.callData
    }
  }

  /*
    account - the account we want the Tenant ID for
  */
  static async SimpleTokenGetClientTenants(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'simple_ft_get_client_tenants',
      {
        account: { value: data.account, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_STRING,
      label: 'SimpleToken TenantID',
      result: result.callData
    }
  }

  /****** SimpleNFT ******/

  /*
    Do not call this function
  */
  static async SimpleNFTGetPackage(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simple_nft_get_package'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    signer - account that will receive its own data
  */
  static async SimpleNFTInstance(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simple_nft_instance'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
   tenantOwner - the owner of the Tenant you want to interact with
   recipient - the account reciving the minting capability
 */
  static async SimpleNFTGiveMinter(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.tenantOwner
      }
    },
      'simple_nft_give_minter',
      {
        recipient: { value: data.recipient, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
   tenantOwner - the owner of the Tenant you want to interact with
   signer - the person minting the NFT
   name - the name of the NFT
   recipient - the person receiving the NFT
 */
  static async SimpleNFTMintNFT(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simple_nft_mint_nft',
      {
        recipient: { value: data.recipient, type: t.Address },
        tenantOwner: { value: data.tenantOwner, type: t.Address },
        name: { value: data.name, type: t.String }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
    tenantOwner - the owner of the Tenant you want to interact with
    signer - the account transfering the NFT
    recipient - the account receiving the transfered NFT
    withdrawID - the id of the NFT to transfer
  */
  static async SimpleNFTTransferNFT(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'simple_nft_transfer_nft',
      {
        recipient: { value: data.recipient, type: t.Address },
        withdrawID: { value: parseInt(data.withdrawID), type: t.UInt64 },
        tenantOwner: { value: data.tenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }
  }

  /*
   tenantOwner - the owner of the Tenant you want to interact with
   account - the account we're reading the NFT ids from
 */
  static async SimpleNFTGetNFTIDs(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'simple_nft_get_nft_ids',
      {
        account: { value: data.account, type: t.Address },
        tenantOwner: { value: data.tenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_ARRAY,
      label: 'NFT IDs in Account Collection',
      result: result.callData
    }
  }

  /*
    account - the account we want the Tenant ID for
  */
  static async SimpleNFTGetClientTenants(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'simple_nft_get_client_tenants',
      {
        account: { value: data.account, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_STRING,
      label: 'SimpleNFT TenantID',
      result: result.callData
    }
  }

  /****** Rewards ******/

  /*
    signer - account that will receive its own data
  */
  static async RewardsInstance(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'rewards_instance',
      {
        numForReward: { value: parseInt(data.numForReward), type: t.Int }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    Do not call this function
  */
  static async RewardsGetPackage(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'rewards_get_package'
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    tenantOwner - the owner of the Tenant you want to interact with
    signer - the account we want to give the Reward to
  */
  static async RewardsGiveReward(data) {

    let result = await Blockchain.post({
      config: DappLib.getConfig(),
      roles: {
        proposer: data.signer
      }
    },
      'rewards_give_reward',
      {
        tenantOwner: { value: data.tenantOwner, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_TX_HASH,
      label: 'Transaction Hash',
      result: result.callData.transactionId
    }

  }

  /*
    account - the account we want the Tenant ID for
  */
  static async RewardsGetClientTenants(data) {

    let result = await Blockchain.get({
      config: DappLib.getConfig(),
      roles: {
      }
    },
      'rewards_get_client_tenants',
      {
        account: { value: data.account, type: t.Address }
      }
    );

    return {
      type: DappLib.DAPP_RESULT_STRING,
      label: 'Rewards TenantID',
      result: result.callData
    }
  }

  /****** Helpers ******/

  /*
    data - an object of key value pairs
    ex. { number: 2, id: 15 }

    types - an object that holds the type of the key 
    and value using the FCL types
    ex. { key: t.String, value: t.Int }
  */
  static formatFlowDictionary(data, types) {
    let newData = []
    let dataKeys = Object.keys(data)

    for (let key of dataKeys) {
      if (types.key.label.includes("Int")) key = parseInt(key)
      else if (types.key == t.Bool) key = (key === 'true');

      if (isNaN(data[key])) continue;
      else if (types.value.label.includes("Int")) data[key] = parseInt(data[key])
      else if (types.value == t.Bool) data[key] = (data[key] === 'true');
      newData.push({ key: key, value: data[key] })
    }
    return { value: newData, type: t.Dictionary(types) }
  }

  /*
    data - an array of values
    ex. ["Hello", "World", "!"]
  
    type - the type of the values using the FCL type
    ex. t.String
  */
  static formatFlowArray(data, type) {
    if (type == t.String) return { value: data, type: t.Array(type) }

    let newData = []
    for (let element of data) {
      if (type.label.includes("Int")) element = parseInt(element)
      else if (type == t.Bool) element = (element === 'true');

      newData.push(element)
    }
    return { value: newData, type: t.Array(type) }
  }

  static async ipfsUpload(config, files, wrapWithDirectory, progressCallback) {

    let results = [];
    if (files.length < 1) {
      return results;
    }
    let ipfs = ipfsClient(config.ipfs);
    let filesToUpload = [];
    files.map((file) => {
      filesToUpload.push({
        path: file.name,
        content: file
      })
    });
    const options = {
      wrapWithDirectory: wrapWithDirectory,
      pin: true,
      progress: progressCallback
    }

    for await (const result of ipfs.add(filesToUpload, options)) {
      if (wrapWithDirectory && result.path !== "") {
        continue;
      }
      results.push(
        Object.assign({}, result, DappLib._decodeMultihash(result.cid.string))
      );
    }

    return results;
  }

  static formatIpfsHash(a) {
    let config = DappLib.getConfig();
    let url = `${config.ipfs.protocol}://${config.ipfs.host}/ipfs/${a}`;
    return `<strong class="teal lighten-5 p-1 black-text number copy-target" title="${url}"><a href="${url}" target="_new">${a.substr(0, 6)}...${a.substr(a.length - 4, 4)}</a></strong>${DappLib.addClippy(a)}`;
  }

  /**
   * Partition multihash string into object representing multihash
   * https://github.com/saurfang/ipfs-multihash-on-solidity/blob/master/src/multihash.js
   */
  static _decodeMultihash(multihash) {
    const decoded = bs58.decode(multihash);

    return {
      digest: `0x${decoded.slice(2).toString('hex')}`,
      hashFunction: decoded[0],
      digestLength: decoded[1],
    };
  }




  /*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> DAPP LIBRARY  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

  static get DAPP_STATE_CONTRACT() {
    return 'dappStateContract'
  }
  static get DAPP_CONTRACT() {
    return 'dappContract'
  }

  static get DAPP_STATE_CONTRACT_WS() {
    return 'dappStateContractWs'
  }
  static get DAPP_CONTRACT_WS() {
    return 'dappContractWs'
  }

  static get DAPP_RESULT_BIG_NUMBER() {
    return 'big-number'
  }

  static get DAPP_RESULT_ACCOUNT() {
    return 'account'
  }

  static get DAPP_RESULT_TX_HASH() {
    return 'tx-hash'
  }

  static get DAPP_RESULT_IPFS_HASH_ARRAY() {
    return 'ipfs-hash-array'
  }

  static get DAPP_RESULT_SIA_HASH_ARRAY() {
    return 'sia-hash-array'
  }

  static get DAPP_RESULT_ARRAY() {
    return 'array'
  }

  static get DAPP_RESULT_OBJECT() {
    return 'object'
  }

  static get DAPP_RESULT_STRING() {
    return 'string'
  }

  static get DAPP_RESULT_ERROR() {
    return 'error'
  }

  static async addEventHandler(contract, event, params, callback) {
    Blockchain.handleEvent({
      config: DappLib.getConfig(),
      contract: contract,
      params: params || {}
    },
      event,
      (error, result) => {
        if (error) {
          callback({
            event: event,
            type: DappLib.DAPP_RESULT_ERROR,
            label: 'Error Message',
            result: error
          });
        } else {
          callback({
            event: event,
            type: DappLib.DAPP_RESULT_OBJECT,
            label: 'Event ' + event,
            result: DappLib.getObjectNamedProperties(result)
          });
        }
      }
    );
  }

  static getTransactionHash(t) {
    if (!t) { return ''; }
    let value = '';
    if (typeof t === 'string') {
      value = t;
    } else if (typeof t === 'object') {
      if (t.hasOwnProperty('transactionHash')) {
        value = t.transactionHash;       // Ethereum                
      } else {
        value = JSON.stringify(t);
      }
    }
    return value;
  }

  static formatHint(hint) {
    if (hint) {
      return `<p class="mt-3 grey-text"><strong>Hint:</strong> ${hint}</p>`;
    } else {
      return '';
    }
  }

  static formatNumber(n) {
    var parts = n.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `<strong class="p-1 blue-grey-text number copy-target" style="font-size:1.1rem;" title="${n}">${parts.join(".")}</strong>`;
  }

  static formatAccount(a) {
    return `<strong class="green accent-1 p-1 blue-grey-text number copy-target" title="${a}">${DappLib.toCondensed(a, 6, 4)}</strong>${DappLib.addClippy(a)}`;
  }

  static formatTxHash(a) {
    let value = DappLib.getTransactionHash(a);
    return `<strong class="teal lighten-5 p-1 blue-grey-text number copy-target" title="${value}">${DappLib.toCondensed(value, 6, 4)}</strong>${DappLib.addClippy(value)}`;
  }

  static formatBoolean(a) {
    return (a ? 'YES' : 'NO');
  }

  static formatText(a, copyText) {
    if (!a) { return; }
    if (a.startsWith('<')) {
      return a;
    }
    return `<span class="copy-target" title="${copyText ? copyText : a}">${a}</span>${DappLib.addClippy(copyText ? copyText : a)}`;
  }

  static formatStrong(a) {
    return `<strong>${a}</strong>`;
  }

  static formatPlain(a) {
    return a;
  }

  static formatObject(a) {
    let data = [];
    let labels = ['Item', 'Value'];
    let keys = ['item', 'value'];
    let formatters = ['Strong', 'Text-20-5']; // 'Strong': Bold, 'Text-20-5': Compress a 20 character long string down to 5
    let reg = new RegExp('^\\d+$'); // only digits
    for (let key in a) {
      if (!reg.test(key)) {
        data.push({
          item: key.substr(0, 1).toUpperCase() + key.substr(1),
          value: a[key]
        });
      }
    }
    return DappLib.formatArray(data, formatters, labels, keys);
  }

  static formatArray(h, dataFormatters, dataLabels, dataKeys) {

    let output = '<table class="table table-striped">';

    if (dataLabels) {
      output += '<thead><tr>';
      for (let d = 0; d < dataLabels.length; d++) {
        output += `<th scope="col">${dataLabels[d]}</th>`;
      }
      output += '</tr></thead>';
    }
    output += '<tbody>';
    h.map((item) => {
      output += '<tr>';
      for (let d = 0; d < dataFormatters.length; d++) {
        let text = String(dataKeys && dataKeys[d] ? item[dataKeys[d]] : item);
        let copyText = dataKeys && dataKeys[d] ? item[dataKeys[d]] : item;
        if (text.startsWith('<')) {
          output += (d == 0 ? '<th scope="row">' : '<td>') + text + (d == 0 ? '</th>' : '</td>');
        } else {
          let formatter = 'format' + dataFormatters[d];
          if (formatter.startsWith('formatText')) {
            let formatterFrags = formatter.split('-');
            if (formatterFrags.length === 3) {
              text = DappLib.toCondensed(text, Number(formatterFrags[1]), Number(formatterFrags[2]));
            } else if (formatterFrags.length === 2) {
              text = DappLib.toCondensed(text, Number(formatterFrags[1]));
            }
            formatter = formatterFrags[0];
          }
          output += (d == 0 ? '<th scope="row">' : '<td>') + DappLib[formatter](text, copyText) + (d == 0 ? '</th>' : '</td>');
        }
      }
      output += '</tr>';
    })
    output += '</tbody></table>';
    return output;
  }

  static getFormattedResultNode(retVal, key) {

    let returnKey = 'result';
    if (key && (key !== null) && (key !== 'null') && (typeof (key) === 'string')) {
      returnKey = key;
    }
    let formatted = '';
    switch (retVal.type) {
      case DappLib.DAPP_RESULT_BIG_NUMBER:
        formatted = DappLib.formatNumber(retVal[returnKey].toString(10));
        break;
      case DappLib.DAPP_RESULT_TX_HASH:
        formatted = DappLib.formatTxHash(retVal[returnKey]);
        break;
      case DappLib.DAPP_RESULT_ACCOUNT:
        formatted = DappLib.formatAccount(retVal[returnKey]);
        break;
      case DappLib.DAPP_RESULT_BOOLEAN:
        formatted = DappLib.formatBoolean(retVal[returnKey]);
        break;
      case DappLib.DAPP_RESULT_IPFS_HASH_ARRAY:
        formatted = DappLib.formatArray(
          retVal[returnKey],
          ['TxHash', 'IpfsHash', 'Text-10-5'], //Formatter
          ['Transaction', 'IPFS URL', 'Doc Id'], //Label
          ['transactionHash', 'ipfsHash', 'docId'] //Values
        );
        break;
      case DappLib.DAPP_RESULT_SIA_HASH_ARRAY:
        formatted = DappLib.formatArray(
          retVal[returnKey],
          ['TxHash', 'SiaHash', 'Text-10-5'], //Formatter
          ['Transaction', 'Sia URL', 'Doc Id'], //Label
          ['transactionHash', 'docId', 'docId'] //Values
        );
        break;
      case DappLib.DAPP_RESULT_ARRAY:
        formatted = DappLib.formatArray(
          retVal[returnKey],
          retVal.formatter ? retVal.formatter : ['Text'],
          null,
          null
        );
        break;
      case DappLib.DAPP_RESULT_STRING:
        formatted = DappLib.formatPlain(
          retVal[returnKey]
        );
        break;
      case DappLib.DAPP_RESULT_OBJECT:
        formatted = DappLib.formatObject(retVal[returnKey]);
        break;
      default:
        formatted = retVal[returnKey];
        break;
    }

    let resultNode = document.createElement('div');
    resultNode.className = `note text-xs ${retVal.type === DappLib.DAPP_RESULT_ERROR ? 'bg-red-400' : 'bg-green-400'} m-3 p-3`;
    let closeMarkup = '<div class="float-right" onclick="this.parentNode.parentNode.removeChild(this.parentNode)" title="Dismiss" class="text-right mb-1 mr-2" style="cursor:pointer;">X</div>';
    resultNode.innerHTML = `<span class='text-xl break-words'>${closeMarkup} ${retVal.type === DappLib.DAPP_RESULT_ERROR ? '☹️' : '👍️'} ${(Array.isArray(retVal[returnKey]) ? 'Result' : retVal.label)} : ${formatted} ${DappLib.formatHint(retVal.hint)}</span>`
    // Wire-up clipboard copy
    new ClipboardJS('.copy-target', {
      text: function (trigger) {
        return trigger.getAttribute('data-copy');
      }
    });

    return resultNode;
  }

  static getObjectNamedProperties(a) {
    let reg = new RegExp('^\\d+$'); // only digits
    let newObj = {};
    for (let key in a) {
      if (!reg.test(key)) {
        newObj[key] = a[key];
      }
    }
    return newObj;
  }

  static addClippy(data) {
    return `
        <svg data-copy="${data}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 22.1 23.5" style="enable-background:new 0 0 22.1 23.5;cursor:pointer;" class="copy-target" width="19px" height="20.357px" xml:space="preserve">
        <style type="text/css">
            .st99{fill:#777777;stroke:none;stroke-linecap:round;stroke-linejoin:round;}
        </style>
        <path class="st99" d="M3.9,17.4h5.4v1.4H3.9V17.4z M10.7,9.2H3.9v1.4h6.8V9.2z M13.4,13.3v-2.7l-4.1,4.1l4.1,4.1V16h6.8v-2.7H13.4z
             M7.3,12H3.9v1.4h3.4V12z M3.9,16h3.4v-1.4H3.9V16z M16.1,17.4h1.4v2.7c0,0.4-0.1,0.7-0.4,1c-0.3,0.3-0.6,0.4-1,0.4H2.6
            c-0.7,0-1.4-0.6-1.4-1.4V5.2c0-0.7,0.6-1.4,1.4-1.4h4.1c0-1.5,1.2-2.7,2.7-2.7s2.7,1.2,2.7,2.7h4.1c0.7,0,1.4,0.6,1.4,1.4V12h-1.4
            V7.9H2.6v12.2h13.6V17.4z M3.9,6.5h10.9c0-0.7-0.6-1.4-1.4-1.4h-1.4c-0.7,0-1.4-0.6-1.4-1.4s-0.6-1.4-1.4-1.4S8,3.1,8,3.8
            S7.4,5.2,6.6,5.2H5.3C4.5,5.2,3.9,5.8,3.9,6.5z"/>
        </svg>
        `;
  }

  static getAccounts() {
    let accounts = dappConfig.accounts;
    return accounts;
  }

  static fromAscii(str, padding) {

    if (Array.isArray(str)) {
      return DappLib.arrayToHex(str);
    }

    if (str.startsWith('0x') || !padding) {
      return str;
    }

    if (str.length > padding) {
      str = str.substr(0, padding);
    }

    var hex = '0x';
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      var n = code.toString(16);
      hex += n.length < 2 ? '0' + n : n;
    }
    return hex + '0'.repeat(padding * 2 - hex.length + 2);
  };


  static toAscii(hex) {
    var str = '',
      i = 0,
      l = hex.length;
    if (hex.substring(0, 2) === '0x') {
      i = 2;
    }
    for (; i < l; i += 2) {
      var code = parseInt(hex.substr(i, 2), 16);
      if (code === 0) continue; // this is added
      str += String.fromCharCode(code);
    }
    return str;
  };

  static arrayToHex(bytes) {
    if (Array.isArray(bytes)) {
      return '0x' +
        Array.prototype.map.call(bytes, function (byte) {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
    } else {
      return bytes;
    }
  }

  static hexToArray(hex) {
    if ((typeof hex === 'string') && (hex.beginsWith('0x'))) {
      let bytes = [];
      for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
      }
      return bytes;
    } else {
      return hex;
    }
  }

  static toCondensed(s, begin, end) {
    if (!s) { return; }
    if (s.length && s.length <= begin + end) {
      return s;
    } else {
      if (end) {
        return `${s.substr(0, begin)}...${s.substr(s.length - end, end)}`;
      } else {
        return `${s.substr(0, begin)}...`;
      }
    }
  }

  static getManifest() {
    return manifest;
  }

  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  static getUniqueId() {
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static getConfig() {
    return dappConfig;
  }

  // Return value of this function is used to dynamically re-define getConfig()
  // for use during testing. With this approach, even though getConfig() is static
  // it returns the correct contract addresses as its definition is re-written
  // before each test run. Look for the following line in test scripts to see it done:
  //  DappLib.getConfig = Function(`return ${ JSON.stringify(DappLib.getTestConfig(testDappStateContract, testDappContract, testAccounts))}`);
  static getTestConfig(testDappStateContract, testDappContract, testAccounts) {

    return Object.assign(
      {},
      dappConfig,
      {
        dappStateContractAddress: testDappStateContract.address,
        dappContractAddress: testDappContract.address,
        accounts: testAccounts,
        owner: testAccounts[0],
        admins: [
          testAccounts[1],
          testAccounts[2],
          testAccounts[3]
        ],
        users: [
          testAccounts[4],
          testAccounts[5],
          testAccounts[6],
          testAccounts[7],
          testAccounts[8]
        ]
        ///+test
      }
    );
  }

}