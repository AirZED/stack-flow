import { useEffect } from "react";
import Button from "./Button";
import { useWallet } from "../../context/WalletContext";
import { useAppContext } from "../../context/AppContext";

const CustomConnectButton = ({
  onclick,
  onBalanceChange,
}: {
  onclick?: () => void;
  onBalanceChange?: (balance: number) => void;
}) => {
  const { address, isConnecting, isLoading, connectWallet, disconnect } = useWallet();
  const { state } = useAppContext();
  const { selectedPremium } = state;

  // For now, we'll simulate a balance - in a real app you'd fetch STX balance
  const stxBalance = 1000; // This would come from Stacks API

  useEffect(() => {
    if (onBalanceChange) {
      onBalanceChange(stxBalance);
    }
  }, [stxBalance, onBalanceChange]);

  if (isLoading) {
    return (
      <Button variant="gradient" className="w-full" disabled>
        Loading...
      </Button>
    );
  }

  return (
    <div className="w-full">
      {(() => {
        if (!address) {
          return (
            <Button
              variant="gradient"
              className="w-full"
              onclick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Stacks Wallet"}
            </Button>
          );
        }

        return (
          <div className="flex items-center gap-2 w-full">
            {!onclick && (
              <Button
                variant="gradient"
                onclick={disconnect}
                className="w-full"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {address ? 
                    `${address.slice(0, 6)}...${address.slice(-4)}` : 
                    "Connected"
                  }
                  {stxBalance ? ` (${stxBalance} STX)` : ""}
                </div>
              </Button>
            )}

            {onclick && (
              <Button
                variant="gradient"
                className={`w-full ${
                  stxBalance &&
                  selectedPremium &&
                  stxBalance < Number(selectedPremium)
                    ? "cursor-not-allowed"
                    : ""
                }`}
                onclick={onclick}
              >
                {stxBalance &&
                selectedPremium &&
                stxBalance < Number(selectedPremium)
                  ? "Insufficient balance"
                  : "Buy this strategy"}
              </Button>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default CustomConnectButton;
