// Detect and connect to Solana wallets (Phantom, Solflare, etc.)

export interface DetectedWallet {
  name: string;
  icon: string;
  adapter: any;
  installed: boolean;
  ready: boolean;
}

/**
 * Check if a wallet adapter is available
 */
function isWalletAdapterAvailable(name: string): boolean {
  if (typeof window === "undefined") return false;
  
  const walletName = name.toLowerCase();
  
  // Check for Phantom
  if (walletName === "phantom" && (window as any).solana?.isPhantom) {
    return true;
  }
  
  // Check for Solflare
  if (walletName === "solflare" && (window as any).solflare) {
    return true;
  }
  
  // Check for generic Solana wallet
  if ((window as any).solana) {
    return true;
  }
  
  return false;
}

/**
 * Get all detected wallets on the user's platform
 */
export function getDetectedWallets(): DetectedWallet[] {
  if (typeof window === "undefined") return [];
  
  const wallets: DetectedWallet[] = [];
  
  // Check Phantom
  if (isWalletAdapterAvailable("phantom")) {
    wallets.push({
      name: "Phantom",
      icon: "👻",
      adapter: (window as any).solana,
      installed: true,
      ready: true,
    });
  } else {
    wallets.push({
      name: "Phantom",
      icon: "👻",
      adapter: null,
      installed: false,
      ready: false,
    });
  }
  
  // Check Solflare
  if (isWalletAdapterAvailable("solflare")) {
    wallets.push({
      name: "Solflare",
      icon: "🔥",
      adapter: (window as any).solflare,
      installed: true,
      ready: true,
    });
  } else {
    wallets.push({
      name: "Solflare",
      icon: "🔥",
      adapter: null,
      installed: false,
      ready: false,
    });
  }
  
  // Check Backpack
  if ((window as any).backpack) {
    wallets.push({
      name: "Backpack",
      icon: "🎒",
      adapter: (window as any).backpack,
      installed: true,
      ready: true,
    });
  } else {
    wallets.push({
      name: "Backpack",
      icon: "🎒",
      adapter: null,
      installed: false,
      ready: false,
    });
  }
  
  // Check generic Solana wallet (if not Phantom)
  if ((window as any).solana && !(window as any).solana.isPhantom) {
    wallets.push({
      name: "Solana Wallet",
      icon: "💼",
      adapter: (window as any).solana,
      installed: true,
      ready: true,
    });
  }
  
  return wallets;
}

/**
 * Connect to a detected wallet
 */
export async function connectWallet(walletName: string): Promise<{
  success: boolean;
  publicKey?: string;
  error?: string;
}> {
  try {
    if (typeof window === "undefined") {
      return { success: false, error: "Not in browser environment" };
    }
    
    const walletNameLower = walletName.toLowerCase();
    let adapter: any = null;
    
    // Get the appropriate adapter
    if (walletNameLower === "phantom" && (window as any).solana?.isPhantom) {
      adapter = (window as any).solana;
    } else if (walletNameLower === "solflare" && (window as any).solflare) {
      adapter = (window as any).solflare;
    } else if (walletNameLower === "backpack" && (window as any).backpack) {
      adapter = (window as any).backpack;
    } else if ((window as any).solana) {
      adapter = (window as any).solana;
    } else {
      return { success: false, error: "Wallet not found" };
    }
    
    // Connect to wallet
    if (!adapter.isConnected) {
      const response = await adapter.connect();
      return {
        success: true,
        publicKey: response.publicKey.toString(),
      };
    } else {
      return {
        success: true,
        publicKey: adapter.publicKey.toString(),
      };
    }
  } catch (error: any) {
    console.error("Error connecting wallet:", error);
    return {
      success: false,
      error: error.message || "Failed to connect wallet",
    };
  }
}

/**
 * Disconnect from wallet
 */
export async function disconnectWallet(walletName: string): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    
    const walletNameLower = walletName.toLowerCase();
    let adapter: any = null;
    
    if (walletNameLower === "phantom" && (window as any).solana?.isPhantom) {
      adapter = (window as any).solana;
    } else if (walletNameLower === "solflare" && (window as any).solflare) {
      adapter = (window as any).solflare;
    } else if (walletNameLower === "backpack" && (window as any).backpack) {
      adapter = (window as any).backpack;
    } else if ((window as any).solana) {
      adapter = (window as any).solana;
    }
    
    if (adapter && adapter.disconnect) {
      await adapter.disconnect();
    }
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
  }
}

/**
 * Get connected wallet address
 */
export function getConnectedWalletAddress(walletName: string): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const walletNameLower = walletName.toLowerCase();
    let adapter: any = null;
    
    if (walletNameLower === "phantom" && (window as any).solana?.isPhantom) {
      adapter = (window as any).solana;
    } else if (walletNameLower === "solflare" && (window as any).solflare) {
      adapter = (window as any).solflare;
    } else if (walletNameLower === "backpack" && (window as any).backpack) {
      adapter = (window as any).backpack;
    } else if ((window as any).solana) {
      adapter = (window as any).solana;
    }
    
    if (adapter && adapter.publicKey) {
      return adapter.publicKey.toString();
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

