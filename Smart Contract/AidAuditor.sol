// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title AidAuditor - Enhanced Version
 * @dev Blockchain-powered auditing platform for disaster aid distribution
 * @notice Tracks aid movement from donors to beneficiaries with transparency and automation
 */
contract AidAuditor is ReentrancyGuard, AccessControl {
    using SafeMath for uint256;

    // ============ ROLES ============
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant SCANNER_ROLE = keccak256("SCANNER_ROLE");
    bytes32 public constant NGO_ROLE = keccak256("NGO_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ============ ENUMS ============
    enum Stage {
        Warehouse,      // 0: Initial storage
        Transport,      // 1: In transit
        Hub,            // 2: Distribution hub
        LocalTransport, // 3: Final mile delivery
        Beneficiary     // 4: Delivered to end recipient
    }

    // ============ STRUCTS ============
    struct Asset {
        uint256 allocatedFunds;
        uint256 releasedFunds;
        uint256 scansCount;
        uint256 donorTimestamp;
        string assetDescription;    // e.g., "1000 food packets"
        string currentGeoTag;
        Stage currentStage;
        bool isFlagged;
        bool isRefunded;
        address payable donor;
        address assignedNGO;
    }

    struct ScanLog {
        uint256 timestamp;
        address scanner;
        string geoTag;
        Stage stage;
        bytes32 photoHash;          // IPFS hash of photo proof
        bool anomalyFlagged;
        string notes;               // Optional delivery notes
    }

    struct Milestone {
        Stage stage;
        uint256 releasePercentage;  // Percentage of funds to release (out of 100)
        bool isReleased;
    }

    // ============ STATE VARIABLES ============
    
    // Governance parameters
    uint256 public constant REFUND_LOCK_PERIOD = 30 days;
    uint256 public minScansForFirstPayout = 2;
    
    // Core mappings
    mapping(bytes32 => Asset) public assets;
    mapping(bytes32 => ScanLog[]) public assetHistory;
    mapping(bytes32 => Milestone[]) public assetMilestones;
    
    // Analytics
    mapping(address => uint256) public donorTotalContributions;
    mapping(address => uint256) public ngoTotalReceived;
    mapping(address => bytes32[]) public donorAssets;
    
    // Platform stats
    uint256 public totalAssetsTracked;
    uint256 public totalFundsAllocated;
    uint256 public totalFundsReleased;

    // ============ EVENTS ============
    event AssetInitialized(
        bytes32 indexed assetID,
        address indexed donor,
        address indexed assignedNGO,
        uint256 amount,
        string description
    );
    
    event ScanLogged(
        bytes32 indexed assetID,
        address indexed scanner,
        Stage stage,
        string geoTag,
        bool anomalyFlagged
    );
    
    event MilestoneReached(
        bytes32 indexed assetID,
        Stage stage,
        uint256 fundsReleased
    );
    
    event FundsReleased(
        bytes32 indexed assetID,
        address indexed recipient,
        uint256 amount,
        Stage milestone
    );
    
    event AssetFlagged(
        bytes32 indexed assetID,
        address indexed flagger,
        string reason
    );
    
    event AssetUnflagged(
        bytes32 indexed assetID,
        address indexed auditor
    );
    
    event Refunded(
        bytes32 indexed assetID,
        address indexed donor,
        uint256 amount
    );
    


    // ============ CONSTRUCTOR ============
    constructor(address _admin, address _auditor) {
        require(_admin != address(0), "Invalid admin");
        require(_auditor != address(0), "Invalid auditor");
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(AUDITOR_ROLE, _auditor);
        
        // Admin can grant other roles
        _setRoleAdmin(AUDITOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(SCANNER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(NGO_ROLE, ADMIN_ROLE);
    }

    // ============ MODIFIERS ============
    modifier assetExists(bytes32 _assetID) {
        require(assets[_assetID].donor != address(0), "Asset not initialized");
        _;
    }

    modifier notFlagged(bytes32 _assetID) {
        require(!assets[_assetID].isFlagged, "Asset is flagged");
        _;
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Initialize a new aid asset with milestones
     * @param _assetID Unique identifier (keccak256 of QR code)
     * @param _description Human-readable description of the aid
     * @param _assignedNGO The NGO responsible for distribution
     * @param _initialGeoTag GPS coordinates or location name
     */
    function initAsset(
        bytes32 _assetID,
        string calldata _description,
        address _assignedNGO,
        string calldata _initialGeoTag
    ) external payable {
        require(_assetID != bytes32(0), "Invalid assetID");
        require(msg.value > 0, "Must send funds");
        require(_assignedNGO != address(0), "Invalid NGO address");
        require(hasRole(NGO_ROLE, _assignedNGO), "NGO not registered");
        require(assets[_assetID].donor == address(0), "Asset already exists");

        // Initialize asset
        Asset storage newAsset = assets[_assetID];
        newAsset.allocatedFunds = msg.value;
        newAsset.donor = payable(msg.sender);
        newAsset.assignedNGO = _assignedNGO;
        newAsset.donorTimestamp = block.timestamp;
        newAsset.assetDescription = _description;
        newAsset.currentGeoTag = _initialGeoTag;
        newAsset.currentStage = Stage.Warehouse;
        newAsset.scansCount = 1;

        // Setup default milestones
        _setupDefaultMilestones(_assetID);

        // Record initial scan
        assetHistory[_assetID].push(
            ScanLog({
                timestamp: block.timestamp,
                scanner: msg.sender,
                geoTag: _initialGeoTag,
                stage: Stage.Warehouse,
                photoHash: bytes32(0),
                anomalyFlagged: false,
                notes: "Asset initialized"
            })
        );

        // Update tracking
        donorAssets[msg.sender].push(_assetID);
        donorTotalContributions[msg.sender] = donorTotalContributions[msg.sender].add(msg.value);
        totalAssetsTracked++;
        totalFundsAllocated = totalFundsAllocated.add(msg.value);

        emit AssetInitialized(_assetID, msg.sender, _assignedNGO, msg.value, _description);
    }

    /**
     * @dev Scan an asset at a checkpoint (authorized personnel only)
     * @param _assetID The asset being scanned
     * @param _newGeoTag Current GPS location
     * @param _newStage Current stage in the distribution chain
     * @param _photoHash IPFS hash of the photo proof
     * @param _notes Optional delivery notes
     */
    function scanAsset(
        bytes32 _assetID,
        string calldata _newGeoTag,
        Stage _newStage,
        bytes32 _photoHash,
        string calldata _notes
    ) external onlyRole(SCANNER_ROLE) assetExists(_assetID) notFlagged(_assetID) {
        Asset storage asset = assets[_assetID];
        
        bool anomalyDetected = false;

        // Anomaly Check 1: Stage must progress forward (or stay the same)
        if (_newStage < asset.currentStage) {
            anomalyDetected = true;
        }

        // Anomaly Check 2: Location shouldn't repeat exactly
        if (keccak256(abi.encodePacked(asset.currentGeoTag)) == keccak256(abi.encodePacked(_newGeoTag)) 
            && _newStage != asset.currentStage) {
            anomalyDetected = true;
        }

        // Anomaly Check 3: Photo hash should be provided for key stages
        if ((_newStage == Stage.Hub || _newStage == Stage.Beneficiary) && _photoHash == bytes32(0)) {
            anomalyDetected = true;
        }

        // Auto-flag if anomaly detected
        if (anomalyDetected) {
            asset.isFlagged = true;
            emit AssetFlagged(_assetID, msg.sender, "Automated anomaly detection");
        }

        // Update asset state
        asset.scansCount = asset.scansCount.add(1);
        asset.currentGeoTag = _newGeoTag;
        asset.currentStage = _newStage;

        // Log the scan
        assetHistory[_assetID].push(
            ScanLog({
                timestamp: block.timestamp,
                scanner: msg.sender,
                geoTag: _newGeoTag,
                stage: _newStage,
                photoHash: _photoHash,
                anomalyFlagged: anomalyDetected,
                notes: _notes
            })
        );

        emit ScanLogged(_assetID, msg.sender, _newStage, _newGeoTag, anomalyDetected);

        // Check if milestone reached and auto-release funds
        _checkAndReleaseMilestone(_assetID);
    }

    /**
     * @dev Internal function to setup default milestone structure
     */
    function _setupDefaultMilestones(bytes32 _assetID) internal {
        // Milestone 1: Reaches Hub (40% of funds)
        assetMilestones[_assetID].push(
            Milestone({
                stage: Stage.Hub,
                releasePercentage: 40,
                isReleased: false
            })
        );

        // Milestone 2: Final delivery to beneficiary (60% of remaining = 60% total)
        assetMilestones[_assetID].push(
            Milestone({
                stage: Stage.Beneficiary,
                releasePercentage: 60,
                isReleased: false
            })
        );
    }

    /**
     * @dev Check if asset reached a milestone and automatically release funds
     */
    function _checkAndReleaseMilestone(bytes32 _assetID) internal {
        Asset storage asset = assets[_assetID];
        Milestone[] storage milestones = assetMilestones[_assetID];

        for (uint256 i = 0; i < milestones.length; i++) {
            Milestone storage milestone = milestones[i];
            
            // Check if this milestone is reached and not yet released
            if (asset.currentStage >= milestone.stage && !milestone.isReleased && asset.scansCount >= minScansForFirstPayout) {
                uint256 releaseAmount = asset.allocatedFunds.mul(milestone.releasePercentage).div(100);
                
                // Ensure we don't over-release
                if (asset.releasedFunds.add(releaseAmount) > asset.allocatedFunds) {
                    releaseAmount = asset.allocatedFunds.sub(asset.releasedFunds);
                }

                if (releaseAmount > 0) {
                    milestone.isReleased = true;
                    asset.releasedFunds = asset.releasedFunds.add(releaseAmount);
                    
                    // Transfer to assigned NGO
                    (bool success, ) = asset.assignedNGO.call{value: releaseAmount}("");
                    require(success, "Transfer failed");

                    ngoTotalReceived[asset.assignedNGO] = ngoTotalReceived[asset.assignedNGO].add(releaseAmount);
                    totalFundsReleased = totalFundsReleased.add(releaseAmount);

                    emit MilestoneReached(_assetID, milestone.stage, releaseAmount);
                    emit FundsReleased(_assetID, asset.assignedNGO, releaseAmount, milestone.stage);
                }
            }
        }
    }

    /**
     * @dev Manual fund release (for special cases, auditor only)
     */
    function manualReleaseFunds(
        bytes32 _assetID,
        address payable _recipient,
        uint256 _amount
    ) external onlyRole(AUDITOR_ROLE) assetExists(_assetID) nonReentrant {
        Asset storage asset = assets[_assetID];
        
        uint256 remainingFunds = asset.allocatedFunds.sub(asset.releasedFunds);
        require(_amount <= remainingFunds, "Insufficient funds");
        require(_amount > 0, "Amount must be positive");

        asset.releasedFunds = asset.releasedFunds.add(_amount);

        (bool success, ) = _recipient.call{value: _amount}("");
        require(success, "Transfer failed");

        ngoTotalReceived[_recipient] = ngoTotalReceived[_recipient].add(_amount);
        totalFundsReleased = totalFundsReleased.add(_amount);

        emit FundsReleased(_assetID, _recipient, _amount, asset.currentStage);
    }

    // ============ GOVERNANCE FUNCTIONS ============

    /**
     * @dev Flag an asset as suspicious (Auditor only)
     */
    function flagAsset(bytes32 _assetID, string calldata _reason) 
        external 
        onlyRole(AUDITOR_ROLE) 
        assetExists(_assetID) 
    {
        assets[_assetID].isFlagged = true;
        emit AssetFlagged(_assetID, msg.sender, _reason);
    }

    /**
     * @dev Unflag an asset after investigation (Auditor only)
     */
    function unflagAsset(bytes32 _assetID) 
        external 
        onlyRole(AUDITOR_ROLE) 
        assetExists(_assetID) 
    {
        assets[_assetID].isFlagged = false;
        emit AssetUnflagged(_assetID, msg.sender);
    }

    /**
     * @dev Donor requests refund if asset flagged or time expired
     */
    function requestRefund(bytes32 _assetID) 
        external 
        nonReentrant 
        assetExists(_assetID) 
    {
        Asset storage asset = assets[_assetID];
        require(asset.donor == msg.sender, "Not the donor");
        require(!asset.isRefunded, "Already refunded");
        
        // Refund conditions
        bool isEligible = asset.isFlagged || 
                         (block.timestamp > asset.donorTimestamp.add(REFUND_LOCK_PERIOD) && 
                          asset.currentStage < Stage.Beneficiary);
        
        require(isEligible, "Not eligible for refund");

        uint256 refundAmount = asset.allocatedFunds.sub(asset.releasedFunds);
        require(refundAmount > 0, "No funds to refund");

        // Mark as refunded
        asset.isRefunded = true;
        asset.allocatedFunds = asset.releasedFunds;

        (bool success, ) = asset.donor.call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit Refunded(_assetID, msg.sender, refundAmount);
    }

    /**
     * @dev Add authorized scanner (Admin only)
     */
    function addScanner(address _scanner) external onlyRole(ADMIN_ROLE) {
        grantRole(SCANNER_ROLE, _scanner);
    }

    /**
     * @dev Add registered NGO (Admin only)
     */
    function addNGO(address _ngo) external onlyRole(ADMIN_ROLE) {
        grantRole(NGO_ROLE, _ngo);
    }

    /**
     * @dev Update minimum scans required for payout
     */
    function updateMinScans(uint256 _newMin) external onlyRole(ADMIN_ROLE) {
        require(_newMin > 0, "Must be positive");
        minScansForFirstPayout = _newMin;
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get complete scan history for an asset
     */
    function getAssetHistory(bytes32 _assetID) 
        external 
        view 
        returns (ScanLog[] memory) 
    {
        return assetHistory[_assetID];
    }

    /**
     * @dev Get asset milestones
     */
    function getAssetMilestones(bytes32 _assetID) 
        external 
        view 
        returns (Milestone[] memory) 
    {
        return assetMilestones[_assetID];
    }

    /**
     * @dev Get all assets donated by an address
     */
    function getDonorAssets(address _donor) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return donorAssets[_donor];
    }

    /**
     * @dev Get asset progress percentage
     */
    function getAssetProgress(bytes32 _assetID) 
        external 
        view 
        assetExists(_assetID) 
        returns (uint256 progressPercentage, uint256 fundsReleasedPercentage) 
    {
        Asset storage asset = assets[_assetID];
        
        // Progress based on stage (0-100%)
        progressPercentage = (uint256(asset.currentStage) * 100) / uint256(Stage.Beneficiary);
        
        // Funds released percentage
        fundsReleasedPercentage = asset.releasedFunds.mul(100).div(asset.allocatedFunds);
        
        return (progressPercentage, fundsReleasedPercentage);
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() 
        external 
        view 
        returns (
            uint256 _totalAssets,
            uint256 _totalAllocated,
            uint256 _totalReleased,
            uint256 _fundsInTransit
        ) 
    {
        return (
            totalAssetsTracked,
            totalFundsAllocated,
            totalFundsReleased,
            totalFundsAllocated.sub(totalFundsReleased)
        );
    }

    // ============ EMERGENCY FUNCTIONS ============

    /**
     * @dev Emergency withdraw (Admin only, for stuck funds)
     */
    function emergencyWithdraw(address payable _recipient) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_recipient != address(0), "Invalid recipient");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        
        (bool success, ) = _recipient.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // ============ RECEIVE/FALLBACK ============

    receive() external payable {
        revert("Use initAsset() to donate");
    }

    fallback() external payable {
        revert("Function does not exist");
    }
}