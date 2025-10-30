// Smart Contract Configuration for Next.js

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x..."; // Replace with deployed address

export const CONTRACT_CHAIN_ID =
  process.env.NEXT_PUBLIC_CHAIN_ID || "11155111"; // Default: Sepolia testnet

export const ROLES = {
  ADMIN_ROLE: "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
  AUDITOR_ROLE: "0x8f6e0d79c6b6e9f6e6b9c4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4",
  SCANNER_ROLE: "0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544fa6846ca5",
  NGO_ROLE: "0x2db9fd3d099848027c2383d0a083396f6c41510d7acfd92adc99b6cffcf31e96",
} as const;

export const STAGES = {
  Warehouse: 0,
  Transport: 1,
  Hub: 2,
  LocalTransport: 3,
  Beneficiary: 4,
} as const;

export const STAGE_NAMES = ["Warehouse", "Transport", "Hub", "LocalTransport", "Beneficiary"];

export const CONTRACT_ABI = [
  "function initAsset(bytes32 _assetID, string _description, address _assignedNGO, string _initialGeoTag) external payable",
  "function scanAsset(bytes32 _assetID, string _newGeoTag, uint8 _newStage, bytes32 _photoHash, string _notes) external",
  "function assets(bytes32) external view returns (uint256 allocatedFunds, uint256 releasedFunds, uint256 scansCount, uint256 donorTimestamp, string assetDescription, string currentGeoTag, uint8 currentStage, bool isFlagged, bool isRefunded, address donor, address assignedNGO)",
  "function getAssetHistory(bytes32 _assetID) external view returns (tuple(uint256 timestamp, address scanner, string geoTag, uint8 stage, bytes32 photoHash, bool anomalyFlagged, string notes)[])",
  "function getAssetMilestones(bytes32 _assetID) external view returns (tuple(uint8 stage, uint256 releasePercentage, bool isReleased)[])",
  "function getDonorAssets(address _donor) external view returns (bytes32[])",
  "function getAssetProgress(bytes32 _assetID) external view returns (uint256 progressPercentage, uint256 fundsReleasedPercentage)",
  "function getPlatformStats() external view returns (uint256 _totalAssets, uint256 _totalAllocated, uint256 _totalReleased, uint256 _fundsInTransit)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function flagAsset(bytes32 _assetID, string _reason) external",
  "function unflagAsset(bytes32 _assetID) external",
  "function requestRefund(bytes32 _assetID) external",
  "function manualReleaseFunds(bytes32 _assetID, address payable _recipient, uint256 _amount) external",
  "function addScanner(address _scanner) external",
  "function addNGO(address _ngo) external",
  "function totalAssetsTracked() external view returns (uint256)",
  "function totalFundsAllocated() external view returns (uint256)",
  "function totalFundsReleased() external view returns (uint256)",
  "function donorTotalContributions(address) external view returns (uint256)",
  "function ngoTotalReceived(address) external view returns (uint256)",
  "event AssetInitialized(bytes32 indexed assetID, address indexed donor, address indexed assignedNGO, uint256 amount, string description)",
  "event ScanLogged(bytes32 indexed assetID, address indexed scanner, uint8 stage, string geoTag, bool anomalyFlagged)",
  "event MilestoneReached(bytes32 indexed assetID, uint8 stage, uint256 fundsReleased)",
  "event FundsReleased(bytes32 indexed assetID, address indexed recipient, uint256 amount, uint8 milestone)",
  "event AssetFlagged(bytes32 indexed assetID, address indexed flagger, string reason)",
  "event AssetUnflagged(bytes32 indexed assetID, address indexed auditor)",
  "event Refunded(bytes32 indexed assetID, address indexed donor, uint256 amount)",
];
