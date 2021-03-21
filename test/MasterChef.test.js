const { assert } = require("chai");
const { expectRevert, time } = require("@openzeppelin/test-helpers");
const { accounts, contract } = require("@openzeppelin/test-environment");

const ClamToken = contract.fromArtifact("ClamToken");
const MasterChef = contract.fromArtifact("MasterChef");
const MockBEP20 = contract.fromArtifact("MockBEP20");
const PearlToken = contract.fromArtifact('PearlToken');

describe("MasterChef", () => {
  const [alice, bob, dev, minter, feeAddress] = accounts;

  beforeEach(async () => {
    this.clam = await ClamToken.new({ from: minter });
    this.pearl = await PearlToken.new(this.clam.address, { from: minter });
    this.lp1 = await MockBEP20.new("LPToken", "LP1", "1000000", {
      from: minter,
    });
    this.lp2 = await MockBEP20.new("LPToken", "LP2", "1000000", {
      from: minter,
    });
    this.lp3 = await MockBEP20.new("LPToken", "LP3", "1000000", {
      from: minter,
    });
    this.chef = await MasterChef.new(
      this.clam.address,
      this.pearl.address,
      dev,
      feeAddress,
      "1000",
      "100",
      { from: minter }
    );
    await this.clam.transferOwnership(this.chef.address, { from: minter });
    await this.pearl.transferOwnership(this.chef.address, { from: minter });

    await this.lp1.transfer(bob, "2000", { from: minter });
    await this.lp2.transfer(bob, "2000", { from: minter });
    await this.lp3.transfer(bob, "2000", { from: minter });

    await this.lp1.transfer(alice, "2000", { from: minter });
    await this.lp2.transfer(alice, "2000", { from: minter });
    await this.lp3.transfer(alice, "2000", { from: minter });
  });

  it("cannot add same pool twice+", async () => {
    await this.chef.add("500", this.lp3.address, 0, true, { from: minter });

    await expectRevert(this.chef.add("500", this.lp3.address, 0, true, { from: minter }), "nonDuplicated: duplicated.");
  });

  it("should allow dev and only dev to update dev", async () => {
    assert.equal((await this.chef.devaddr()).valueOf(), dev);
    await expectRevert(this.chef.dev(bob, { from: bob }), "dev: wut?");
    await this.chef.dev(bob, { from: dev });
    assert.equal((await this.chef.devaddr()).valueOf(), bob);
    await this.chef.dev(alice, { from: bob });
    assert.equal((await this.chef.devaddr()).valueOf(), alice);
  });

  it("adds pools with deposit fee", async () => {
    const depositFeeBP = 400 // 4%
    await this.chef.add("2000", this.lp1.address, depositFeeBP,  true, { from: minter });

    await this.lp1.approve(this.chef.address, "1000", { from: alice });
    assert.equal((await this.clam.balanceOf(alice)).toString(), "0");

    await this.chef.deposit(0, "1000", { from: alice });
    assert.equal((await this.lp1.balanceOf(alice)).toString(), "1000");
    assert.equal((await this.lp1.balanceOf(feeAddress)).toString(), "40"); // 4% fee goes to the feeAddress
  });
});
