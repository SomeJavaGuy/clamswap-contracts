// SPDX-License-Identifier: MIT

pragma solidity = 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/EnumerableMap.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ClamBase is Ownable {
    using SafeMath for uint256;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    /* ========== ENUM ========== */

    /**
     * @dev Clam NFT can be in one of two states:
     *
     * Alive - Can be 
     *         1) harvested for $CLAM
     *         2) produce a PEARL NFT after a randomised number of days by attaching 50 $PEARL
     *
     * Dead - Can still be traded as a NFT, but nothing else
     */
    enum ClamLifeCycle {ALIVE, DEAD}

    /* ========== PUBLIC STATE VARIABLES ========== */

    /**
     * @dev $PEARL generation fee
     */
    uint256 public pearlGenerationFee = 50e18; // 50 $PEARL

    /**
     * @dev $PEARL ERC20 contract address
     */
    IERC20 public pearl;
    
    /**
     * @dev PEARL NFT ERC1155 contract address
     */
    IERC1155 public pearlNft;

    /**
     * @dev 10% of the $PEARL fee goes to treasury
     */
    address public treasuryAddress;

    /**
     * @dev 90% of the $PEARL fee is burned 
     */
    address constant public burnAddress = address(0);

    /**
     * @dev number of percentage $PEARL fund goes to treasuryAddress
     * treasury percentage = treasuryPearlGenerationPercentage / 100
     * burn percentage = (100 - treasuryPearlGenerationPercentage) / 100
     */
    uint256 public treasuryPearlGenerationPercentage = 10;

    /**
     * @dev An approximation of currently how many seconds are in between blocks.
     */
    uint256 public secondsPerBlock = 15;

    /**
     * @dev amount of time a new Clam needs to wait before participating in pearl generation activity.
     */
    uint256 public pearlGenerationTime = uint256(1 days); // TODO: random generation

    /* ========== INTERNAL STATE VARIABLES ========== */

    /**
     * @dev An array containing the Clam struct for all Clams in existence. The ID
     * of each clam is the index into this array.
     */
    Clam[] internal clams;

    /* ========== CLAM STRUCT ========== */

    /**
     * @dev Everything about your clam is stored in here. Each clam's appearance
     * is determined by traits. 
     */
    struct Clam {
        // The clam traits.
        uint256 traits;
        // The timestamp of the block when this clam came into existence.
        uint64 birthTime;
        // When the pearl will be generated
        uint64 pearlGenerationBlock;
        // defines current clam state
        ClamLifeCycle state;
    }

    /* ========== VIEW ========== */

    function getTotalClam() external view returns (uint256) {
        return clams.length;
    }

    /* ========== OWNER MUTATIVE FUNCTION ========== */

    /**
     * @param _treasuryAddress dev address
     */
    function setTreasuryAddress(address _treasuryAddress) external onlyTreasury {
        treasuryAddress = _treasuryAddress;
    }

    /**
     * @param _treasuryPearlGenerationPercentage base generation factor
     */
    function setTreasuryPearlGenerationPercentage(uint256 _treasuryPearlGenerationPercentage)
        external
        onlyOwner
    {
        require(
            treasuryPearlGenerationPercentage <= 100,
            "CryptoAlpaca: invalid breeding percentage - must be between 0 and 100"
        );
        treasuryPearlGenerationPercentage = _treasuryPearlGenerationPercentage;
    }

    /**
     * @param _pearlGenerationFee fee for generating a pearl
     */
    function setPearlGenerationFee(uint256 _pearlGenerationFee) external onlyOwner {
        pearlGenerationFee = _pearlGenerationFee;
    }

    /**
     * @param _pearlGenerationTime when a pearl can be generated
     */
    function setPearlGenerationTime(uint256 _pearlGenerationTime) external onlyOwner {
        pearlGenerationTime = _pearlGenerationTime;
    }

    /**
     * @dev update how many seconds per blocks are currently observed.
     * @param _secs number of seconds
     */
    function setSecondsPerBlock(uint256 _secs) external onlyOwner {
        secondsPerBlock = _secs;
    }

    /**
     * @dev owner can update $PEARL erc20 token location
     */
    function setPearlContract(IERC20 _pearl) external onlyOwner {
        pearl = _pearl;
    }
    
    /**
     * @dev owner can update PEARL NFT erc1155 token location
     */
    function setPearlNftContract(IERC1155 _pearlNft) external onlyOwner {
        pearlNft = _pearlNft;
    }

    /* ========== MODIFIER ========== */

    /**
     * @dev Throws if called by any account other than the dev.
     */
    modifier onlyTreasury() {
        require(
            treasuryAddress == _msgSender(),
            "ClamNFT: caller is not the dev"
        );
        _;
    }
}
