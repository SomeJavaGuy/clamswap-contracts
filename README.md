# Clam Swap Contracts

## prepare the environment

create a file `.env` with the mnemonic, as in `.env-example`

## setup using hardhat

- `npm install`
- `npm run compile`

## Test

- `npm test`


## TODO

```
By the end of the weekend, the goal is to have the following functional features:

1 - Users are able to mint Clam NFTs with 500 $PEARL.

2- Users will be able to stake a Clam NFT in a farm to be able to create a Pearl NFT in x(random) number of days. For demo purposes, this can be set to seconds.

3- Users will be able to see the Clams / Pearls in their wallet through the vault interface.

4- Users will be able to stake $PEARL into a $PEARL pool on the yield farming (vault) interface. Other pools will be displayed but will just be static non-operational placeholders.
That's the updated scope. Let me know if you think it needs to change

```

1.
- PEARL ERC20 contract
- CLAM ERC721 contract

2.
- FARM contract (Masterchef?)
- PEARL ERC721 contract

3. and 4.
Farm contract.