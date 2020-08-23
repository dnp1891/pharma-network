'use strict';

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * Defaults:
 *  User Name: MANUFACTURER_ADMIN
 *  User Organization: manufacturer
 *  User Role: Admin
 *
 */

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
const path = require('path'); // Support library to build filesystem paths in NodeJs

const crypto_materials = path.resolve(__dirname, '../network/crypto-config'); // Directory where all Network artifacts are stored

// A wallet is a filesystem path that stores a collection of Identities
const wallet = new FileSystemWallet('./identity/manufacturer');

async function main(certificatePath, privateKeyPath) {
	// Main try/catch block
	try {
		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const certificate = fs.readFileSync(certificatePath).toString();
		// IMPORTANT: Change the private key name to the key generated on your computer
		const privatekey = fs.readFileSync(privateKeyPath).toString();

		// Load credentials into wallet
		const identityLabel = 'MANUFACTURER_ADMIN';
		const identity = X509WalletMixin.createIdentity('manufacturerMSP', certificate, privatekey);

		await wallet.import(identityLabel, identity);
	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

/*main('/home/divyesh/fabric-workspace/pharma-network/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/signcerts/Admin@manufacturer.pharma-network.com-cert.pem', '/home/divyesh/fabric-workspace/pharma-network/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/keystore/2fb8bb4e3b0aa3c7686cc462b74b181f670baeb54586b0c2633606cce4b01197_sk').then(() => {
	console.log('User identity added to wallet.');
});*/

module.exports.execute = main;
