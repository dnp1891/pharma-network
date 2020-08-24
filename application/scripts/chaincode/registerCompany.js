'use strict';

/**
 * This is a Node.JS application to register a new company on the network.
 */

const helper = require('./contractHelper');

async function main(companyCRN, companyName, location, organisationRole, organisationType) {

	try {

		const pharmanetContract = await helper.getContractInstance(organisationType);

		// Register a new company
		console.log('.....Register a new Company');
		const responseBuffer = await pharmanetContract.submitTransaction('registerCompany', companyCRN, companyName, location, organisationRole);

		// process response
		console.log('.....Processing Register new Company Transaction Response \n\n');
		let response = JSON.parse(responseBuffer.toString());
		console.log(response);
		console.log('\n\n.....Register new Company Transaction Complete!');
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

/* main('MAN001', 'Manufacturer 1', 'Ahmedabad', 'Manufacturer', 'manufacturer').then(() => {
	console.log('A new company registered.');
}); */

/* main('DIST001', 'Distributor 1', 'Vadodara', 'Distributor', 'distributor').then(() => {
	console.log('A new company registered.');
}); */

/* main('RET001', 'Retailer 1', 'Vadodara', 'Retailer', 'retailer').then(() => {
	console.log('A new company registered.');
}); */

/* main('TRA001', 'Transporter 1', 'Vadodara', 'Transporter', 'transporter').then(() => {
	console.log('A new company registered.');
}); */

module.exports.execute = main;
