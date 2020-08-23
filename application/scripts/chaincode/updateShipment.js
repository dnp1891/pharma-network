'use strict';

/**
 * This is a Node.JS application to update shipment on the network.
 */

const helper = require('./contractHelper');

async function main(buyerCRN, drugName, transporterCRN, organisationType) {

	try {

		const pharmanetContract = await helper.getContractInstance(organisationType);

		// Update shipment
		console.log('.....Update Shipment');
		const responseBuffer = await pharmanetContract.submitTransaction('updateShipment', buyerCRN, drugName, transporterCRN);

		// process response
		console.log('.....Processing Update Shipment Transaction Response \n\n');
		let response = JSON.parse(responseBuffer.toString());
		console.log(response);
		console.log('\n\n.....Update Shipment Transaction Complete!');
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
/* main("DIST001", "D1","TRA001", 'transporter').then(() => {
	console.log('Shipment Updated');
}); */

/* main("RET001", "D1","TRA001", 'transporter').then(() => {
	console.log('Shipment Updated');
});*/

module.exports.execute = main;
