// SPDX-License-Identifier: MIT

pragma solidity =0.6.12;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./PearlBase.sol";

contract PearlNftToken is PearlBase, ERC1155("") {
    /* ========== EVENTS ========== */

    /**
     * @dev Emitted when single `pearlId` pearl with `traits` is created
     */
    event PearlCreated(uint256 indexed pearlId, uint256 traits);

    /* ========== VIEWS ========== */

    /**
     * @dev Check if `_pearlId` is owned by `_account`
     */
    function isOwnerOf(address _account, uint256 _pearlId)
        public
        view
        returns (bool)
    {
        return balanceOf(_account, _pearlId) == 1;
    }

    /* ========== OWNER MUTATIVE FUNCTION ========== */

    /**
     * @dev Allow contract owner to update URI to look up all pearl metadata
     */
    function setURI(string memory _newuri) external onlyOwner {
        _setURI(_newuri);
    }

    /**
     * @dev Allow contract owner to create pearl with `_traits` and transfer to `owner`
     */
    function createPearl(uint256 _traits, address _owner)
        external
        onlyOwner // should be clam nft contract
    {
        address pearlOwner = _owner;
        if (pearlOwner == address(0)) {
            pearlOwner = owner();
        }

        _createPearl(_traits, pearlOwner);
    }

    /* ========== INTERNAL PEARL GENERATION ========== */

    /**
     * @dev Internal pearl creation function
     */
    function _createPearl(uint256 _traits, address _owner)
        internal
        returns (uint256)
    {
        Pearl memory _pearl =
            Pearl({
                traits: _traits,
                birthTime: uint64(now)
            });

        pearls.push(_pearl);
        uint256 newPearlID = pearls.length - 1;

        _mint(_owner, newPearlID, 1, "");

        // emit the creation event
        emit PearlCreated(newPearlID, _traits);

        return newPearlID;
    }
}
