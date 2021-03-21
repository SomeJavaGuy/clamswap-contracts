// SPDX-License-Identifier: MIT

pragma solidity =0.6.12;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./ClamBase.sol";

contract ClamNftToken is ClamBase, ERC1155("") {
    /* ========== EVENTS ========== */

    /**
     * @dev Emitted when single `clamId` clam with `traits` is created
     */
    event ClamCreated(uint256 indexed clamId, uint256 traits);

    /* ========== VIEWS ========== */

    /**
     * @dev Check if `_clamId` is owned by `_account`
     */
    function isOwnerOf(address _account, uint256 _clamId)
        public
        view
        returns (bool)
    {
        return balanceOf(_account, _clamId) == 1;
    }

    /* ========== OWNER MUTATIVE FUNCTION ========== */

    /**
     * @dev Allow contract owner to update URI to look up all clam metadata
     */
    function setURI(string memory _newuri) external onlyOwner {
        _setURI(_newuri);
    }

    /**
     * @dev Allow contract owner to create clam with `_traits` and transfer to `owner`
     */
    function createClam(uint256 _traits, address _owner)
        external
        onlyOwner
    {
        address clamOwner = _owner;
        if (clamOwner == address(0)) {
            clamOwner = owner();
        }

        _createClam(_traits, clamOwner);
    }

    /* ========== INTERNAL CLAM GENERATION ========== */

    /**
     * @dev Internal clam creation function
     */
    function _createClam(uint256 _traits, address _owner)
        internal
        returns (uint256)
    {
        Clam memory _clam =
            Clam({
                traits: _traits,
                birthTime: uint64(now),
                pearlGenerationBlock: 0,
                state: ClamLifeCycle.ALIVE
            });

        clams.push(_clam);
        uint256 newClamID = clams.length - 1;

        _mint(_owner, newClamID, 1, "");

        // emit the creation event
        emit ClamCreated(newClamID, _traits);

        return newClamID;
    }
}
