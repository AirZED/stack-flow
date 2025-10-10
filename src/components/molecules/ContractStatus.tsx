/**
 * Contract Status Component
 * Shows the current status of the smart contract deployment and connectivity
 */

import { useState, useEffect } from "react";
import { Icons } from "../ui/icons";
import { contractValidationService, type ContractValidation } from "../../services/contractValidationService";

export function ContractStatus() {
  const [validation, setValidation] = useState<ContractValidation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateContract = async () => {
      setLoading(true);
      try {
        const result = await contractValidationService.validateContract();
        setValidation(result);
      } catch (error) {
        console.error('Failed to validate contract:', error);
      } finally {
        setLoading(false);
      }
    };

    validateContract();
  }, []);

  const getStatusColor = () => {
    if (!validation) return 'text-gray-400';
    if (validation.isValid) return 'text-green-400';
    if (validation.isDeployed) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = () => {
    if (loading) return <Icons.waves className="w-4 h-4 animate-pulse" />;
    if (!validation) return <Icons.questionMark className="w-4 h-4" />;
    if (validation.isValid) return <Icons.check className="w-4 h-4" />;
    if (validation.isDeployed) return <Icons.questionMark className="w-4 h-4" />;
    return <Icons.close className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (loading) return 'Validating Contract...';
    if (!validation) return 'Validation Failed';
    if (validation.isValid) return 'Contract Ready';
    if (validation.isDeployed) return 'Contract Issues';
    return 'Contract Not Found';
  };

  const handleRefresh = async () => {
    contractValidationService.clearCache();
    setLoading(true);
    try {
      const result = await contractValidationService.validateContract();
      setValidation(result);
    } catch (error) {
      console.error('Failed to refresh contract status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1D2215] rounded-lg p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <h4 className="text-sm font-medium text-white">Smart Contract Status</h4>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        <div className={`text-sm font-bold ${getStatusColor()}`}>
          {getStatusText()}
        </div>
        
        {validation && (
          <>
            <div className="text-xs text-gray-400">
              Contract: {validation.contractId}
            </div>
            <div className="text-xs text-gray-400">
              {validation.networkStatus}
            </div>
            {validation.functions.length > 0 && (
              <div className="text-xs text-gray-400">
                {validation.functions.length} functions available
              </div>
            )}
            {!validation.isValid && validation.isDeployed && (
              <div className="text-xs text-yellow-400">
                ⚠️ Contract missing required functions
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
