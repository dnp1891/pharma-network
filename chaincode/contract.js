'use strict';

const {Contract} = require('fabric-contract-api');
const helper = require('./helper.js');

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

	/**
	 * Entity Registration: Register a Company 
	 * 
	 * @param ctx              The transaction context object
	 * @param companyCRN       Company Registration Number (CRN)
	 * @param companyName      Name of the company
	 * @param location         Location of the company
	 * @param organisationRole Role of the company
	 * @returns
	 */
	async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {
		// Create a new composite key for the new company account
		const companyKey = await helper.createCompanyKey(ctx, companyCRN, companyName);

		// Fetch company with given ID from blockchain
		let existingCompany = await helper.getAsset(ctx, companyKey);

		if (existingCompany !== false) {
			throw new Error('Company is already registered.');
		} else {
			helper.validateOrganizationRole(organisationRole);

			// Create a company object to be stored in blockchain
			let companyObject = {
				companyID: companyKey,
	            name: companyName,
	            location: location,
	            organisationRole: organisationRole,
	            hierarchyKey: helper.getHierarchyKey(organisationRole)
			};
			await helper.storeAsset(ctx, companyKey, companyObject);

        	return companyObject;
		}
	}

	/**
	 * Register new drug
	 * 
	 * This transaction is used by any organisation registered as 
	 * a manufacturer to register a new drug on the ledger. 
	 * 
	 * @param ctx        The transaction context object
	 * @param drugName   Name of the drug
	 * @param serialNo   Serial number of the drug
	 * @param mfgDate    Date of manufacturing of the drug
	 * @param expDate    Expiration date of the drug
	 * @param companyCRN Manufacturer's Company CRN
	 * @returns
	 */
	async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {
		helper.assertOrganization(ctx, 'manufacturerMSP');

		// Create a new composite key for the new drug
        const drugKey = await helper.createDrugKey(ctx, drugName, serialNo);

        // Fetch drug with given ID from blockchain
        let existingDrug = await helper.getAsset(ctx, drugKey);
        if (existingDrug !== false) {
            throw new Error('Drug is already added.');
        } else {
	        let companyKey = await helper.getCompanyKeyByCRN(ctx, companyCRN);
	        if (companyKey === false) {
	            throw new Error('Company is not registered.');
	        }

	        let drugObject = {
	            productID: drugKey,
	            name: drugName,
	            manufacturer: companyKey,
	            manufacturingDate: mfgDate,
	            expiryDate: expDate,
	            owner: companyKey,
	            shipment: null,
	        }
	        await helper.storeAsset(ctx, drugKey, drugObject);

	        return drugObject;
	    }
	}

	/**
	 * Create a Purchase Order (PO)
	 * 
	 * To buy drugs, by companies belonging to Distributor or Retailer
	 * 
	 * @param ctx       The transaction context object
	 * @param buyerCRN  Buyer CRN
	 * @param sellerCRN Seller CRN
	 * @param drugName  Name of the Drug for which PO raised
	 * @param quantity  Number of units required
	 * @returns
	 */
	async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
		let buyerObject = await helper.getCompanyObjectByCRN(ctx, buyerCRN);
        if (buyerObject === false) {
            throw new Error('Buyer is not registered.');
        }

        let sellerObject = await helper.getCompanyObjectByCRN(ctx, sellerCRN);
        if (sellerObject === false) {
            throw new Error('Seller is not registered.');
        }

        let buyerHierarchyKey = parseInt(buyerObject.hierarchyKey, 10);
        let sellerHierarchyKey = parseInt(sellerObject.hierarchyKey, 10);

        if (buyerHierarchyKey - sellerHierarchyKey !== 1) {
            throw new Error('Transfer of drug is not in a hierarchical manner.')
        }

        const drugPOKey = await helper.createDrugPOKey(ctx, buyerCRN, drugName);
        let POObject = {
            poID: drugPOKey,
            drugName: drugName,
            quantity: quantity,
            buyer: buyerObject.companyID,
            seller: sellerObject.companyID
        }

        await helper.storeAsset(ctx, drugPOKey, POObject);

        return POObject;
	}

	/**
	 * Create Shipment by manufacturer/distributor
	 *
	 * After the buyer invokes the createPO transaction, 
	 * the seller invokes this transaction to transport 
	 * the consignment via a transporter corresponding to each PO.
	 * 
	 * @param ctx            The transaction context object
	 * @param buyerCRN       Buyer CRN
	 * @param drugName       Name of the drug
	 * @param listOfAssets   List of assets
	 * @param transporterCRN Transporter CRN
	 * @returns
	 */
	async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
		let buyerObject = await helper.getCompanyObjectByCRN(ctx, buyerCRN);
        if (buyerObject === false) {
            throw new Error('Buyer is not registered.');
        }

        let transporterObject = await helper.getCompanyObjectByCRN(ctx, transporterCRN);
        if (transporterObject === false) {
            throw new Error('Transporter is not registered.');
        }

        let drugPOKey = await helper.createDrugPOKey(ctx, buyerCRN, drugName);
        let drugPOObject = await helper.getAsset(ctx, drugPOKey);
        if (drugPOObject === false) {
            throw new Error('Purchase Order not found.');
        }
        // check quantity in PO and list of assets
        let quantity = parseInt(drugPOObject.quantity, 10);
        let assets = JSON.parse(listOfAssets).assets;
        if (assets.length !== quantity) {
            throw new Error('Mismatch in quantity with PO and assets.');
        }

        // check if item in list of assets are valid registered IDs
        let drugObject;
        let drugObjects = {};
        let drugKeys = [];
        for (let drugSerial of assets) {
            let drugKey = await helper.createDrugKey(ctx, drugName, drugSerial);
            drugObject = await helper.getAsset(ctx, drugKey);
            if (drugObject === false) {
                throw new Error(drugSerial + ' is not a valid asset.');
            }
            drugObjects[drugKey] = drugObject;
            drugKeys.push(drugKey);
        }

        // Create Shipment
        const IDENTITY = helper.getIdentity(ctx);
        const shipmentKey = await helper.createDrugShipmentKey(ctx, buyerCRN, drugName);
        let shipmentObject = {
            shipmentID: shipmentKey,
            creator: IDENTITY,
            assets: drugKeys,
            transporter: transporterObject.companyID,
            status: "in-transit"
        }
        await helper.storeAsset(ctx, shipmentKey, shipmentObject);

        // update owner of items in batch
        for (let drugKey in drugObjects) {
            drugObject = drugObjects[drugKey];
            drugObject.owner = transporterObject.companyID;
            await helper.storeAsset(ctx, drugKey, drugObject);
        }

        return shipmentObject;
	}

	/**
	 * Update shipment by transporter
	 *
	 * This transaction is used to update the status of the shipment 
	 * to Delivered when the consignment gets delivered to the destination.
	 * 
	 * @param ctx            The transaction context object
	 * @param buyerCRN       Buyer CRN
	 * @param drugName       Name of the drug
	 * @param transporterCRN Transporter CRN
	 * @returns
	 */
	async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
		helper.assertOrganization(ctx, 'transporterMSP');

        let transporterObject = await helper.getCompanyObjectByCRN(ctx, transporterCRN);
        if (transporterObject === false) {
            throw new Error('Transporter is not registered.');
        }

        let buyerObj = await helper.getCompanyObjectByCRN(ctx, buyerCRN);
        if (buyerObj === false) {
            throw new Error('Buyer is not registered.');
        }

        let shipmentKey = await helper.createDrugShipmentKey(ctx, buyerCRN, drugName);
        let shipmentObject = await helper.getAsset(ctx, shipmentKey);
        if (shipmentObject === false) {
            throw new Error('Shipment not found.');
        }

        if (shipmentObject.status !== 'in-transit') {
            throw new Error('Shipment is not in-transit..!');
        }

        if (transporterObject.companyID !== shipmentObject.transporter) {
            throw new Error('Transporter mismatch with shipment.');
        }

        // update status of shipment
        shipmentObject.status = 'delivered';
        await helper.storeAsset(ctx, shipmentKey, shipmentObject);

        // Update owner and shipment details of assets
        let assets = shipmentObject.assets;
        let drugObject;
        for (let drugKey of assets) {
            drugObject = await helper.getAsset(ctx, drugKey);
            drugObject.owner = buyerObj.companyID;
            if (drugObject.shipment === null) {
                drugObject.shipment = [];
                drugObject.shipment.push(shipmentKey);
            } else {
                drugObject.shipment.push(shipmentKey);
            }
            await helper.storeAsset(ctx, drugKey, drugObject);
        }

        return shipmentObject;
	}

	/**
	 * Retail Drug by retailer to consumer
	 *
	 * This transaction is called by the retailer 
	 * while selling the drug to a consumer. 
	 * 
	 * @param ctx            The transaction context object
	 * @param drugName       Name of the drug
	 * @param serialNo       Serial number of the drug
	 * @param retailerCRN    Retailer CRN
	 * @param customerAadhar Customer aadhar number
	 * @returns
	 */
	async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
        helper.assertOrg(ctx, 'retailerMSP');

        let drugKey = await helper.createDrugKey(ctx, drugName, serialNo);
        let drugObject = await helper.getAsset(ctx, drugKey);
        if (drugObject === false) {
            throw new Error('Drug is not registered.');
        }

        let retailerObject = await helper.getCompanyObjectByCRN(ctx, retailerCRN);
        if (retailerObject === false) {
            throw new Error('Retailer is not registered.');
        }

        let retailerHierarchyKey = parseInt(retailerObject.hierarchyKey, 10);
        if (retailerHierarchyKey !== helper.getHierarchyKey('Retailer')) {
            throw new Error('Only Retailer can sell drug to customer.');
        }

        if (drugObject.owner !== retailerObject.companyID) {
            throw new Error('You must be owner of drug to sell.');
        }

        if (customerAadhar.length == 0) {
            throw new Error('Customer Aadhar is not valid.');
        }

        // update drug ownership
        drugObject.owner = customerAadhar;
        await helper.storeAsset(ctx, drugKey, drugObject);

        return drugObject;
    }

    /**
     * View history of drug
     *
     * This transaction will be used to view the lifecycle of 
     * the product by fetching transactions from the blockchain. 
     * 
     * @param ctx      The transaction context object
     * @param drugName Name of the drug
     * @param serialNo Serial number of the drug
     * @returns
     */
    async viewHistory(ctx, drugName, serialNo) {
        let drugKey = await helper.createDrugKey(ctx, drugName, serialNo);
        let drugObject = await helper.getAsset(ctx, drugKey);

        if (drugObject === false) {
            throw new Error('Drug is not registered.');
        }

        let drugHistory = await helper.getDrugHistory(ctx, drugKey);

        return drugHistory;
    }

    /**
     * View current state of drug
     * 
     * This transaction is used to view the current state of the Asset.
     * 
     * @param ctx      The transaction context object
     * @param drugName Name of the drug
     * @param serialNo Serial number of the drug
     * @returns
     */
    async viewDrugCurrentState(ctx, drugName, serialNo) {
        let drugKey = await helper.createDrugKey(ctx, drugName, serialNo);
        let drugObject = await helper.getAsset(ctx, drugKey);

        if (drugObject === false) {
            throw new Error('Drug is not registered.');
        }

        return drugObject;
    }
}

module.exports = PharmanetContract;