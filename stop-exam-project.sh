#!/bin/bash

echo "===================================="
echo "Stopping Exam Paper Distribution System"
echo "===================================="

echo ""
echo "Stopping Backend API..."
pkill -f "node server.js"

echo "Stopping React Dashboard..."
pkill -f "vite"

# Optional: stop any npm process started for the dashboard
pkill -f "npm run dev"

echo ""
echo "Stopping Hyperledger Fabric Network..."

cd ~/hyperledger/fabric-samples/test-network
./network.sh down

echo ""
echo "===================================="
echo "Project stopped successfully!"
echo "===================================="
