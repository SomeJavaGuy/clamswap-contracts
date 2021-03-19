const { assert } = require("chai");
const { accounts, contract } = require('@openzeppelin/test-environment');

const ClamToken = contract.fromArtifact('ClamToken');

describe('ClamToken', () => {
  const [alice, minter ] = accounts

    beforeEach(async () => {
        this.cake = await ClamToken.new({ from: minter });
    });


    it('mint', async () => {
        await this.cake.mint(alice, 1000, { from: minter });
        assert.equal((await this.cake.balanceOf(alice)).toString(), '1000');
    })
});