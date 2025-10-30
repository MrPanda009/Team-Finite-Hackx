"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, ROLES } from "@/config/contract";
import { useToast } from "@/hooks/use-toast";

// Define global Ethereum type (for TypeScript)
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ContextType {
  account: string | null;
  contract: Contract | null;
  provider: BrowserProvider | null;
  isConnected: boolean;
  isAdmin: boolean;
  isAuditor: boolean;
  isScanner: boolean;
  isNGO: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  checkUserRole: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuditor, setIsAuditor] = useState(false);
  const [isScanner, setIsScanner] = useState(false);
  const [isNGO, setIsNGO] = useState(false);
  const { toast } = useToast();

  // 🟩 CHECK USER ROLE FUNCTION
  const checkUserRole = async () => {
    if (!contract || !account) return;

    try {
      const [admin, auditor, scanner, ngo] = await Promise.all([
        contract.hasRole(ROLES.ADMIN_ROLE, account),
        contract.hasRole(ROLES.AUDITOR_ROLE, account),
        contract.hasRole(ROLES.SCANNER_ROLE, account),
        contract.hasRole(ROLES.NGO_ROLE, account),
      ]);

      setIsAdmin(admin);
      setIsAuditor(auditor);
      setIsScanner(scanner);
      setIsNGO(ngo);
    } catch (error) {
      console.error("Error checking user roles:", error);
      toast({
        title: "Role Fetch Error",
        description: "Unable to verify user roles from the contract.",
        variant: "destructive",
      });
    }
  };

  // 🟦 CONNECT WALLET
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await browserProvider.getSigner();
      const accountAddress = await signer.getAddress();
      const contractInstance = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setProvider(browserProvider);
      setAccount(accountAddress);
      setContract(contractInstance);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}`,
      });
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet.",
        variant: "destructive",
      });
    }
  };

  // 🟥 DISCONNECT WALLET
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setIsAdmin(false);
    setIsAuditor(false);
    setIsScanner(false);
    setIsNGO(false);

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  // 🟨 REACT TO ACCOUNT / CONTRACT CHANGES
  useEffect(() => {
    if (account && contract) {
      checkUserRole();
    }
  }, [account, contract]);

  // 🟩 HANDLE ACCOUNT + CHAIN CHANGES
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        contract,
        provider,
        isConnected: !!account,
        isAdmin,
        isAuditor,
        isScanner,
        isNGO,
        connectWallet,
        disconnectWallet,
        checkUserRole,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// 🟢 CUSTOM HOOK
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
