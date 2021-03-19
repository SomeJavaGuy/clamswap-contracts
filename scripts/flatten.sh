#!/usr/bin/env bash
mkdir flats
rm -rf flats/*

./node_modules/.bin/truffle-flattener contracts/token/ClamToken.sol > flats/ClamToken.sol
./node_modules/.bin/truffle-flattener contracts/oracle/PearlToken.sol > flats/PearlToken.sol
./node_modules/.bin/truffle-flattener contracts/oracle/MasterChef.sol > flats/MasterChef.sol
./node_modules/.bin/truffle-flattener contracts/oracle/Timelock.sol > flats/Timelock.sol
