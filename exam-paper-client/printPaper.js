const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');

async function main() {
    try {
        console.log("Connecting to Fabric as center1...");

        const ccpPath = path.resolve(
            '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
        );

        const ccp = JSON.parse(fs.readFileSync(ccpPath));

        const wallet = await Wallets.newFileSystemWallet('./wallet');

        const gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: 'center1',
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('exampaper');

        console.log("Submitting print log...");

        const result = await contract.submitTransaction(
            'LogPrint',
            'TEST_PRINT_LOG_001'
        );

        console.log(result.toString());

        console.log("Print logged successfully!");

        await gateway.disconnect();

    } catch (error) {
        console.error(error);
    }
}

main();
