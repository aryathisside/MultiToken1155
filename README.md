# MultiToken Contract

The **MultiToken** contract is an ERC-1155 smart contract that enables the creation, minting, transferring, and burning of multiple token types within a single contract. This is useful for projects requiring both fungible and non-fungible tokens. The contract also provides custom URI management, batch minting, and batch transferring features.

## Key Features

- **Batch Minting**: Allows the contract owner to mint multiple tokens (both fungible and non-fungible) in a single transaction.
- **Batch Transferring**: Supports the secure transfer of multiple tokens in a batch, ensuring the sender has sufficient balances.
- **Token URI Management**: The owner can set unique URIs for individual token types, enabling customized metadata for each token.
- **Burning**: Tokens can be burned (both single and batch) by the token owner or an approved address, reducing the token's total supply.
- **Total Supply Tracking**: Tracks the total supply of each token type, updating dynamically with minting and burning operations.

## Contract Structure

- `mintBatch`: Mints multiple token types in a single transaction, updating total supply accordingly.
- `mint`: Mints a single token type and updates its total supply.
- `safeBatchTransferFrom`: Performs a batch transfer of tokens, checking for sufficient balances.
- `burn` and `burnBatch`: Burns tokens, with checks for sufficient balances and owner approval.
- `setURI`: Allows the owner to set a specific URI for each token type.
- `totalSupply`: Returns the current total supply of a token type.
- `uri`: Returns the URI for a specific token, either custom-set or based on the base URI.

## Installation and Setup

To deploy, test, and interact with this contract, you need Node.js and Hardhat installed.

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>

### 2. Install dependencies
npm install

### 3. Compile the contract
npx hardhat compile



###1. Run the tests
npx hardhat test

### 2. Test Overview
The tests are written in JavaScript with the following scenarios:

**Successful Scenarios:**

- Minting multiple token types in a single transaction.
- Verifying total supply updates after minting.
- Performing batch transfers of tokens.
- Burning fungible and non-fungible tokens.
- Setting and retrieving custom URIs for tokens.

**Failure Scenarios:**

- Mismatched arrays during batch minting.
- Insufficient balance during batch transfers.
- Non-owner attempts to set URI.
- Attempting to burn more tokens than available.
- Unauthorized transfers.