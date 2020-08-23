'use strict';

/**
 * This is a Node.JS application to create shipment on the network.
 */

const helper = require('./contractHelper');

async function main(buyerCRN, drugName, listOfAssets, transporterCRN, organisationType) {

	try {

		const pharmanetContract = await helper.getContractInstance(organisationType);

		// Create shipment
		console.log('.....Create Shipment');
		const responseBuffer = await pharmanetContract.submitTransaction('createShipment', buyerCRN, drugName, listOfAssets, transporterCRN);

		// process response
		console.log('.....Processing Create Shipment Transaction Response \n\n');
		let response = JSON.parse(responseBuffer.toString());
		console.log(response);
		console.log('\n\n.....Create Shipment Transaction Complete!');
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
/* main("DIST001","D1","{\"assets\":[\"\\u0000org.pharma-network.pharmanet.drug\\u0000D1\\u0000d1.001\\u0000\",\"\\u0000org.pharma-network.pharmanet.drug\\u0000D1\\u0000drug1.002\\u0000\"]}","TRA001", 'manufacturer').then(() => {
	console.log('Shipment created');
}); */

/* main("RET001","D1","{\"assets\":[\"\\u0000org.pharma-network.pharmanet.drug\\u0000D1\\u0000d1.001\\u0000\",\"\\u0000org.pharma-network.pharmanet.drug\\u0000D1\\u0000drug1.002\\u0000\"]}","TRA001", 'distributor').then(() => {
	console.log('Shipment created');
}); */

module.exports.execute = main;
