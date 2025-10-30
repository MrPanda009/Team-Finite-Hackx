import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { useWeb3 } from "@/contexts/Web3Context";
import { Wallet, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";

const WalletButton = () => {
  const { account, isConnected, connectWallet, disconnectWallet, isAdmin, isAuditor, isScanner, isNGO } = useWeb3();

  const getRoles = () => {
    const roles = [];
    if (isAdmin) roles.push("Admin");
    if (isAuditor) roles.push("Auditor");
    if (isScanner) roles.push("Scanner");
    if (isNGO) roles.push("NGO");
    return roles;
  };

  const roles = getRoles();

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} variant="outline" size="sm">
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wallet className="w-4 h-4" />
          {account?.slice(0, 6)}...{account?.slice(-4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Wallet Connected</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <p className="text-xs text-muted-foreground mb-2">Address</p>
          <p className="text-xs font-mono bg-muted p-2 rounded">{account}</p>
        </div>
        {roles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <p className="text-xs text-muted-foreground mb-2">Roles</p>
              <div className="flex flex-wrap gap-1">
                {roles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletButton;