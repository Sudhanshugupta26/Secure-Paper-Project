const fs = require('fs');
const crypto = require('crypto');
const { create } = require('ipfs-http-client');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');

async function main() {
    try {
        const paperId = 'NEET2026_REAL_1779196717654';

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

        console.log("Reading paper metadata from blockchain...");

        const result = await contract.evaluateTransaction(
            'ReadPaper',
            paperId
        );

        const paper = JSON.parse(result.toString());

        console.log(paper);

        const ipfsCid = paper.ipfsCid;
        const encryptedHash = paper.encryptedHash;
        const originalHash = paper.originalHash;
        const aesKeyHex = paper.encryptedKeyRef;

        console.log("Downloading encrypted file from IPFS...");

        const ipfs = create({
            url: 'http://172.30.176.1:5001/api/v0'
        });

        const chunks = [];

        for await (const chunk of ipfs.cat(ipfsCid)) {
            chunks.push(chunk);
        }

        const encryptedBuffer = Buffer.concat(chunks);

        const calcEncryptedHash = crypto
            .createHash('sha256')
            .update(encryptedBuffer)
            .digest('hex');

        console.log("Encrypted hash verified:",
            calcEncryptedHash === encryptedHash
        );

        // decrypt
        const aesKey = Buffer.from(aesKeyHex, 'hex');

        const iv = encryptedBuffer.slice(0, 16);
        const actualEncryptedData = encryptedBuffer.slice(16);

        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            aesKey,
            iv
        );

        const decryptedBuffer = Buffer.concat([
            decipher.update(actualEncryptedData),
            decipher.final()
        ]);

        const calcOriginalHash = crypto
            .createHash('sha256')
            .update(decryptedBuffer)
            .digest('hex');

        console.log("Original hash verified:",
            calcOriginalHash === originalHash
        );

        fs.writeFileSync(
            'recovered-paper.txt',
            decryptedBuffer
        );

        console.log("Recovered paper saved!");

        await gateway.disconnect();

    } catch (error) {
        console.error(error);
    }
}

main();