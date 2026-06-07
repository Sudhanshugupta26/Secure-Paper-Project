const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const ccpPath = path.resolve(
            '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
        );

        const ccp = JSON.parse(fs.readFileSync(ccpPath));

        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const ca = new FabricCAServices(
            caInfo.url,
            { trustedRoots: caInfo.tlsCACerts.pem, verify: false },
            caInfo.caName
        );

        const wallet = await Wallets.newFileSystemWallet('./wallet');

        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('Admin identity missing');
            return;
        }

        const provider = wallet
            .getProviderRegistry()
            .getProvider(adminIdentity.type);

        const adminUser = await provider.getUserContext(
            adminIdentity,
            'admin'
        );

        // Register center1
        const secret = await ca.register(
            {
                affiliation: 'org1.department1',
                enrollmentID: 'center1',
                role: 'client'
            },
            adminUser
        );

        // Enroll center1
        const enrollment = await ca.enroll({
            enrollmentID: 'center1',
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes()
            },
            mspId: 'Org1MSP',
            type: 'X.509'
        };

        await wallet.put('center1', x509Identity);

        console.log('center1 enrolled successfully!');
    } catch (error) {
        console.error(error);
    }
}

main();