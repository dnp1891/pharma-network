'use strict';

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * Defaults:
 *  User Name: TRANSPORTER_ADMIN
 *  User Organization: transporter
 *  User Role: Admin
 *
 */

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
const path = require('path'); // Support library to build filesystem paths in NodeJs

const crypto_materials = path.resolve(__dirname, '../network/crypto-config'); // Directory where all Network artifacts are stored

// A wallet is a filesystem path that stores a collection of Identities
const wallet = new FileSystemWallet('./identity/transporter');

async function main(certificatePath, privateKeyPath) {
	// Main try/catch block
	try {
		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const certificate = fs.readFileSync(certificatePath).toString();
		// IMPORTANT: Change the private key name to the key generated on your computer
		const privatekey = fs.readFileSync(privateKeyPath).toString();

		// Load credentials into wallet
		const identityLabel = 'TRANSPORTER_ADMIN';
		const identity = X509WalletMixin.createIdentity('transporterMSP', certificate, privatekey);

		await wallet.import(identityLabel, identity);
	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

/* main('/home/divyesh/fabric-workspace/pharma-network/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/signcerts/Admin@transporter.pharma-network.com-cert.pem', '/home/divyesh/fabric-workspace/pharma-network/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/keystore/c7521e22e8e6e3b27b89f4d8a180951fb1c91f38f0d50dbd73cb0bd3dcf352b1_sk').then(() => {
  console.log('User identity added to wallet.');
}); */

module.exports.execute = main;
