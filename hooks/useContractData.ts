import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { formatEther } from "ethers";
import { STAGE_NAMES } from "@/config/contract";

export interface AssetData {
  id: string;
  allocatedFunds: string;
  releasedFunds: string;
  scansCount: number;
  donorTimestamp: number;
  description: string;
  currentGeoTag: string;
  currentStage: number;
  stageName: string;
  isFlagged: boolean;
  isRefunded: boolean;
  donor: string;
  assignedNGO: string;
  progressPercentage: number;
  fundsReleasedPercentage: number;
}

export interface ScanLogData {
  timestamp: number;
  scanner: string;
  geoTag: string;
  stage: number;
  stageName: string;
  photoHash: string;
  anomalyFlagged: boolean;
  notes: string;
}

export interface PlatformStats {
  totalAssets: number;
  totalAllocated: string;
  totalReleased: string;
  fundsInTransit: string;
}

export const useContractData = () => {
  const { contract, account } = useWeb3();

  const getPlatformStats = async (): Promise<PlatformStats | null> => {
    if (!contract) return null;

    try {
      const stats = await contract.getPlatformStats();
      return {
        totalAssets: Number(stats._totalAssets),
        totalAllocated: formatEther(stats._totalAllocated),
        totalReleased: formatEther(stats._totalReleased),
        fundsInTransit: formatEther(stats._fundsInTransit),
      };
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      return null;
    }
  };

  const getAssetData = async (assetId: string): Promise<AssetData | null> => {
    if (!contract) return null;

    try {
      const asset = await contract.assets(assetId);
      const progress = await contract.getAssetProgress(assetId);

      return {
        id: assetId,
        allocatedFunds: formatEther(asset.allocatedFunds),
        releasedFunds: formatEther(asset.releasedFunds),
        scansCount: Number(asset.scansCount),
        donorTimestamp: Number(asset.donorTimestamp),
        description: asset.assetDescription,
        currentGeoTag: asset.currentGeoTag,
        currentStage: Number(asset.currentStage),
        stageName: STAGE_NAMES[Number(asset.currentStage)],
        isFlagged: asset.isFlagged,
        isRefunded: asset.isRefunded,
        donor: asset.donor,
        assignedNGO: asset.assignedNGO,
        progressPercentage: Number(progress.progressPercentage),
        fundsReleasedPercentage: Number(progress.fundsReleasedPercentage),
      };
    } catch (error) {
      console.error("Error fetching asset data:", error);
      return null;
    }
  };

  const getAssetHistory = async (assetId: string): Promise<ScanLogData[]> => {
    if (!contract) return [];

    try {
      const history = await contract.getAssetHistory(assetId);
      return history.map((log: any) => ({
        timestamp: Number(log.timestamp),
        scanner: log.scanner,
        geoTag: log.geoTag,
        stage: Number(log.stage),
        stageName: STAGE_NAMES[Number(log.stage)],
        photoHash: log.photoHash,
        anomalyFlagged: log.anomalyFlagged,
        notes: log.notes,
      }));
    } catch (error) {
      console.error("Error fetching asset history:", error);
      return [];
    }
  };

  const getDonorAssets = async (donorAddress?: string): Promise<string[]> => {
    if (!contract) return [];
    const address = donorAddress || account;
    if (!address) return [];

    try {
      const assetIds = await contract.getDonorAssets(address);
      return assetIds;
    } catch (error) {
      console.error("Error fetching donor assets:", error);
      return [];
    }
  };

  return {
    getPlatformStats,
    getAssetData,
    getAssetHistory,
    getDonorAssets,
  };
};
