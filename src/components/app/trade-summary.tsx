import { useState } from "react";
import CustomConnectButton from "../atoms/ConnectButton";
import { Icons } from "../ui/icons";
import { useAppContext } from "../../context/AppContext";
import ConfirmModal from "../molecules/ConfirmModal";
import SuccessModal from "../molecules/SuccessModal";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axios";
import { useWallet } from "../../context/WalletContext";

// Import the working transaction manager
import { createOption, type CreateOptionParams, type StrategyType } from "../../blockchain/stacks/transactionManager";

export function TradeSummary() {
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [isCreatingOption, setIsCreatingOption] = useState(false);

  const { state } = useAppContext();
  const {
    asset,
    strategy,
    isFetching,
    selectedPremium,
    period,
    amount,
  } = state;

  const { address } = useWallet();

  const handleBalanceChange = (balance: number) => {
    setUserBalance(balance);
  };

  // Map strategy names to contract strategy types
  const mapStrategyToType = (strategyName: string): StrategyType => {
    const name = strategyName.toLowerCase().replace(/\s+/g, '');
    switch (name) {
      case 'call':
        return 'CALL';
      case 'strap':
        return 'STRAP';
      case 'bullcallspread':
        return 'BCSP';
      case 'bullputspread':
        return 'BPSP';
      default:
        return 'CALL';
    }
  };

  const callStrategy = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsCreatingOption(true);
      setShowConfirmModal(true);
      
      console.log("Creating option with Stacks smart contract...");
      
      // Get current STX price for strike price calculation
      const stxPrice = 0.59; // You can fetch this from your price service
      
      const params: CreateOptionParams = {
        strategy: mapStrategyToType(strategy),
        amount: parseFloat(amount),
        strikePrice: stxPrice,
        premium: parseFloat(selectedPremium),
        period: parseInt(period.replace('D', '')), // Convert "7D" to 7
        userAddress: address,
        onFinish: (data) => {
          console.log("Transaction completed:", data.txId);
          setTxHash(data.txId);
          setShowConfirmModal(false);
          setShowSuccessModal(true);
          toast.success("Option created successfully!");
        },
        onCancel: () => {
          console.log("Transaction cancelled by user");
          setShowConfirmModal(false);
          setIsCreatingOption(false);
        }
      };
      
      const result = await createOption(params);
      
      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      // Call referral reward function
      try {
        await axiosInstance.post("/referrals/reward", {
          refereeAddress: address,
          rewardAmount: parseFloat(amount) * 0.002,
          transactionHash: result.txId,
        });
      } catch (rewardError) {
        console.error("Referral reward failed:", rewardError);
        toast.warning(
          "Referral reward processing failed, but trade was successful"
        );
      }
      
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error(error instanceof Error ? error.message : 'Transaction failed');
      setShowConfirmModal(false);
    } finally {
      setIsCreatingOption(false);
    }
  };

  return (
    <div className="flex-1 gap-[1rem] flex flex-col w-full ">
      <ConfirmModal isOpen={showConfirmModal} />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        txHash={txHash}
      />
      <div className="col-span-2 bg-gradient-to-b from-[#1D2215] to-[#121412] py-3.5 px-6 rounded-t-lg " >
        <div className="flex items-start gap-10 md:gap-24">
          <div className="w-full max-w-[300px] flex gap-[.5rem] flex-col">
            <div className="flex items-center justify-between *:text-xs *:capitalize">
              <p className="text-[#7A7A7A]">Strategy</p>
              <p className="text-[#D6D6D6] font-bold">
                {asset} {strategy.replace("-", " ")}
              </p>
            </div>

            <div className="flex items-center justify-between *:text-xs *:capitalize">
              <p className="text-[#7A7A7A]">Exercising</p>
              <p className="text-[#D6D6D6] font-bold flex items-center gap-2">
                Manual <Icons.questionMark />
              </p>
            </div>

            <div className="flex items-center justify-between *:text-xs *:capitalize">
              <p className="text-[#7A7A7A]">Liquidation</p>
              <p className="text-[#D6D6D6] font-bold">None</p>
            </div>
          </div>

          <div className="w-full max-w-[300px] space-y-2">
            <div className="flex items-center justify-between *:text-xs *:capitalize">
              <p className="text-[#7A7A7A]">Profit Zone</p>
              <p className="text-[#D6D6D6] font-bold">
                {">"}
                {isFetching ? "..." : "$3,257"}
              </p>
            </div>

            <div className="flex items-center justify-between *:text-xs *:capitalize">
              <p className="text-[#7A7A7A]">Max. Loss Zone</p>
              <p className="text-[#D6D6D6] font-bold flex items-center gap-2">
                {"<"}$3,130
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1D2215] h-full rounded-lg py-3.5 px-6 gap-4 flex flex-col ">
        <div className="flex gap-[.5rem] flex-col">
          <div className="flex items-center justify-between *:text-xs *:text-[#D6D6D6]">
            <p>Total Cost</p>
            <p className="flex items-center gap-2 font-bold">
              <Icons.USDC /> {selectedPremium} USDC.e
            </p>
          </div>

          <div className="flex items-center justify-between *:text-xs *:text-[#D6D6D6]">
            <p>Your Balance</p>
            <p className="flex items-center gap-2 font-bold">
              <Icons.USDC /> {userBalance && userBalance.toFixed(2)} USDC.e
            </p>
          </div>

          <div className="flex items-center justify-between *:text-xs *:text-[#D6D6D6]">
            <p>Platform Fee (0.1%)</p>
            <p className="flex items-center gap-2 font-bold">
              <Icons.USDC /> {(parseFloat(selectedPremium) / 1000).toFixed(2)}{" "}
              USDC.e
            </p>
          </div>
        </div>
        <div className="w-full">
          <CustomConnectButton
            onclick={callStrategy}
            onBalanceChange={handleBalanceChange}
          />
        </div>
      </div>
    </div>
  );
}
