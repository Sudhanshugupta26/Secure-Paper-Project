const express = require("express");
const cors = require("cors");
const { Gateway, Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Support large base64 file payloads

/* -----------------------------
   PERSISTENT DATABASE SYSTEM
   -----------------------------*/
const DB_PATH = path.join(__dirname, "db.json");

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initialDb = {
      centers: [
        {
          id: "CENTER_01",
          name: "Lucknow Center",
          location: "Lucknow",
          status: "APPROVED",
          printKey: "KEY123"
        },
        {
          id: "CENTER_02",
          name: "Kanpur Center",
          location: "Kanpur",
          status: "APPROVED",
          printKey: "KEY456"
        }
      ],
      applications: [
        {
          id: "CENTER_03",
          name: "Delhi Center",
          location: "Delhi",
          status: "PENDING",
          votes: []
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), "utf8");
    return initialDb;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch (err) {
    console.error("Error reading database file, using fallback empty state", err);
    return { centers: [], applications: [] };
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving database file", err);
  }
}

async function registerAndEnrollCenter(centerId) {
  try {
    const ccpPath = path.resolve(
      "../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json"
    );
    if (!fs.existsSync(ccpPath)) {
      console.warn("Connection profile not found, skipping CA enrollment");
      return;
    }
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const caInfo = ccp.certificateAuthorities["ca.org1.example.com"];
    if (!caInfo) {
      console.warn("CA info not found in connection profile, skipping CA enrollment");
      return;
    }
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caInfo.tlsCACerts.pem, verify: false },
      caInfo.caName
    );
    const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, "wallet"));

    // Check if center identity already exists
    const identity = await wallet.get(centerId);
    if (identity) {
      console.log(`Identity for center ${centerId} already exists in wallet.`);
      return;
    }

    // Retrieve CA registrar admin context (distinct from peer admin appUser)
    let adminIdentity = await wallet.get("admin");
    if (!adminIdentity) {
      console.log("Admin identity 'admin' not found in wallet, enrolling it from CA...");
      const enrollment = await ca.enroll({
        enrollmentID: "admin",
        enrollmentSecret: "adminpw"
      });
      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes()
        },
        mspId: "Org1MSP",
        type: "X.509"
      };
      await wallet.put("admin", x509Identity);
      adminIdentity = x509Identity;
    }

    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, "admin");

    // Register center
    const secret = await ca.register(
      {
        affiliation: "org1.department1",
        enrollmentID: centerId,
        role: "client"
      },
      adminUser
    );

    // Enroll center
    const enrollment = await ca.enroll({
      enrollmentID: centerId,
      enrollmentSecret: secret
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes()
      },
      mspId: "Org1MSP",
      type: "X.509"
    };

    await wallet.put(centerId, x509Identity);
    console.log(`Successfully registered and enrolled center ${centerId} in Fabric CA!`);
  } catch (err) {
    console.error(`Fabric CA registration failed for center ${centerId}:`, err.message);
  }
}

/* -----------------------------
   BASIC ROUTES
   -----------------------------*/

app.get("/", (req, res) => {
  res.send("Exam Paper API is running!");
});

/* -----------------------------
   BLOCKCHAIN PAPERS (READ ALL)
   -----------------------------*/

