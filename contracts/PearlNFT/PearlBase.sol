// SPDX-License-Identifier: MIT

pragma solidity = 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableMap.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PearlBase is Ownable {
    using SafeMath for uint256;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    /* ========== INTERNAL STATE VARIABLES ========== */

    /**
     * @dev An array containing the Pearl struct for all Pearls in existence. The ID
     * of each pearl is the index into this array.
     */
    Pearl[] internal pearls;

    /* ========== PEARL STRUCT ========== */

    /**
     * @dev Everything about your pearl is stored in here. Each pearl's appearance
     * is determined by traits. 
     */
    struct Pearl {
        // The pearl traits.
        uint256 traits;
        // The timestamp of the block when this pearl came into existence. TODO: do we need this?
        uint64 birthTime;
    }

    /* ========== VIEW ========== */

    function getTotalPearl() external view returns (uint256) {
        return pearls.length;
    }  
}
