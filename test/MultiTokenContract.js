const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiToken Contract", () =>{
  let multiTokenContract, multiTokenContractAddress;
  let owner, addr1, addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the MultiToken contract
    const MultiToken = await ethers.getContractFactory("MultiToken");
    multiTokenContract = await MultiToken.deploy("https://example.com/");
    multiTokenContractAddress = await multiTokenContract.getAddress();
    console.log(`Contract Address: ${multiTokenContractAddress}`);
  });

  describe("Successful scenarios", async() =>{
    let txn;

    it("should mint multiple token types in a single transaction", async() => {
      const ids = [1, 2, 3];
      const amounts = [100, 1, 50]; // Fungible (100 and 50) and non-fungible (1)

      txn = await multiTokenContract.mintBatch(owner.address, ids, amounts, "0x");
      await txn.wait();

      expect(await multiTokenContract.balanceOf(owner.address, 1)).to.equal(100);
      expect(await multiTokenContract.balanceOf(owner.address, 2)).to.equal(1);
      expect(await multiTokenContract.balanceOf(owner.address, 3)).to.equal(50);
    });

    it("should correctly update total supply when minting", async() => {
      await multiTokenContract.mint(owner.address, 1, 50, "0x");
      expect(await multiTokenContract.totalSupply(1)).to.equal(50);
    });

    it("should perform batch transfers", async() => {
      const ids = [1, 2];
      const amounts = [50, 1];

      txn = await multiTokenContract.mintBatch(owner.address, ids, amounts, "0x");
      await txn.wait();
      txn = await multiTokenContract.safeBatchTransferFrom(owner.address, addr1.address, ids, amounts, "0x");
      await txn.wait();

      expect(await multiTokenContract.balanceOf(addr1.address, 1)).to.equal(50);
      expect(await multiTokenContract.balanceOf(addr1.address, 2)).to.equal(1);
    });

    it("should allow burning of fungible tokens", async() => {
      txn = await multiTokenContract.mint(addr1.address, 1, 100, "0x");
      await txn.wait();
      expect(await multiTokenContract.balanceOf(addr1.address, 1)).to.equal(100);

      txn =  await multiTokenContract.connect(addr1).burn(addr1.address, 1, 50);
      await txn.wait();

      expect(await multiTokenContract.balanceOf(addr1.address, 1)).to.equal(50);
      expect(await multiTokenContract.totalSupply(1)).to.equal(50);
    });

    it("should allow burning of non-fungible tokens", async() => {
      txn = await multiTokenContract.mint(addr1.address, 2, 1, "0x"); // Non-fungible token
      await txn.wait();
      expect(await multiTokenContract.balanceOf(addr1.address, 2)).to.equal(1);

      txn = await multiTokenContract.connect(addr1).burn(addr1.address, 2, 1);
      await txn.wait();

      expect(await multiTokenContract.balanceOf(addr1.address, 2)).to.equal(0);
      expect(await multiTokenContract.totalSupply(2)).to.equal(0);
    });

    it("should update and retrieve URI for a token type", async () => {
      const newURI = "https://newuri.com/";
      txn = await multiTokenContract.setURI(1, newURI);
      await txn.wait();
      
      // Expect URI to be newURI with id and .json appended
      expect(await multiTokenContract.uri(1)).to.equal(newURI);
    });
    

    it("should correctly calculate total supply after burning", async() => {
      txn =  await multiTokenContract.mint(owner.address, 1, 100, "0x");
      await txn.wait();

      expect(await multiTokenContract.totalSupply(1)).to.equal(100);

      txn = await multiTokenContract.burn(owner.address, 1, 50);
      await txn.wait();

      expect(await multiTokenContract.totalSupply(1)).to.equal(50);

      txn = await multiTokenContract.burn(owner.address, 1, 50);
      await txn.wait();

      expect(await multiTokenContract.totalSupply(1)).to.equal(0);
    });
  });

  describe("Failure scenarios", async() => {
    let txn;
    it("should revert if trying to mint with mismatched arrays", async() => {
      const ids = [1, 2];
      const amounts = [100]; // Mismatched arrays (ids has 2 items, amounts has 1)

      await expect(
        multiTokenContract.mintBatch(owner.address, ids, amounts, "0x")
      ).to.revertedWithCustomError;
    });

    it("should revert batch transfers if sender has insufficient balance", async() => {
      const ids = [1, 2];
      const amounts = [50, 1];

      txn =  await multiTokenContract.mintBatch(owner.address, ids, amounts, "0x");
      await txn.wait();
      // Attempt transfer with insufficient balance
      await expect(
        multiTokenContract.connect(addr1).safeBatchTransferFrom(owner.address, addr1.address, ids, [51, 1], "0x")
      ).to.revertedWith("Insufficient balance");
    });

    it("should revert when non-owner tries to set URI", async() => {
      const newURI = "https://newuri.com/";

      await expect(
        multiTokenContract.connect(addr1).setURI(1, newURI)
      ).to.revertedWith("Not the owner");
    });

    it("should revert if trying to burn more tokens than owned", async() => {
      txn = await multiTokenContract.mint(addr1.address, 1, 10, "0x"); // Mint 10 tokens to addr1
      await txn.wait();

      await expect(
        multiTokenContract.connect(addr1).burn(addr1.address, 1, 20) // Attempt to burn 20 tokens
      ).to.revertedWith("Insufficient balance to burn");
    });

    it("should revert if trying to transfer tokens from a different owner", async() => {
      const ids = [1, 2];
      const amounts = [50, 1];

      txn =  await multiTokenContract.mintBatch(owner.address, ids, amounts, "0x");
      await txn.wait()
      await expect(
        multiTokenContract.safeBatchTransferFrom(addr1.address, addr2.address, ids, amounts, "0x")
      ).to.revertedWith("Insufficient balance");
    });
  });
});
