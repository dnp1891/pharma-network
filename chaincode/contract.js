'use strict';

const {Contract} = require('fabric-contract-api');

class PharmanetContract extends Contract {
	/**
	 * Constructor for pharmanet contract
	 */
	constructor() {
		super('org.pharma-network.pharmanet');
	}

	// This is a basic user defined function used at the time of instantiating 
	// the smart contract to print the success message on console
	async instantiate(ctx) {
		console.log('Pharmanet Smart Contract Instantiated');
	}
}