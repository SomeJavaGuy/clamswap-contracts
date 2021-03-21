// SPDX-License-Identifier: MIT

pragma solidity = 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableMap.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./ClamNftToken.sol";

contract ClamCore is ClamNftToken, ReentrancyGuard {
    using SafeMath for uint256;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    /**
     * @dev Initializes crypto clam contract.
     * @param _pearl Pearl ERC20 contract address
     * @param _treasuryAddress treasury address.
     */
    constructor(
        PearlToken _pearl,
        address _treasuryAddress
    ) public {
        pearl = _pearl;
        treasuryAddress = _treasuryAddress;

        // start with the first clam
        _createClam(0, msg.sender);
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
     * Returns all the relevant information about a specific clam.
     * @param _id The ID of the clam of interest.
     */
    function getClam(uint256 _id)
        external
        view
        returns (
            uint256 id,
            bool isReady,
            uint256 pearlGenerationBlock,
            uint256 birthTime,
            uint256 traits,
            uint256 state
        )
    {
        Clam storage clam = clams[_id];

        id = _id;
        isReady = (clam.pearlGenerationBlock <= block.number);
        pearlGenerationBlock = clam.pearlGenerationBlock;
        birthTime = clam.birthTime;

        traits = clam.traits;
        state = uint256(clam.state);
    }

    /**
     * @dev Checks to see if a given clam passed pearlGenerationBlock and is ready to generate
     * @param _id clam ID
     */
    function isReadyToGenerate(uint256 _id) external view returns (bool) {
        Clam storage clam = clams[_id];
        return
            (clam.state == ClamLifeCycle.ALIVE) &&
            (clam.pearlGenerationBlock <= uint64(block.number));
    }
}
