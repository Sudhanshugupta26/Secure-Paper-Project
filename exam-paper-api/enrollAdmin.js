const { Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const wallet = await Wallets.newFileSystemWallet("./wallet");

    const basePath =
      "/home/sudhanshu_gupta26/hyperledger/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp";

    // Auto-find certificate file
    const certDir = path.join(basePath, "signcerts");
    const certFile = fs.readdirSync(certDir)[0];
    const certPath = path.join(certDir, certFile);

    // Auto-find private key file
    const keyDir = path.join(basePath, "keystore");
    const keyFile = fs.readdirSync(keyDir)[0];
    const keyPath = path.join(keyDir, keyFile);

    const cert = fs.readFileSync(certPath).toString();
    const key = fs.readFileSync(keyPath).toString();

    const identity = {
      credentials: {
        certificate: cert,
        privateKey: key,
      },
      mspId: "Org1MSP",
      type: "X.509",
    };

    await wallet.put("appUser", identity);

    console.log("✅ Wallet identity created successfully");
  } catch (error) {
    console.error(error);
  }
}

main();