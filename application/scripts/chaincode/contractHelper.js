const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
let gateway;

async function getContractInstance(role) {

	// A gateway defines which peer is used to access Fabric network
	// It uses a common connection profile (CCP) to connect to a Fabric Peer
	// A CCP is defined manually in file connection-profile-mhrd.yaml
	gateway = new Gateway();

	// A wallet is where the credentials to be used for this transaction exist
	// Credentials for user with specified role will be added to this wallet.
    const IDENTITY = getIdentity(role);
	const wallet = new FileSystemWallet(IDENTITY);

	// What is the username of this Client user accessing the network?
    const fabricUserName = getUsername(role);

	// Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
    const CONNECTION_PROFILE = getConnectionProfile(role);
	let connectionProfile = yaml.safeLoad(fs.readFileSync(CONNECTION_PROFILE, 'utf8'));

    // Set connection options; identity and wallet
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: false, asLocalhost: true }
	};

	// Connect to gateway using specified parameters
	console.log('.....Connecting to Fabric Gateway');
	await gateway.connect(connectionProfile, connectionOptions);

	// Access certification channel
	console.log('.....Connecting to channel - pharmachannel');
	const channel = await gateway.getNetwork('pharmachannel');

	// Get instance of deployed Certnet contract
	// @param Name of chaincode
	// @param Name of smart contract
	console.log('.....Connecting to Pharmanet Smart Contract');
	return channel.getContract('pharmanet', 'org.pharma-network.pharmanet');
}

function disconnect() {
	console.log('.....Disconnecting from Fabric Gateway');
	gateway.disconnect();
}

/**
 * Get identity by role
 * @param role
 */
function getIdentity(role){
    switch (role) {
        case 'manufacturer':
            return __dirname + '/../../identity/manufacturer';
            break;
        case 'distributor':
            return __dirname + '/../../identity/distributor';
            break;
    	case 'retailer':
            return __dirname + '/../../identity/retailer';
            break;
    	case 'consumer':
            return __dirname + '/../../identity/consumer';
            break;
    	case 'transporter':
            return __dirname + '/../../identity/transporter';
            break;
        default:
            throw new Error('Invalid role for identity');
    }
}

/**
 * Get username by role
 * @param role
 */
function getUsername(role){
    switch (role) {
        case 'manufacturer':
            return 'MANUFACTURER_ADMIN';
            break;
        case 'distributor':
            return 'DISTRIBUTOR_ADMIN';
            break;
    	case 'retailer':
            return 'RETAILER_ADMIN';
            break;
        case 'consumer':
            return 'CONSUMER_ADMIN';
            break;
    	case 'transporter':
            return 'TRANSPORTER_ADMIN';
            break;
        default:
            throw new Error('Invalid role for username');
    }
}

/**
 * Get Connection profile by role
 * @param role
 */
function getConnectionProfile(role){
    switch (role) {
        case 'manufacturer':
            return __dirname + '/../../profiles/manufacturer.yaml';
            break;
        case 'distributor':
            return __dirname + '/../../profiles/distributor.yaml';
            break;
        case 'retailer':
            return __dirname + '/../../profiles/retailer.yaml';
            break;
        case 'consumer':
    		return __dirname + '/../../profiles/consumer.yaml';
        	break;
        case 'transporter':
    		return __dirname + '/../../profiles/transporter.yaml';
        	break;
        default:
            throw new Error('Invalid role for connection profile');
    }
}

module.exports.getContractInstance = getContractInstance;
module.exports.disconnect = disconnect;