'use strict';

/**
 * This is a Node.JS application to add a new drug on the network.
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo, mfgData, expDate, companyCRN, organisationType) {

	try {

		const pharmanetContract = await helper.getContractInstance(organisationType);

		// Create a new drug
		console.log('.....Add a new drug');
		const responseBuffer = await pharmanetContract.submitTransaction('addDrug', drugName, serialNo, mfgData, expDate, companyCRN);

		// process response
		console.log('.....Processing Add new drug Transaction Response \n\n');
		let response = JSON.parse(responseBuffer.toString());
		console.log(response);
		console.log('\n\n.....Add new drug Transaction Complete!');
		return response;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		// console.log('.....Disconnecting from Fabric Gateway');
		helper.disconnect();

	}
}

/* main("D1","d1.0001","01/08/2020","01/08/2023","MAN001", 'manufacturer').then(() => {
	console.log('A new drug added');
}); */

module.exports.execute = main;
