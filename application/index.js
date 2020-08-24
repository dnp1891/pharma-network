const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Wallets
const manufacturerWallet = require('./scripts/wallet/manufacturer_addToWallet');
const distributorWallet = require('./scripts/wallet/distributor_addToWallet');
const retailerWallet = require('./scripts/wallet/retailer_addToWallet');
const consumerWallet = require('./scripts/wallet/consumer_addToWallet');
const transporterWallet = require('./scripts/wallet/transporter_addToWallet');

// Chaincode scripts
const registerCompany = require('./scripts/chaincode/registerCompany');
const addDrug = require('./scripts/chaincode/addDrug');
const createPO = require('./scripts/chaincode/createPO');
const createShipment = require('./scripts/chaincode/createShipment');
const updateShipment = require('./scripts/chaincode/updateShipment');
const retailDrug = require('./scripts/chaincode/retailDrug');
const viewHistory = require('./scripts/chaincode/viewHistory');
const viewDrugCurrentState = require('./scripts/chaincode/viewDrugCurrentState');

// Define Express app settings
app.use(cors());
app.use(express.json());// for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma Application');

app.get('/', (req,res) => res.send('Welcome to Pharma Network'));

app.post('/wallet/manufacturer', (req,res) => {
	manufacturerWallet.execute(req.body.certificatePath, req.body.privateKeyPath)
		.then(() => {
			console.log('Manufacturer credentials added to wallet');
			const result = {
				status: 'success',
				message: 'Manufacturer credentials added to wallet'
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/wallet/distributor', (req,res) => {
	distributorWallet.execute(req.body.certificatePath, req.body.privateKeyPath)
		.then(() => {
			console.log('Distributor credentials added to wallet');
			const result = {
				status: 'success',
				message: 'Distributor credentials added to wallet'
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/wallet/retailer', (req,res) => {
	retailerWallet.execute(req.body.certificatePath, req.body.privateKeyPath)
		.then(() => {
			console.log('Retailer credentials added to wallet');
			const result = {
				status: 'success',
				message: 'Retailer credentials added to wallet'
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/wallet/consumer', (req,res) => {
	consumerWallet.execute(req.body.certificatePath, req.body.privateKeyPath)
		.then(() => {
			console.log('Consumer credentials added to wallet');
			const result = {
				status: 'success',
				message: 'Consumer credentials added to wallet'
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/wallet/transporter', (req,res) => {
	transporterWallet.execute(req.body.certificatePath, req.body.privateKeyPath)
		.then(() => {
			console.log('Transporter credentials added to wallet');
			const result = {
				status: 'success',
				message: 'Transporter credentials added to wallet'
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/registerCompany', (req,res) => {
	registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.location, req.body.organisationRole, req.body.organisationType)
		.then((response) => {
			console.log('New Company registered.');
			const result = {
				status: 'success',
				message: 'New Company registered.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/addDrug', (req,res) => {
	addDrug.execute(req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN, req.body.organisationType)
		.then((response) => {
			console.log('New Drug added.');
			const result = {
				status: 'success',
				message: 'New Drug added.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/createPO', (req,res) => {
	createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity, req.body.organisationType)
		.then((response) => {
			console.log('New Purchase order created.');
			const result = {
				status: 'success',
				message: 'New Purchase order created.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/createShipment', (req,res) => {
	createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN, req.body.organisationType)
		.then((response) => {
			console.log('Shipment created.');
			const result = {
				status: 'success',
				message: 'Shipment created.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/updateShipment', (req,res) => {
	updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN, req.body.organisationType)
		.then((response) => {
			console.log('Shipment udpated into the network');
			const result = {
				status: 'success',
				message: 'Shipment updated into the network',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/retailDrug', (req,res) => {
	retailDrug.execute(req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar, req.body.organisationType)
		.then((response) => {
			console.log('Drug has been bought.');
			const result = {
				status: 'success',
				message: 'Drug has been bought.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/viewHistory', (req,res) => {
	viewHistory.execute(req.body.drugName, req.body.serialNo, req.body.organisationType)
		.then((response) => {
			console.log('Drug history has been displayed.');
			const result = {
				status: 'success',
				message: 'Drug history has been displayed.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/viewDrugCurrentState', (req,res) => {
	viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo, req.body.organisationType)
		.then((response) => {
			console.log('Current state of Drug has been displayed.');
			const result = {
				status: 'success',
				message: 'Current state of Drug has been displayed.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.listen(port, () => console.log(`Distributed Pharma App listening on port ${port}!`));