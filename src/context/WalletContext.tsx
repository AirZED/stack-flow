import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import {
  disconnect,
  isConnected,
  openSignatureRequest,
} from "@stacks/connect";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

interface AddressData {
  address: string;
  symbol?: string;
  purpose?: string;
}

interface WalletContextType {
  isLoading: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  address: string | null;
  stxAddress: string | null;
  btcAddress: string | null;
  addresses: {
    stx: AddressData[];
    btc: AddressData[];
  };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { open } = useAppKit();
  const { address: appKitAddress, isConnected: appKitConnected } = useAppKitAccount();
  
  const [addresses, setAddresses] = useState<{
    stx: AddressData[];
    btc: AddressData[];
  }>({ stx: [], btc: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  // Sync with AppKit state
  useEffect(() => {
    if (appKitConnected && appKitAddress) {
      setConnected(true);
      // If we don't have addresses yet, set the primary one
      if (addresses.stx.length === 0) {
        setAddresses({
          stx: [{ address: appKitAddress, symbol: 'STX', purpose: 'mainnet' }],
          btc: []
        });
      }
    } else {
      setConnected(false);
      setAddresses({ stx: [], btc: [] });
    }
    setIsLoading(false);
  }, [appKitConnected, appKitAddress]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await open();
      setIsConnecting(false);
    } catch (error) {
      console.error("Error opening Reown AppKit modal:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      setConnected(false);
      setAddresses({ stx: [], btc: [] });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  // Primary address (mainnet by default)
  const stxAddress = addresses.stx.find(a => a.purpose === 'mainnet')?.address || addresses.stx[0]?.address || null;
  const btcAddress = addresses.btc.length > 0 ? addresses.btc[0].address : null;

  return (
    <WalletContext.Provider
      value={{
        isLoading,
        isConnecting,
        isConnected: connected,
        connectWallet: handleConnect,
        disconnect: handleDisconnect,
        address: stxAddress,
        stxAddress,
        btcAddress,
        addresses,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
