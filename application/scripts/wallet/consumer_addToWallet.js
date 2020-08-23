'use strict';

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * Defaults:
 *  User Name: CONSUMER_ADMIN
 *  User Organization: consumer
 *  User Role: Admin
 *
 */

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
const path = require('path'); // Support library to build filesystem paths in NodeJs

const crypto_materials = path.resolve(__dirname, '../network/crypto-config'); // Directory where all Network artifacts are stored

// A wallet is a filesystem path that stores a collection of Identities
const wallet = new FileSystemWallet('./identity/consumer');

async function main(certificatePath, privateKeyPath) {
	// Main try/catch block
	try {
		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const certificate = fs.readFileSync(certificatePath).toString();
		// IMPORTANT: Change the private key name to the key generated on your computer
		const privatekey = fs.readFileSync(privateKeyPath).toString();

		// Load credentials into wallet
		const identityLabel = 'CONSUMER_ADMIN';
		const identity = X509WalletMixin.createIdentity('consumerMSP', certificate, privatekey);

		await wallet.import(identityLabel, identity);
	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

/* main('/home/divyesh/fabric-workspace/pharma-network/network/crypto-config/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/signcerts/Admin@consumer.pharma-network.com-cert.pem', '/home/divyesh/fabric-workspace/pharma-network/network/crypto-config/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/keystore/f8e480bf96dc0e36ab9277f2d77c743dec412de19ff8d42e04c789769a11d6d8_sk').then(() => {
  console.log('User identity added to wallet.');
}); */

module.exports.execute = main;
