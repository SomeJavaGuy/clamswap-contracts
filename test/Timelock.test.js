const { assert } = require("chai");
const { expectRevert, time } = require('@openzeppelin/test-helpers');
const ethers = require('ethers');

const { accounts, contract } = require("@openzeppelin/test-environment");

const ClamToken = contract.fromArtifact("ClamToken");
const MasterChef = contract.fromArtifact("MasterChef");
const MockBEP20 = contract.fromArtifact("MockBEP20");
const Pearl = contract.fromArtifact('Pearl');
const Timelock = contract.fromArtifact('Timelock');

function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder();
    return abi.encode(types, values);
}

describe('Timelock', () => {
  const [alice, bob, carol, dev, minter, feeAddress] = accounts;

    beforeEach(async () => {
        this.clam = await ClamToken.new({ from: alice });
        this.timelock = await Timelock.new(bob, '28800', { from: alice }); // 8hours
    });

    it('should not allow non-owner to do operation', async () => {
        await this.clam.transferOwnership(this.timelock.address, { from: alice });
        await expectRevert(
            this.clam.transferOwnership(carol, { from: alice }),
            'Ownable: caller is not the owner',
        );
        await expectRevert(
            this.clam.transferOwnership(carol, { from: bob }),
            'Ownable: caller is not the owner',
        );
        await expectRevert(
            this.timelock.queueTransaction(
                this.clam.address, '0', 'transferOwnership(address)',
                encodeParameters(['address'], [carol]),
                (await time.latest()).add(time.duration.hours(6)),
                { from: alice },
            ),
            'Timelock::queueTransaction: Call must come from admin.',
        );
    });

    it('should do the timelock thing', async () => {
        await this.clam.transferOwnership(this.timelock.address, { from: alice });
        const eta = (await time.latest()).add(time.duration.hours(9));
        await this.timelock.queueTransaction(
            this.clam.address, '0', 'transferOwnership(address)',
            encodeParameters(['address'], [carol]), eta, { from: bob },
        );
        await time.increase(time.duration.hours(1));
        await expectRevert(
            this.timelock.executeTransaction(
                this.clam.address, '0', 'transferOwnership(address)',
                encodeParameters(['address'], [carol]), eta, { from: bob },
            ),
            "Timelock::executeTransaction: Transaction hasn't surpassed time lock.",
        );
        await time.increase(time.duration.hours(8));
        await this.timelock.executeTransaction(
            this.clam.address, '0', 'transferOwnership(address)',
            encodeParameters(['address'], [carol]), eta, { from: bob },
        );
        assert.equal((await this.clam.owner()).valueOf(), carol);
    });

    it('should also work with MasterChef', async () => {
        this.lp1 = await MockBEP20.new('LPToken', 'LP1', '10000000000', { from: minter });
        this.lp2 = await MockBEP20.new('LPToken', 'LP2', '10000000000', { from: minter });
        this.pearl = await Pearl.new(this.clam.address, { from: minter });

        this.chef = await MasterChef.new(this.clam.address, this.pearl.address, dev, feeAddress,  '1000', '0', { from: alice });
        await this.clam.transferOwnership(this.chef.address, { from: alice });
        await this.pearl.transferOwnership(this.chef.address, { from: minter });
        await this.chef.add('100', this.lp1.address, 0, true, { from: alice });
        await this.chef.transferOwnership(this.timelock.address, { from: alice });
        await expectRevert(
            this.chef.add('100', this.lp1.address, 0, true, { from: alice }),
            "revert Ownable: caller is not the owner",
        );

        const eta = (await time.latest()).add(time.duration.hours(9));
        await this.timelock.queueTransaction(
            this.chef.address, '0', 'transferOwnership(address)',
            encodeParameters(['address'], [minter]), eta, { from: bob },
        );

        await time.increase(time.duration.hours(9));
        await this.timelock.executeTransaction(
            this.chef.address, '0', 'transferOwnership(address)',
            encodeParameters(['address'], [minter]), eta, { from: bob },
        );
        await expectRevert(
            this.chef.add('100', this.lp2.address, 0, true, { from: alice }),
            "revert Ownable: caller is not the owner",
        );
        await this.chef.add('100', this.lp2.address, 0, true, { from: minter })
    });
});