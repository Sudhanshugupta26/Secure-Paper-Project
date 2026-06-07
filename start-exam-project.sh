#!/bin/bash

echo "Starting Fabric Network (CAs, Channel: mychannel)..."
cd ~/hyperledger/fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca

echo "Deploying exampaper Chaincode..."
./network.sh deployCC -ccn exampaper -ccp ../exam-paper-chaincode -ccl javascript

echo "Setting environment..."
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

echo "Clearing stale wallets and enrolling admin identities..."
cd ~/hyperledger/exam-paper-api
rm -rf wallet/*
node enrollAdmin.js

cd ~/hyperledger/exam-paper-client
rm -rf wallet/*
node enrollAdmin.js
node registerCenter.js

echo "Starting API..."
cd ~/hyperledger/exam-paper-api
pkill -f "node server.js"
nohup node server.js > api.log 2>&1 &

sleep 3

echo "Starting Dashboard..."
cd ~/hyperledger/exam-paper-dashboard
pkill -f "vite"
pkill -f "npm run dev"
nohup npm run dev > dashboard.log 2>&1 &

echo ""
echo "Started successfully!"
echo "Dashboard: http://localhost:5173"
echo "Backend:   http://localhost:3001"
