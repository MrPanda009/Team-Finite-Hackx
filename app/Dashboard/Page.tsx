import { Card } from "@/components/card";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Shield, TrendingUp, Users, Package, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import WalletButton from "@/components/WalletButton";
import { useWeb3 } from "@/contexts/Web3Context";
import { useContractData } from "@/hooks/useContractData";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/skeleton";

const Dashboard = () => {
  const { isConnected } = useWeb3();
  const { getPlatformStats } = useContractData();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (isConnected) {
        setLoading(true);
        const data = await getPlatformStats();
        setStats(data);
        setLoading(false);
      }
    };
    loadStats();
  }, [isConnected]);

  const displayStats = isConnected && stats ? [
    { label: "Total Aid Packages", value: stats.totalAssets.toString(), icon: Package, change: "" },
    { label: "Funds Allocated", value: `${parseFloat(stats.totalAllocated).toFixed(4)} ETH`, icon: TrendingUp, change: "" },
    { label: "Funds Released", value: `${parseFloat(stats.totalReleased).toFixed(4)} ETH`, icon: CheckCircle2, change: "" },
    { label: "Funds In Transit", value: `${parseFloat(stats.fundsInTransit).toFixed(4)} ETH`, icon: Clock, change: "" },
  ] : [
    { label: "Total Aid Packages", value: "---", icon: Package, change: "" },
    { label: "Funds Allocated", value: "--- ETH", icon: TrendingUp, change: "" },
    { label: "Funds Released", value: "--- ETH", icon: CheckCircle2, change: "" },
    { label: "Funds In Transit", value: "--- ETH", icon: Clock, change: "" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-transit":
        return "warning";
      case "pending":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "in-transit":
        return <Clock className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">AidChain</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/dashboard" className="text-sm font-medium text-primary">
                Dashboard
              </Link>
              <Link to="/tracking" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
                Tracking
              </Link>
              <Link to="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
                Verification
              </Link>
              <WalletButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Connection Notice */}
        {!isConnected && (
          <Card className="p-6 mb-8 bg-warning/10 border-warning/50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <h3 className="font-semibold text-foreground">Connect Your Wallet</h3>
                <p className="text-sm text-muted-foreground">Connect your wallet to view real-time blockchain data and interact with the platform.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                {loading && isConnected ? (
                  <Skeleton className="h-8 w-24 mb-1" />
                ) : (
                  <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                )}
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Recent Transactions Info */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Blockchain Transactions</h2>
              <p className="text-sm text-muted-foreground">
                {isConnected 
                  ? "Real-time verified aid distribution on the blockchain" 
                  : "Connect wallet to view transaction history"}
              </p>
            </div>
            <Link to="/tracking">
              <Button variant="outline">
                Track Assets
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {!isConnected ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Connect your wallet to view your transactions and track assets</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <p className="text-foreground font-semibold mb-2">Wallet Connected</p>
              <p className="text-sm text-muted-foreground mb-4">
                All transactions are recorded on the blockchain with complete transparency
              </p>
              <Link to="/tracking">
                <Button variant="hero">
                  View Asset Tracking
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Blockchain Verification Banner */}
        <Card className="mt-8 p-8 bg-gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">100% Transparent & Immutable</h3>
              <p className="text-primary-foreground/90 mb-4">
                Every transaction is recorded on the blockchain with cryptographic verification, ensuring complete transparency and preventing tampering.
              </p>
              <Button variant="outline" className="bg-background text-primary hover:bg-background/90">
                Learn About Our Technology
              </Button>
            </div>
            <Shield className="w-32 h-32 text-primary-foreground/20" />
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;