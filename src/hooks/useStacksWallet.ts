import { useState, useEffect } from 'react';
import { showConnect } from '@stacks/connect';
import { 
  appDetails, 
  userSession, 
  getUserData, 
  isSignedIn, 
  signOut,
  getUserAddress,
  getUserBtcAddress
} from '../utils/stacks';

export interface StacksUserData {
  address: string;
  btcAddress: string;
  profile: any;
  appPrivateKey?: string;
  isSignedIn: boolean;
}

export const useStacksWallet = () => {
  const [userData, setUserData] = useState<StacksUserData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for pending sign-ins and load user data
  useEffect(() => {
    const handlePendingSignIn = async () => {
      if (userSession.isSignInPending()) {
        setIsConnecting(true);
        try {
          const userData = await userSession.handlePendingSignIn();
          const address = getUserAddress();
          const btcAddress = getUserBtcAddress();
          if (address && btcAddress) {
            setUserData({
              address,
              btcAddress,
              profile: userData.profile,
              appPrivateKey: userData.appPrivateKey,
              isSignedIn: true,
            });
          }
        } catch (error) {
          console.error('Error handling pending sign-in:', error);
        } finally {
          setIsConnecting(false);
          setIsLoading(false);
        }
      } else if (isSignedIn()) {
        const currentUserData = getUserData();
        if (currentUserData) {
          const address = getUserAddress();
          const btcAddress = getUserBtcAddress();
          if (address && btcAddress) {
            setUserData({
              address,
              btcAddress,
              profile: currentUserData.profile,
              appPrivateKey: currentUserData.appPrivateKey,
              isSignedIn: true,
            });
          }
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    handlePendingSignIn();
  }, []);

  const connectWallet = () => {
    setIsConnecting(true);
    
    // Log app details for debugging
    console.log('Connecting wallet with appDetails:', appDetails);
    
    // Set a timeout to reset connecting state if wallet doesn't respond
    const timeoutId = setTimeout(() => {
      setIsConnecting(false);
      console.error('Wallet connection timeout - please ensure you have a Stacks wallet extension installed (e.g., Leather wallet)');
      alert('Connection timeout. Please install a Stacks wallet extension (like Leather) and try again.\n\nVisit: https://leather.io/install-extension');
    }, 30000); // 30 second timeout
    
    try {
      showConnect({
        appDetails,
        onFinish: () => {
          clearTimeout(timeoutId);
          setIsConnecting(false);
          window.location.reload();
        },
        onCancel: () => {
          clearTimeout(timeoutId);
          setIsConnecting(false);
        },
        userSession,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      setIsConnecting(false);
      console.error('Error connecting wallet - Full error details:', error);
      
      // Check if the error is related to the icon
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('icon') || errorMessage.includes('image')) {
        alert('Wallet connection failed due to app icon issue. Please contact support.\n\nError: ' + errorMessage);
      } else {
        alert('Failed to connect wallet. Please ensure:\n1. Leather wallet extension is installed and enabled\n2. You have refreshed the page after installing\n3. No other wallet extensions are interfering\n\nVisit: https://leather.io/install-extension\n\nError: ' + errorMessage);
      }
    }
  };

  const disconnectWallet = () => {
    signOut();
    setUserData(null);
  };

  return {
    userData,
    isConnecting,
    isLoading,
    connectWallet,
    disconnectWallet,
    isSignedIn: isSignedIn(),
  };
};
