/**
 * Contract Validation Service
 * Validates contract deployment and functionality before trading
 */

import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../blockchain/stacks/transactionManager';

export interface ContractValidation {
  isDeployed: boolean;
  isValid: boolean;
  contractId: string;
  networkStatus: string;
  functions: string[];
  lastValidated: number;
}

export class ContractValidationService {
  private static instance: ContractValidationService;
  private cache: ContractValidation | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ContractValidationService {
    if (!ContractValidationService.instance) {
      ContractValidationService.instance = new ContractValidationService();
    }
    return ContractValidationService.instance;
  }

  async validateContract(): Promise<ContractValidation> {
    // Return cached result if still valid
    if (this.cache && (Date.now() - this.cache.lastValidated) < this.CACHE_DURATION) {
      return this.cache;
    }

    const isMainnet = import.meta.env.VITE_STACKS_NETWORK === 'mainnet';
    const apiUrl = isMainnet
      ? 'https://api.hiro.so' 
      : 'https://api.testnet.hiro.so';

    const contractId = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
    
    console.log('🔍 Validating contract:', contractId);

    try {
      // Check if contract exists
      const contractResponse = await fetch(
        `${apiUrl}/v2/contracts/interface/${contractId}`
      );

      if (!contractResponse.ok) {
        console.error('❌ Contract not found:', contractResponse.status);
        
        const validation: ContractValidation = {
          isDeployed: false,
          isValid: false,
          contractId,
          networkStatus: `Contract not found (${contractResponse.status})`,
          functions: [],
          lastValidated: Date.now()
        };
        
        this.cache = validation;
        return validation;
      }

      const contractData = await contractResponse.json();
      console.log('📄 Contract interface loaded:', contractData);

      // Extract function names
      const functions = this.extractFunctionNames(contractData);
      
      // Validate required functions exist
      const requiredFunctions = [
        'create-call-option',
        'create-put-option', 
        'create-strap-option',
        'create-strip-option',
        'exercise-option',
        'get-option'
      ];

      const hasCriticalFunctions = requiredFunctions.every(fn => 
        functions.includes(fn)
      );

      // Check network status
      const networkResponse = await fetch(`${apiUrl}/v2/info`);
      const networkInfo = networkResponse.ok ? await networkResponse.json() : null;
      
      const validation: ContractValidation = {
        isDeployed: true,
        isValid: hasCriticalFunctions,
        contractId,
        networkStatus: networkInfo ? 
          `Connected to ${isMainnet ? 'Mainnet' : 'Testnet'} (Block: ${networkInfo.stacks_tip_height})` :
          'Network status unknown',
        functions,
        lastValidated: Date.now()
      };

      console.log('✅ Contract validation complete:', validation);
      this.cache = validation;
      return validation;

    } catch (error) {
      console.error('💥 Contract validation failed:', error);
      
      const validation: ContractValidation = {
        isDeployed: false,
        isValid: false,
        contractId,
        networkStatus: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        functions: [],
        lastValidated: Date.now()
      };
      
      this.cache = validation;
      return validation;
    }
  }

  private extractFunctionNames(contractInterface: any): string[] {
    try {
      const functions: string[] = [];
      
      // The API returns functions as an array, not an object
      if (contractInterface.functions && Array.isArray(contractInterface.functions)) {
        contractInterface.functions.forEach((fn: any) => {
          if (fn.name) {
            functions.push(fn.name);
          }
        });
      }
      
      return functions;
    } catch (error) {
      console.error('Error extracting function names:', error);
      return [];
    }
  }

  /**
   * Test a simple read-only function to ensure contract is responsive
   */
  async testContractRead(): Promise<boolean> {
    const isMainnet = import.meta.env.VITE_STACKS_NETWORK === 'mainnet';
    const apiUrl = isMainnet
      ? 'https://api.hiro.so' 
      : 'https://api.testnet.hiro.so';

    const contractId = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

    try {
      // Try to read contract stats (a simple read-only function)
      const response = await fetch(
        `${apiUrl}/v2/contracts/call-read/${contractId}/get-stats`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: CONTRACT_ADDRESS,
            arguments: []
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Contract read test successful:', result);
        return true;
      } else {
        console.warn('⚠️ Contract read test failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('💥 Contract read test error:', error);
      return false;
    }
  }

  /**
   * Clear the validation cache
   */
  clearCache(): void {
    this.cache = null;
  }
}

// Export singleton instance
export const contractValidationService = ContractValidationService.getInstance();
