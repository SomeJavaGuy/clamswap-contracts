const { assert } = require("chai");
const { expectRevert, time } = require("@openzeppelin/test-helpers");
const { accounts, contract } = require("@openzeppelin/test-environment");

const ClamToken = contract.fromArtifact("ClamToken");
const MasterChef = contract.fromArtifact("MasterChef");
const MockBEP20 = contract.fromArtifact("MockBEP20");
const Pearl = contract.fromArtifact('Pearl');

describe("MasterChef", () => {
  const [alice, bob, dev, minter, feeAddress] = accounts;

  beforeEach(async () => {
    this.clam = await ClamToken.new({ from: minter });
    this.pearl = await Pearl.new(this.clam.address, { from: minter });
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

  it("real case", async () => {
    this.lp4 = await MockBEP20.new("LPToken", "LP4", "1000000", {
      from: minter,
    });
    this.lp5 = await MockBEP20.new("LPToken", "LP5", "1000000", {
      from: minter,
    });
    this.lp6 = await MockBEP20.new("LPToken", "LP6", "1000000", {
      from: minter,
    });
    this.lp7 = await MockBEP20.new("LPToken", "LP7", "1000000", {
      from: minter,
    });
    this.lp8 = await MockBEP20.new("LPToken", "LP8", "1000000", {
      from: minter,
    });
    this.lp9 = await MockBEP20.new("LPToken", "LP9", "1000000", {
      from: minter,
    });

    const depositFeeBP = 0

    await this.chef.add("2000", this.lp1.address, depositFeeBP,  true, { from: minter });
    await this.chef.add("1000", this.lp2.address, depositFeeBP,  true, { from: minter });
    await this.chef.add("500", this.lp3.address,  depositFeeBP, true, { from: minter });
    await this.chef.add("500", this.lp4.address,  depositFeeBP, true, { from: minter });
    await this.chef.add("500", this.lp5.address,  depositFeeBP, true, { from: minter });
    await this.chef.add("500", this.lp6.address,  depositFeeBP, true, { from: minter });
    await this.chef.add("100", this.lp7.address,  depositFeeBP, true, { from: minter });
    await this.chef.add("100", this.lp8.address,  depositFeeBP, true, { from: minter });
    await this.chef.add("100", this.lp9.address,  depositFeeBP, true, { from: minter });
    assert.equal((await this.chef.poolLength()).toString(), "9");

    await time.advanceBlockTo("170");
    await this.lp1.approve(this.chef.address, "1000", { from: alice });
    assert.equal((await this.clam.balanceOf(alice)).toString(), "0");

    await this.chef.deposit(0, "20", { from: alice });
    await this.chef.withdraw(0, "20", { from: alice });
    assert.equal((await this.clam.balanceOf(alice)).toString(), "377");

    await this.clam.approve(this.chef.address, "1000", { from: alice });
    await this.chef.enterStaking("20", { from: alice });
    await this.chef.enterStaking("0", { from: alice });
    await this.chef.enterStaking("0", { from: alice });
    await this.chef.enterStaking("0", { from: alice });
    assert.equal((await this.clam.balanceOf(alice)).toString(), "1508");
  });

  it("deposit/withdraw", async () => {
    const depositFeeBP = 0
    await this.chef.add("1000", this.lp1.address, depositFeeBP, true, { from: minter });
    await this.chef.add("1000", this.lp2.address, depositFeeBP, true, { from: minter });
    await this.chef.add("1000", this.lp3.address, depositFeeBP, true, { from: minter });

    await this.lp2.approve(this.chef.address, "100", { from: alice });
    await this.chef.deposit(1, "20", { from: alice });
    await this.chef.deposit(1, "0", { from: alice });
    await this.chef.deposit(1, "40", { from: alice });
    await this.chef.deposit(1, "0", { from: alice });
    assert.equal((await this.lp2.balanceOf(alice)).toString(), "1940");
    await this.chef.withdraw(1, "10", { from: alice });
    assert.equal((await this.lp2.balanceOf(alice)).toString(), "1950");
    assert.equal((await this.clam.balanceOf(alice)).toString(), "1332");
    assert.equal((await this.clam.balanceOf(dev)).toString(), "664");

    await this.lp2.approve(this.chef.address, "100", { from: bob });
    assert.equal((await this.lp2.balanceOf(bob)).toString(), "2000");
    await this.chef.deposit(1, "50", { from: bob });
    assert.equal((await this.lp2.balanceOf(bob)).toString(), "1950");
    await this.chef.deposit(1, "0", { from: bob });
    assert.equal((await this.clam.balanceOf(bob)).toString(), "166");
    await this.chef.emergencyWithdraw(1, { from: bob });
    assert.equal((await this.lp2.balanceOf(bob)).toString(), "2000");
  });

  it("staking/unstaking", async () => {
    const depositFeeBP = 0
    await this.chef.add("1000", this.lp1.address, depositFeeBP, true, { from: minter });
    await this.chef.add("1000", this.lp2.address, depositFeeBP, true, { from: minter });
    await this.chef.add("1000", this.lp3.address, depositFeeBP, true, { from: minter });

    await this.lp1.approve(this.chef.address, "1000", { from: alice });
    await this.chef.deposit(0, "200", { from: alice }); //0
    await this.chef.withdraw(0, "200", { from: alice }); //1

    await this.clam.approve(this.chef.address, "1000", { from: alice });
    await this.chef.enterStaking("240", { from: alice }); //3
    assert.equal((await this.pearl.balanceOf(alice)).toString(), "240");
    assert.equal((await this.clam.balanceOf(alice)).toString(), "333");
    await this.chef.enterStaking("10", { from: alice }); //4
    assert.equal((await this.pearl.balanceOf(alice)).toString(), "250");
    assert.equal((await this.clam.balanceOf(alice)).toString(), "666");

    await this.chef.leaveStaking("250", { from: alice });
    assert.equal((await this.pearl.balanceOf(alice)).toString(), "0");
    assert.equal((await this.clam.balanceOf(alice)).toString(), "999");
  });

  it("update multiplier", async () => {
    const depositFeeBP = 0

    await this.chef.add("1000", this.lp1.address, depositFeeBP, true, { from: minter });
    await this.chef.add("1000", this.lp2.address, depositFeeBP, true, { from: minter });
    await this.chef.add("1000", this.lp3.address, depositFeeBP, true, { from: minter });

    await this.lp1.approve(this.chef.address, "1000", { from: alice });
    await this.lp1.approve(this.chef.address, "1000", { from: bob });
    await this.chef.deposit(0, "100", { from: alice });
    await this.chef.deposit(0, "100", { from: bob });
    await this.chef.deposit(0, "0", { from: alice });
    await this.chef.deposit(0, "0", { from: bob });

    await this.clam.approve(this.chef.address, "1000", { from: alice });
    await this.clam.approve(this.chef.address, "1000", { from: bob });
    await this.chef.enterStaking("50", { from: alice });
    await this.chef.enterStaking("100", { from: bob });

    await this.chef.updateMultiplier("0", { from: minter });

    await this.chef.enterStaking("0", { from: alice });
    await this.chef.enterStaking("0", { from: bob });
    await this.chef.deposit(0, "0", { from: alice });
    await this.chef.deposit(0, "0", { from: bob });

    assert.equal((await this.clam.balanceOf(alice)).toString(), "1365");
    assert.equal((await this.clam.balanceOf(bob)).toString(), "966");

    await time.advanceBlockTo("265");

    await this.chef.enterStaking("0", { from: alice });
    await this.chef.enterStaking("0", { from: bob });
    await this.chef.deposit(0, "0", { from: alice });
    await this.chef.deposit(0, "0", { from: bob });

    assert.equal((await this.clam.balanceOf(alice)).toString(), "1365");
    assert.equal((await this.clam.balanceOf(bob)).toString(), "966");

    await this.chef.leaveStaking("50", { from: alice });
    await this.chef.leaveStaking("100", { from: bob });
    await this.chef.withdraw(0, "100", { from: alice });
    await this.chef.withdraw(0, "100", { from: bob });
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
