const fs = require('fs');
const crypto = require('crypto');
const { create } = require('ipfs-http-client');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');

async function main() {
    try {
        console.log("Reading paper...");

        const paperBuffer = fs.readFileSync('./sample-paper.txt');

        // Original hash
        const originalHash = crypto
            .createHash('sha256')
            .update(paperBuffer)
            .digest('hex');

        console.log("Original Hash:", originalHash);

        // Encrypt paper (demo AES key)
        const aesKey = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            aesKey,
            iv
        );

        const encryptedData = Buffer.concat([
            cipher.update(paperBuffer),
            cipher.final()
        ]);

        const encryptedBuffer = Buffer.concat([
            iv,
            encryptedData
        ]);

        // Hash encrypted file
        const encryptedHash = crypto
            .createHash('sha256')
            .update(encryptedBuffer)
            .digest('hex');

        console.log("Encrypted Hash:", encryptedHash);

        // Upload encrypted file to IPFS
        console.log("Uploading to IPFS...");

        const ipfs = create({
            url: 'http://172.30.176.1:5001/api/v0',
            timeout: 3000
        });

        const result = await ipfs.add(encryptedBuffer);

        console.log("IPFS CID:", result.cid.toString());

        // Connect to Fabric
        console.log("Connecting to Fabric...");

        const ccpPath = path.resolve(
            '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
        );

        const ccp = JSON.parse(fs.readFileSync(ccpPath));

        const wallet = await Wallets.newFileSystemWallet('./wallet');

        const gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: 'admin',
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('exampaper');

        console.log("Submitting to blockchain...");

        const resultTx = await contract.submitTransaction(
            'UploadPaper',
            'TEST_PRINT_LOG_001',
            originalHash,
            encryptedHash,
            result.cid.toString(),
            aesKey.toString('hex'),
            '2025-01-01T09:00:00Z'
        );

        console.log(resultTx.toString());

        console.log("SUCCESS");

        await gateway.disconnect();

    } catch (error) {
        console.error(error);
    }
}

main();