app.get("/papers", async (req, res) => {
  try {
    const ccpPath = path.resolve(
      "../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json"
    );

    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const wallet = await Wallets.newFileSystemWallet('./wallet');
    const gateway = new Gateway();

    await gateway.connect(ccp, {
      wallet,
      identity: "appUser",
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("exampaper");

    const result = await contract.evaluateTransaction("GetAllPapers");
    await gateway.disconnect();

    res.json(JSON.parse(result.toString()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* -----------------------------
   UPLOAD PAPER GATEWAY
   -----------------------------*/

app.post("/upload", async (req, res) => {
  const { paperId, originalFileName, fileData, unlockTime } = req.body;

  if (!paperId || !originalFileName || !fileData || !unlockTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Decode base64 fileData
    const paperBuffer = Buffer.from(fileData, "base64");

    // 2. Original hash
    const originalHash = crypto
      .createHash("sha256")
      .update(paperBuffer)
      .digest("hex");

    // 3. Encrypt paper with AES-256
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    const encryptedData = Buffer.concat([
      cipher.update(paperBuffer),
      cipher.final()
    ]);
    const encryptedBuffer = Buffer.concat([iv, encryptedData]);

    // 4. Encrypted hash
    const encryptedHash = crypto
      .createHash("sha256")
      .update(encryptedBuffer)
      .digest("hex");

    // 5. Upload encryptedBuffer to IPFS with Local Mock Storage fallback
    let ipfsCid;
    try {
      const formData = new FormData();
      const fileBlob = new Blob([encryptedBuffer]);
      formData.append("file", fileBlob, "encrypted-paper");

      const ipfsResponse = await fetch("http://172.30.176.1:5001/api/v0/add", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(4000)
      });

      if (ipfsResponse.ok) {
        const ipfsResult = await ipfsResponse.json();
        ipfsCid = ipfsResult.Hash;
        console.log("Uploaded to IPFS. CID:", ipfsCid);
      } else {
        throw new Error(`IPFS responded with status ${ipfsResponse.status}`);
      }
    } catch (ipfsError) {
      console.warn("IPFS upload failed, using local mock storage fallback:", ipfsError.message);
      // Local fallback
      const mockCid = `mock_cid_${crypto.createHash("sha256").update(encryptedBuffer).digest("hex").substring(0, 16)}`;
      const mockIpfsDir = path.join(__dirname, "mock_ipfs");
      if (!fs.existsSync(mockIpfsDir)) {
        fs.mkdirSync(mockIpfsDir);
      }
      fs.writeFileSync(path.join(mockIpfsDir, mockCid), encryptedBuffer);
      ipfsCid = mockCid;
    }

    // 6. Connect to Fabric and submit transaction
    const ccpPath = path.resolve(
      "../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json"
    );
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const wallet = await Wallets.newFileSystemWallet("./wallet");
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "appUser",
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("exampaper");

    const result = await contract.submitTransaction(
      "UploadPaper",
      paperId,
      originalHash,
      encryptedHash,
      ipfsCid,
      aesKey.toString("hex"),
      unlockTime
    );

    await gateway.disconnect();

    res.json({
      message: "Paper uploaded successfully and committed to blockchain!",
      paperId,
      originalHash,
      encryptedHash,
      ipfsCid,
      blockchainResult: JSON.parse(result.toString())
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* -----------------------------
   UNLOCK PAPER
   -----------------------------*/

app.post("/papers/:id/unlock", async (req, res) => {
  const paperId = req.params.id;

  try {
    const ccpPath = path.resolve(
      "../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json"
    );
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const wallet = await Wallets.newFileSystemWallet('./wallet');
    const gateway = new Gateway();

    await gateway.connect(ccp, {
      wallet,
      identity: "appUser",
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("exampaper");

    const result = await contract.submitTransaction("UnlockPaper", paperId);
    await gateway.disconnect();

    res.json({
      message: "Paper unlocked successfully on blockchain!",
      paper: JSON.parse(result.toString())
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* -----------------------------
   GET ALL CENTERS (CONSORTIUM)
   -----------------------------*/

app.get("/centers", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.centers);
});

/* -----------------------------
   APPLY NEW CENTER
   -----------------------------*/

app.post("/centers/apply", (req, res) => {
  const { id, name, location } = req.body;

  const dbData = loadDb();
  dbData.applications.push({
    id,
    name,
    location: location || "UNKNOWN",
    status: "PENDING",
    votes: []
  });
  saveDb(dbData);

  res.json({ message: "Application submitted" });
});

/* -----------------------------
   GET APPLICATIONS
   -----------------------------*/

app.get("/centers/applications", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.applications);
});

/* -----------------------------
   VOTING SYSTEM (CONSORTIUM GOVERNANCE)
   -----------------------------*/

app.post("/centers/vote", (req, res) => {
  const { centerId, vote } = req.body;

  const dbData = loadDb();
  const appData = dbData.applications.find((a) => a.id === centerId);

  if (!appData) {
    return res.status(404).json({ error: "Application not found" });
  }

  appData.votes.push(vote);

  const approve = appData.votes.filter((v) => v === "APPROVE").length;
  const reject = appData.votes.filter((v) => v === "REJECT").length;

  if (approve >= 2) {
    appData.status = "APPROVED";

    // Prevent duplicate center addition
    if (!dbData.centers.some((c) => c.id === appData.id)) {
      dbData.centers.push({
        id: appData.id,
        name: appData.name,
        location: appData.location || "UNKNOWN",
        status: "APPROVED",
        printKey: "AUTO_" + Math.random().toString(36).substring(2, 8)
      });
      // Dynamically register & enroll center in Fabric CA
      registerAndEnrollCenter(appData.id);
    }
  }

  if (reject >= 2) {
    appData.status = "REJECTED";
  }

  saveDb(dbData);

  res.json({
    message: "Vote recorded",
    application: appData
  });
});

/* -----------------------------
   SECURE PRINT SYSTEM (WITH BLOCKCHAIN LOGGING)
   -----------------------------*/

app.post("/print", async (req, res) => {
  const { paperId, centerId, printKey } = req.body;

  const dbData = loadDb();
  const center = dbData.centers.find((c) => c.id === centerId);

  if (!center) {
    return res.status(400).json({ error: "Invalid center" });
  }

  if (center.printKey !== printKey) {
    return res.status(403).json({ error: "Unauthorized print key" });
  }

  try {
    const ccpPath = path.resolve(
      "../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json"
    );
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const wallet = await Wallets.newFileSystemWallet('./wallet');

    // Dynamic identity select - if specific identity is not enrolled, fallback to appUser
    const hasCenterIdentity = await wallet.get(centerId);
    const identityToUse = hasCenterIdentity ? centerId : "appUser";

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: identityToUse,
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("exampaper");

    // Submit LogPrint to Fabric Network
    const result = await contract.submitTransaction("LogPrint", paperId);
    await gateway.disconnect();

    res.json({
      message: "Print approved and logged on blockchain successfully!",
      paperId,
      centerId,
      log: JSON.parse(result.toString())
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* -----------------------------
   START SERVER
   -----------------------------*/

app.listen(3001, () => {
  console.log("API running on http://localhost:3001");
});