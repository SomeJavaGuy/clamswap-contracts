// SPDX-License-Identifier: MIT

pragma solidity = 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableMap.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./PearlNftToken.sol";

contract PearlCore is PearlNftToken, ReentrancyGuard {
    using SafeMath for uint256;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    /**
     * @dev Initializes crypto pearl contract.
     * @param _clamAddress clam address.
     */
    constructor(
        address _clamAddress
    ) public {
        transferOwnership(_clamAddress);

        // start with the first pearl
        _createPearl(0, msg.sender);
    }

    /* ========== OWNER MUTATIVE FUNCTION ========== */

    /**
     * @dev Allows owner to withdraw the balance available to the contract.
     */
    function withdrawBalance(uint256 _amount, address payable _to)
        external
        onlyOwner
    {
        _to.transfer(_amount);
    }

        /* ========== VIEWS ========== */

    /**
     * Returns all the relevant information about a specific pearl.
     * @param _id The ID of the pearl of interest.
     */
    function getPearl(uint256 _id)
        external
        view
        returns (
            uint256 id,
            uint256 birthTime,
            uint256 traits
        )
    {
        Pearl storage pearl = pearls[_id];

        id = _id;
        birthTime = pearl.birthTime;
        traits = pearl.traits;
    }
}
