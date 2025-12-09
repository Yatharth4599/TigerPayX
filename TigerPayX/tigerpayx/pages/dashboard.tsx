// Improved DeFi-only TigerPayX Dashboard with enhanced UI/UX

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { Navbar } from "@/components/Navbar";
import { isAuthenticated, getAuthHeader } from "@/utils/auth";
import { createWallet, hasWallet, getStoredWalletAddress } from "@/app/wallet/createWallet";
import { getAllTokenBalances, isValidSolanaAddress, getSolBalance } from "@/app/wallet/solanaUtils";
import { sendP2PPayment } from "@/app/payments/p2pSend";
import { parseQRCode } from "@/app/payments/qrScanner";
import { getSwapPreview, executeSwap } from "@/app/swap/swapExecute";
import { registerMerchant, getUserMerchants } from "@/app/merchant/registerMerchant";
import { createPayLink, getMerchantPayLinks } from "@/app/merchant/createPayLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { showToast } from "@/components/Toast";
import { CopyButton } from "@/components/CopyButton";
import { QRScanner } from "@/components/QRScanner";
import { MerchantFormModal } from "@/components/MerchantFormModal";
import { PayLinkFormModal } from "@/components/PayLinkFormModal";
import { MerchantDashboard } from "@/components/MerchantDashboard";
import { WalletConnectionModal } from "@/components/WalletConnectionModal";
import { FundWalletModal } from "@/components/FundWalletModal";
import { SeedPhraseModal } from "@/components/SeedPhraseModal";
import { ImportWalletPrompt } from "@/components/ImportWalletPrompt";
import { formatAddress, formatTokenAmount, getSolanaExplorerUrl } from "@/utils/formatting";
import { SOLANA_CONFIG } from "@/shared/config";
import { STORAGE_KEYS } from "@/shared/constants";
import type { Token, WalletBalance, Transaction as TxType } from "@/shared/types";

// Check if custom RPC is configured (not using default public endpoints)
const isCustomRpcConfigured = () => {
  const rpcUrl = SOLANA_CONFIG.rpcUrl;
  // Default public endpoints that indicate no custom RPC is configured
  const defaultEndpoints = [
    "https://solana-api.projectserum.com",
    "https://api.mainnet-beta.solana.com",
    "https://api.devnet.solana.com",
  ];
  // If RPC URL is not in the default list, assume custom RPC is configured
  return !defaultEndpoints.includes(rpcUrl);
};

type ActiveTab = "home" | "send" | "swap" | "earn" | "merchant";

// Disable SSR for dashboard (client-side only)
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("merchant"); // Default to merchant for demo
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<TxType[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Send tab state
  const [sendToAddress, setSendToAddress] = useState("");
  const [sendToken, setSendToken] = useState<Token>("USDC");
  const [sendAmount, setSendAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [solBalance, setSolBalance] = useState<number>(0);

  // Swap tab state
  const [swapFrom, setSwapFrom] = useState<Token>("USDC");
  const [swapTo, setSwapTo] = useState<Token>("SOL");
  const [swapAmount, setSwapAmount] = useState("");
  const [swapPreview, setSwapPreview] = useState<any>(null);
  const [swapping, setSwapping] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Merchant tab state
  const [merchants, setMerchants] = useState<any[]>([]);
  const [showMerchantForm, setShowMerchantForm] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [payLinks, setPayLinks] = useState<any[]>([]);
  const [showPayLinkForm, setShowPayLinkForm] = useState(false);
  const [pendingPayLinkForm, setPendingPayLinkForm] = useState(false);
  const [showWalletConnection, setShowWalletConnection] = useState(false);
  const [showFundWallet, setShowFundWallet] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [newWalletSeedPhrase, setNewWalletSeedPhrase] = useState<string>("");
  const [newWalletAddress, setNewWalletAddress] = useState<string>("");
  const [showWalletAddress, setShowWalletAddress] = useState(true); // Toggle to show/hide address
  const [showImportWalletPrompt, setShowImportWalletPrompt] = useState(false);
  const [existingWalletAddress, setExistingWalletAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check authentication (disabled for demo mode)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkAuth = async () => {
        // Demo mode: Allow access without authentication
        const urlParams = new URLSearchParams(window.location.search);
        const demoMode = urlParams.get('demo') === 'true' || !isAuthenticated();
        
        if (!isAuthenticated() && !demoMode) {
          // Only redirect if not in demo mode
          // await router.push("/login");
        }
        
        // Set auth checked to allow demo access
        setAuthChecked(true);
        
        // Initialize with demo data if not authenticated
        if (!isAuthenticated()) {
          // Use a valid Solana address format for demo (but skip actual balance loading)
          // This is a valid format: 44 characters base58
          const demoAddress = "11111111111111111111111111111111"; // Valid Solana address format
          setWalletAddress(demoAddress);
          // Set demo balances directly (skip API calls)
          setBalances({
            sol: "10.5",
            usdc: "5000",
            usdt: "2500",
            tt: "0",
          } as WalletBalance);
          setSolBalance(10.5);
          // Set demo transactions
          setTransactions([
            {
              id: "1",
              type: "pay",
              fromAddress: demoAddress,
              toAddress: demoAddress,
              amount: "100",
              token: "USDC",
              txHash: "demo-tx-hash-123",
              status: "confirmed",
              description: "Payment received",
              createdAt: new Date().toISOString(),
            } as TxType,
          ]);
          // Set demo merchants
          setMerchants([
            {
              id: "demo-merchant-1",
              merchantId: "MERCHANT_DEMO_001",
              name: "Demo Store",
              settlementAddress: demoAddress,
              preferredToken: "USDC",
            },
          ]);
          const demoMerchant = {
            id: "demo-merchant-1",
            merchantId: "MERCHANT_DEMO_001",
            name: "Demo Store",
            settlementAddress: demoAddress,
            preferredToken: "USDC",
          };
          setSelectedMerchant(demoMerchant);
          // Switch to merchant tab in demo mode
          setActiveTab("merchant");
          setLoading(false);
        } else {
          await initializeWallet();
        }
      };
      checkAuth();
    }
  }, [router]);

  // Handle wallet connection
  const handleWalletConnect = async (address: string) => {
    try {
      // Store the connected wallet address
      if (typeof window !== "undefined") {
        localStorage.setItem("tigerpayx_wallet_address", address);
      }
      setWalletAddress(address);
      await loadBalances();
      await loadTransactions();
      showToast("Wallet connected successfully!", "success");
    } catch (error: any) {
      showToast("Error connecting wallet: " + error.message, "error");
    }
  };

  // Initialize wallet
  const initializeWallet = async () => {
    try {
      let address: string | null = null;
      
      // ALWAYS check database first - wallet is linked to email
      const userResponse = await fetch("/api/user", {
        headers: getAuthHeader(),
      });
      
      let dbWalletAddress: string | null = null;
      if (userResponse.ok) {
        const userData = await userResponse.json();
        dbWalletAddress = userData.solanaAddress || null;
        setIsAdmin(userData.isAdmin || false);
      }
      
      // Check if user has a wallet in localStorage
      const localWallet = hasWallet();
      const localWalletAddress = localWallet ? getStoredWalletAddress() : null;
      
      if (dbWalletAddress) {
        // User has a wallet linked to their email in database
        if (localWalletAddress && localWalletAddress === dbWalletAddress) {
          // Perfect match - wallet in localStorage matches database
          address = localWalletAddress;
          setWalletAddress(address);
        } else {
          // Mismatch or no local wallet
          // Clear any wrong wallet from localStorage
          if (localWalletAddress && localWalletAddress !== dbWalletAddress) {
            // Clear the wrong wallet from localStorage
            if (typeof window !== "undefined") {
              localStorage.removeItem(STORAGE_KEYS.WALLET_PRIVATE_KEY);
              localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
              localStorage.removeItem(STORAGE_KEYS.WALLET_IMPORTED);
              localStorage.removeItem(STORAGE_KEYS.WALLET_SEED_SHOWN);
            }
            showToast("This wallet belongs to a different account. Please import your wallet for this email.", "warning");
          }
          
          // Use the email's wallet (from database) and ask to import
          address = dbWalletAddress;
          setWalletAddress(address);
          setExistingWalletAddress(dbWalletAddress);
          setShowImportWalletPrompt(true);
        }
      } else {
        // No wallet in database for this email
        // Clear any existing wallet from localStorage (might be from different user)
        if (localWalletAddress) {
          // Clear localStorage - this wallet might belong to a different user
          if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEYS.WALLET_PRIVATE_KEY);
            localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
            localStorage.removeItem(STORAGE_KEYS.WALLET_IMPORTED);
            localStorage.removeItem(STORAGE_KEYS.WALLET_SEED_SHOWN);
          }
        }
        
        // Create new wallet and link to this email
        const wallet = createWallet();
        address = wallet.publicKey;
        setNewWalletAddress(wallet.publicKey);
        setNewWalletSeedPhrase(wallet.seedPhrase);
        
        // Set wallet address immediately so it's visible
        setWalletAddress(address);
        
        // Show seed phrase only once for new wallets (non-custodial - user must save it)
        // Check if seed phrase was already shown (shouldn't happen for new wallets, but safety check)
        const seedAlreadyShown = typeof window !== "undefined" && 
          localStorage.getItem(STORAGE_KEYS.WALLET_SEED_SHOWN) === "true";
        if (!seedAlreadyShown) {
          setShowSeedPhrase(true);
        }
        
        // Store wallet address in database (linked to email)
        await updateWalletAddressInDB(address);
      }
      
      if (address) {
        await loadBalances();
        await loadTransactions();
      }
    } catch (error: any) {
      showToast("Error initializing wallet: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Update wallet address in database
  const updateWalletAddressInDB = async (address: string) => {
    try {
      const response = await fetch("/api/wallet/updateAddress", {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ solanaAddress: address }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to update wallet address:", error);
        // Don't show error to user, just log it
      }
    } catch (error) {
      console.error("Error updating wallet address:", error);
      // Don't show error to user, just log it
    }
  };

  // Handle seed phrase confirmation
  const handleSeedPhraseConfirmed = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.WALLET_SEED_SHOWN, "true");
    }
    setShowSeedPhrase(false);
    setNewWalletSeedPhrase("");
    
    if (newWalletAddress) {
      setWalletAddress(newWalletAddress);
      await loadBalances();
      await loadTransactions();
    }
    
    showToast("TigerPayX wallet created successfully!", "success");
  };

  // Load balances
  const loadBalances = async () => {
    if (!walletAddress) return;
    // Skip balance loading for demo mode (address starts with all 1s)
    if (walletAddress === "11111111111111111111111111111111") {
      console.log("[loadBalances] Skipping balance load for demo mode");
      return;
    }
    try {
      setRefreshing(true);
      console.log(`[loadBalances] Loading balances for ${walletAddress.substring(0, 8)}...`);
      const bal = await getAllTokenBalances(walletAddress);
      console.log(`[loadBalances] Loaded balances:`, bal);
      setBalances(bal);
      
      // Also load SOL balance separately for transaction fee checking
      try {
        const solBal = await getSolBalance(walletAddress);
        setSolBalance(solBal);
        console.log(`[loadBalances] SOL balance: ${solBal} SOL`);
      } catch (solError) {
        console.error("[loadBalances] Error loading SOL balance:", solError);
        setSolBalance(0);
      }
    } catch (error: any) {
      console.error("[loadBalances] Error loading balances:", error);
      setBalances({ sol: "0", usdc: "0", usdt: "0", tt: "0" });
      setSolBalance(0);
      showToast("Failed to load balances. Check console for details.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // Load transactions
  const loadTransactions = async () => {
    try {
      const response = await fetch("/api/transactions", {
        headers: getAuthHeader(),
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  // Handle send payment
  const handleSend = async () => {
    if (!sendToAddress || !sendAmount) {
      showToast("Please fill in all fields", "warning");
      return;
    }

    if (!isValidSolanaAddress(sendToAddress)) {
      showToast("Invalid wallet address", "error");
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    // Check balance
    if (balances) {
      const balance = parseFloat(balances[sendToken.toLowerCase() as keyof WalletBalance] || "0");
      if (amount > balance) {
        showToast(`Insufficient ${sendToken} balance`, "error");
        return;
      }
    }

    setSending(true);
    try {
      console.log(`[handleSend] Starting send: ${amount} ${sendToken} to ${sendToAddress}`);
      const result = await sendP2PPayment(sendToAddress, sendToken, amount);
      console.log(`[handleSend] Send result:`, result);
      
      if (result.success) {
        showToast(`Payment sent! Transaction: ${formatAddress(result.signature)}`, "success");
        setSendToAddress("");
        setSendAmount("");
        await loadBalances();
        await loadTransactions();
      } else {
        const errorMsg = result.error || "Payment failed";
        console.error(`[handleSend] Payment failed:`, errorMsg);
        showToast(errorMsg, "error");
      }
    } catch (error: any) {
      console.error(`[handleSend] Exception:`, error);
      const errorMsg = error.message || "An error occurred. Please check the console for details.";
      showToast(errorMsg, "error");
    } finally {
      setSending(false);
    }
  };

  // Handle QR scan
  const handleQRScan = (result: string) => {
    const parsed = parseQRCode(result);
    if (parsed) {
      setSendToAddress(parsed.address);
      if (parsed.amount) {
        setSendAmount(parsed.amount.toString());
      }
      if (parsed.token) {
        setSendToken(parsed.token as Token);
      }
      setShowQRScanner(false);
      showToast("QR code scanned successfully", "success");
      } else {
      showToast("Invalid QR code format", "error");
    }
  };

  // Handle swap preview
  const handleSwapPreview = async () => {
    if (!swapAmount) {
      showToast("Please enter an amount", "warning");
      return;
    }

    const amount = parseFloat(swapAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    if (swapFrom === swapTo) {
      showToast("Please select different tokens", "warning");
      return;
    }

    setPreviewLoading(true);
    try {
      const preview = await getSwapPreview(swapFrom, swapTo, amount);
      if (preview) {
        setSwapPreview(preview);
      } else {
        showToast("Failed to get swap quote", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Error getting swap quote", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle swap execute
  const handleSwap = async () => {
    if (!swapAmount || !swapPreview) {
      showToast("Please preview swap first", "warning");
      return;
    }

    setSwapping(true);
    try {
      const amount = parseFloat(swapAmount);
      const result = await executeSwap(swapFrom, swapTo, amount);
      if (result.success) {
        showToast(`Swap completed! Transaction: ${formatAddress(result.signature)}`, "success");
        setSwapAmount("");
        setSwapPreview(null);
        await loadBalances();
        await loadTransactions();
          } else {
        showToast(result.error || "Swap failed", "error");
          }
        } catch (error: any) {
      showToast(error.message || "An error occurred", "error");
    } finally {
      setSwapping(false);
    }
  };

  // Load merchants
  const loadMerchants = async () => {
    try {
      const result = await getUserMerchants();
      if (result.success && result.merchants) {
        setMerchants(result.merchants);
      } else {
        console.error("Failed to load merchants:", result.error);
        setMerchants([]);
      }
    } catch (error: any) {
      console.error("Error loading merchants:", error);
      showToast("Failed to load merchants: " + (error.message || "Unknown error"), "error");
      setMerchants([]);
    }
  };

  // Load pay links for merchant
  const loadPayLinks = async (merchantId: string) => {
    try {
      const result = await getMerchantPayLinks(merchantId);
      if (result.success && result.payLinks) {
        setPayLinks(result.payLinks);
      }
    } catch (error) {
      console.error("Error loading pay links:", error);
    }
  };

  useEffect(() => {
    if (authChecked && walletAddress) {
      loadBalances();
      loadTransactions();
      // Always load merchants for the dashboard
      loadMerchants();
    }
  }, [authChecked, walletAddress]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50/30 to-orange-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-900 text-lg">Loading TigerPayX...</p>
        </div>
      </div>
    );
  }

  const network = SOLANA_CONFIG.network;
  const isDevnet = network === "devnet";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50/30 to-orange-50/50 text-gray-900">
      <Navbar />
      {isAdmin && (
        <div className="section-padding pt-4">
          <div className="max-width">
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Dashboard
            </a>
          </div>
        </div>
      )}
      <main className="section-padding py-8 lg:py-12">
          <div className="max-width">
          {/* Network Indicator - Hidden */}
          {false && isDevnet && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
              <p className="text-sm text-yellow-400">Test Mode: Using Solana Devnet</p>
                  </div>
                )}

          {/* RPC Connection Warning - Hidden */}
          {false && !isCustomRpcConfigured() && (
            <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-400 mb-1">⚠️ RPC Provider Not Configured</p>
                <p className="text-xs text-orange-300">
                  You're using public RPC endpoints which are rate-limited. 
                  <a 
                    href="https://github.com/Yatharth4599/TigerPayX/blob/main/tigerpayx/SETUP_RPC_PROVIDER.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline ml-1 hover:text-orange-200"
                  >
                    Set up a free RPC provider
                  </a> for better reliability.
                </p>
              </div>
            </div>
          )}

          {/* Direct Merchant Dashboard - No Tabs */}
          {selectedMerchant ? (
            <div className="-mx-6 -my-8">
              <MerchantDashboard
                merchant={selectedMerchant}
                walletAddress={walletAddress || ""}
                balances={balances}
                transactions={transactions}
                onRefresh={async () => {
                  await loadBalances();
                  await loadTransactions();
                  if (selectedMerchant) {
                    await loadPayLinks(selectedMerchant.merchantId);
                  }
                }}
                onCreatePayLink={() => {
                  // Directly open pay link form - no merchant required
                  setShowPayLinkForm(true);
                }}
              />
            </div>
          ) : merchants.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Select a Merchant</h2>
                  <button
                    onClick={() => setShowMerchantForm(true)}
                    className="bg-[#ff6b00] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#e55a00] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Register Merchant
                  </button>
                </div>
                <div className="space-y-4">
                  {merchants.map((merchant) => (
                    <motion.div
                      key={merchant.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={async () => {
                        setSelectedMerchant(merchant);
                        await loadPayLinks(merchant.merchantId);
                      }}
                      className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 cursor-pointer border border-gray-200 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{merchant.name}</h3>
                          <p className="text-sm text-gray-600">ID: {merchant.merchantId}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
              <div className="text-6xl mb-4">🏪</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Merchants Yet</h3>
              <p className="text-gray-600 mb-6">Register as a merchant to start using the dashboard</p>
              <button
                onClick={() => setShowMerchantForm(true)}
                className="bg-[#ff6b00] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#e55a00] transition-colors"
              >
                Register Merchant
              </button>
            </div>
          )}

        {/* OLD TABS - REMOVED */}
        {false && activeTab === "home" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Wallet Card */}
            <div className="colorful-card p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">TigerPayX Wallet</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your crypto assets</p>
            </div>
                <div className="flex flex-wrap gap-2">
                  {walletAddress && (
                    <button
                      onClick={loadBalances}
                      disabled={refreshing}
                      className="px-4 py-2 bg-white border border-gray-200 hover:bg-orange-50 rounded-lg text-sm text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {refreshing ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                          Refresh
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setShowWalletConnection(true)}
                    className="px-4 py-2 bg-[#ff6b00] hover:bg-orange-500 rounded-lg text-sm text-black font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-[#ff6b00]/20"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    {walletAddress ? "Change Wallet" : "Connect Wallet"}
                  </button>
            </div>
          </div>

              {!walletAddress && (
                <div className="text-center py-12 mb-6 colorful-card">
                  <div className="text-6xl mb-4">👛</div>
                  <p className="text-lg text-gray-700 mb-2 font-medium">No wallet connected</p>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">Connect an existing wallet or import one to get started with TigerPayX</p>
                  <button
                    onClick={() => setShowWalletConnection(true)}
                    className="bg-[#ff6b00] text-black font-semibold px-8 py-3 rounded-lg hover:bg-orange-500 transition-colors shadow-lg shadow-[#ff6b00]/20"
                  >
                    Connect Wallet
                  </button>
                  </div>
              )}

              {walletAddress && (
                <>
                  <div className="mb-6 p-4 lg:p-6 colorful-card">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-wider text-gray-600 mb-2">Wallet Address</p>
                        <p className="text-gray-900 font-mono text-sm break-all select-all bg-white px-2 py-1 rounded border border-gray-200">
                          {showWalletAddress && walletAddress ? walletAddress : "•".repeat(44)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowWalletAddress(!showWalletAddress)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                          title={showWalletAddress ? "Hide address" : "Show address"}
                        >
                          {showWalletAddress ? (
                            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                        <CopyButton text={walletAddress!} />
                      </div>
                      </div>
                    </div>
                  <button
                    onClick={() => setShowFundWallet(true)}
                    className="w-full mb-6 bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b00]/20"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Funds from External Wallet
                  </button>
                </>
              )}

              {balances && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { token: "SOL", balance: balances!.sol, icon: "🟡", color: "from-yellow-500/20 to-orange-500/20" },
                    { token: "USDC", balance: balances!.usdc, icon: "🔵", color: "from-blue-500/20 to-cyan-500/20" },
                    { token: "USDT", balance: balances!.usdt, icon: "🟢", color: "from-green-500/20 to-emerald-500/20" },
                    { token: "TT", balance: balances!.tt, icon: "🟠", color: "from-orange-500/20 to-amber-500/20" },
                  ].map(({ token, balance, icon, color }) => (
                    <div
                      key={token}
                      className={`colorful-card p-4 lg:p-5 rounded-xl bg-gradient-to-br ${color} border border-gray-200 hover:border-orange-300 transition-all`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{icon}</span>
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">{token}</p>
                  </div>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-900">{formatTokenAmount(balance, token)}</p>
                    </div>
                  ))}
                    </div>
              )}
              </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Send", icon: "📤", tab: "send" as ActiveTab, desc: "Send crypto" },
                { label: "Swap", icon: "🔄", tab: "swap" as ActiveTab, desc: "Swap tokens" },
                { label: "Earn", icon: "💰", tab: "earn" as ActiveTab, desc: "Stake & earn" },
                { label: "Merchant", icon: "🏪", tab: "merchant" as ActiveTab, desc: "Accept payments" },
              ].map(({ label, icon, tab, desc }) => (
                  <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="colorful-card rounded-xl p-5 lg:p-6 hover:border-[#ff6b00] transition-all text-left group"
                >
                  <div className="text-3xl mb-3">{icon}</div>
                  <p className="text-gray-900 font-semibold group-hover:text-[#ff6b00] transition-colors mb-1">{label}</p>
                  <p className="text-xs text-gray-600">{desc}</p>
                  </motion.button>
              ))}
                </div>

            {/* Recent Transactions */}
            <div className="colorful-card rounded-xl p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Recent Transactions</h3>
                  <p className="text-sm text-gray-600 mt-1">Your latest activity</p>
                    </div>
                {transactions.length > 0 && (
                  <button
                    onClick={loadTransactions}
                    className="text-sm text-zinc-400 hover:text-[#ff6b00] transition-colors flex items-center gap-1"
                  >
                    View All
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                  </button>
                )}
                        </div>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-lg text-gray-700 mb-2 font-medium">No transactions yet</p>
                  <p className="text-sm text-gray-600">Start by sending a payment or swapping tokens</p>
                      </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 colorful-card rounded-lg hover:border-orange-300 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "send" ? "bg-red-500/20 text-red-400" :
                            tx.type === "swap" ? "bg-blue-500/20 text-blue-400" :
                            "bg-green-500/20 text-green-400"
                          }`}>
                            {tx.type === "send" ? "📤" : tx.type === "swap" ? "🔄" : "💰"}
                        </div>
                          <div>
                            <p className="text-gray-900 font-semibold capitalize">{tx.type}</p>
                    <p className="text-sm text-gray-600">
                              {formatTokenAmount(tx.amount, tx.token)} {tx.token}
                    </p>
                            {tx.description && (
                              <p className="text-xs text-gray-500 mt-1">{tx.description}</p>
                            )}
                  </div>
                  </div>
                  </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            tx.status === "confirmed" ? "text-green-400" :
                            tx.status === "failed" ? "text-red-400" :
                            "text-yellow-400"
                          }`}>
                            {tx.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                        {tx.txHash && (
                          <a
                            href={getSolanaExplorerUrl(tx.txHash, network)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            title="View on Solana Explorer"
                          >
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                </div>
                    </motion.div>
                  ))}
                </div>
              )}
              </div>
            </motion.div>
          )}

        {/* OLD SEND TAB - REMOVED */}
        {false && activeTab === "send" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            className="colorful-card rounded-xl p-6 max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Payment</h2>
            
            {/* Solana Chain Warning */}
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-400 mb-1">⚠️ Solana Network Required</p>
                  <p className="text-xs text-blue-300">
                    Make sure the recipient address is a <strong>Solana wallet address</strong>. Sending to addresses on other blockchains (Ethereum, BSC, etc.) will result in permanent loss of funds.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Show user's wallet address */}
            {walletAddress && (
              <div className="mb-6 p-4 colorful-card border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider text-gray-600 mb-2">Your Wallet Address</p>
                    <p className="text-gray-900 font-mono text-sm break-all select-all bg-white px-2 py-1 rounded border border-gray-200">
                      {showWalletAddress && walletAddress ? walletAddress : "•".repeat(44)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowWalletAddress(!showWalletAddress)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                      title={showWalletAddress ? "Hide address" : "Show address"}
                    >
                      {showWalletAddress ? (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    <CopyButton text={walletAddress!} />
                  </div>
                </div>
              </div>
            )}

            {!walletAddress && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  ⚠️ No wallet connected. Please connect or create a wallet first.
                    </p>
                  </div>
            )}

                <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">To Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sendToAddress}
                    onChange={(e) => setSendToAddress(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-mono text-sm placeholder:text-gray-400 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="Any Solana wallet address"
                  />
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="px-4 py-3 glass-panel tiger-stripes-soft hover:border-[#ff6b00]/50 border border-white/10 rounded-lg transition-all"
                    title="Scan QR Code"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                  </button>
                  </div>
                {sendToAddress && isValidSolanaAddress(sendToAddress) && (
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <span>✓</span> Valid address
                  </p>
                )}
                {sendToAddress && !isValidSolanaAddress(sendToAddress) && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <span>✗</span> Invalid address
                  </p>
                )}
                  </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Token</label>
                  <select
                    value={sendToken}
                    onChange={(e) => setSendToken(e.target.value as Token)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  >
                    <option value="SOL">SOL</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="TT">TT</option>
                  </select>
                  {balances && (
                    <p className="text-xs text-zinc-400 mt-2">
                      Balance: <span className="text-gray-900 font-medium">{formatTokenAmount(balances![sendToken.toLowerCase() as keyof WalletBalance] || "0", sendToken)} {sendToken}</span>
                    </p>
                  )}
              </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Amount</label>
                    <input
                    type="number"
                    step="0.000001"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#ff6b00] focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="0.00"
                  />
                {sendAmount && balances && (
                  <div className="flex gap-2 mt-2">
                    <button
                    onClick={() => {
                        if (!balances) return;
                        const balance = parseFloat(balances[sendToken.toLowerCase() as keyof WalletBalance] || "0");
                        setSendAmount((balance * 0.25).toFixed(6));
                      }}
                      className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-zinc-300"
                    >
                      25%
                    </button>
                    <button
                    onClick={() => {
                        if (!balances) return;
                        const balance = parseFloat(balances[sendToken.toLowerCase() as keyof WalletBalance] || "0");
                        setSendAmount((balance * 0.5).toFixed(6));
                      }}
                      className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-zinc-300"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => {
                        if (!balances) return;
                        const balance = parseFloat(balances[sendToken.toLowerCase() as keyof WalletBalance] || "0");
                        setSendAmount((balance * 0.75).toFixed(6));
                      }}
                      className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-zinc-300"
                    >
                      75%
                    </button>
                    <button
                          onClick={() => {
                        if (!balances) return;
                        const balance = parseFloat(balances[sendToken.toLowerCase() as keyof WalletBalance] || "0");
                        setSendAmount(balance.toFixed(6));
                      }}
                      className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-zinc-300"
                    >
                      Max
                    </button>
                  </div>
                )}
          </div>

                {/* Transaction Fees Info */}
                <div className="mt-4 p-4 glass-panel tiger-stripes-soft rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-300">Transaction Fees</span>
                    <span className="text-xs text-zinc-400">~0.000005 SOL</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Required SOL</span>
                    <span className="text-sm font-medium text-gray-700">0.001 SOL (minimum)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Your SOL Balance</span>
                    <span className={`text-sm font-medium ${solBalance >= 0.001 ? 'text-green-400' : solBalance > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {solBalance.toFixed(9)} SOL
                    </span>
                  </div>
                  {solBalance < 0.001 && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-xs text-yellow-400 mb-2">
                        ⚠️ Insufficient SOL for transaction fees. You need at least 0.001 SOL to send transactions.
                      </p>
                      <button
                        onClick={() => setShowFundWallet(true)}
                        className="w-full text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-medium py-2 rounded-lg transition-colors border border-yellow-500/30"
                      >
                        Add SOL to Wallet
                      </button>
                    </div>
                  )}
                  {solBalance === 0 && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-xs text-red-400 mb-2">
                        ❌ No SOL in wallet. You need SOL to pay for transaction fees.
                      </p>
                      <button
                        onClick={() => setShowFundWallet(true)}
                        className="w-full text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium py-2 rounded-lg transition-colors border border-red-500/30"
                      >
                        Add SOL to Wallet
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSend}
                  disabled={sending || !sendToAddress || !sendAmount || !isValidSolanaAddress(sendToAddress) || solBalance < 0.001}
                  className="w-full bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b00]/20 mt-4"
                >
                  {sending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Sending...
                    </>
                  ) : solBalance < 0.001 ? (
                    "Insufficient SOL for Fees"
                  ) : (
                    "Send Payment"
                  )}
                </button>
                    </div>
          </motion.div>
        )}

        {/* OLD SWAP TAB - REMOVED */}
        {false && activeTab === "swap" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="colorful-card rounded-xl p-6 max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Swap Tokens</h2>
                    <div className="space-y-4">
                            <div>
                <label className="block text-sm text-gray-700 mb-2">From</label>
                <select
                  value={swapFrom}
                  onChange={(e) => {
                    setSwapFrom(e.target.value as Token);
                    setSwapPreview(null);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="TT">TT</option>
                </select>
                {balances && (
                  <p className="text-xs text-zinc-500 mt-1">
                    Balance: {formatTokenAmount(balances![swapFrom.toLowerCase() as keyof WalletBalance] || "0", swapFrom)} {swapFrom}
                  </p>
                )}
                            </div>

              <div className="flex justify-center">
                          <button
                  onClick={() => {
                    const temp = swapFrom;
                    setSwapFrom(swapTo);
                    setSwapTo(temp);
                    setSwapPreview(null);
                  }}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                          </button>
                      </div>

                        <div>
                <label className="block text-sm text-zinc-400 mb-2">To</label>
                          <select
                  value={swapTo}
                  onChange={(e) => {
                    setSwapTo(e.target.value as Token);
                    setSwapPreview(null);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                >
                  <option value="SOL">SOL</option>
                            <option value="USDC">USDC</option>
                            <option value="USDT">USDT</option>
                  <option value="TT">TT</option>
                          </select>
                        </div>

                        <div>
                <label className="block text-sm text-zinc-400 mb-2">Amount</label>
                          <input
                  type="number"
                  step="0.000001"
                  value={swapAmount}
                  onChange={(e) => {
                    setSwapAmount(e.target.value);
                    setSwapPreview(null);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                            placeholder="0.00"
                          />
                        </div>

              {swapPreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0a0d0f] border border-white/10 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600">You will receive</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      swapPreview.priceImpact > 5 ? "bg-red-500/20 text-red-400" :
                      swapPreview.priceImpact > 1 ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {swapPreview.priceImpact.toFixed(2)}% impact
                    </span>
                      </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTokenAmount(swapPreview.outputAmount.toString(), swapTo)} {swapTo}
                  </p>
                </motion.div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSwapPreview}
                  disabled={!swapAmount || previewLoading || swapFrom === swapTo}
                  className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {previewLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Loading...
                          </>
                        ) : (
                    "Preview"
                  )}
                </button>
                <button
                  onClick={handleSwap}
                  disabled={swapping || !swapPreview}
                  className="flex-1 bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {swapping ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Swapping...
                    </>
                  ) : (
                    "Swap"
                  )}
                </button>
                      </div>
                    </div>
          </motion.div>
                  )}

        {/* OLD EARN TAB - REMOVED */}
        {false && activeTab === "earn" && (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
                <div className="colorful-card rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Earn Yield</h2>
              <p className="text-zinc-400 mb-6">Stake SOL to earn passive yield</p>
              <div className="space-y-4">
                <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-6 hover:border-[#ff6b00]/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Jito Staking</h3>
                      <p className="text-sm text-gray-600">Stake SOL with Jito validators</p>
                        </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#ff6b00]">~6%</p>
                      <p className="text-xs text-zinc-500">APY</p>
                        </div>
                        </div>
                  <button className="w-full bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors opacity-50 cursor-not-allowed">
                    Coming Soon
                  </button>
                        </div>
                <div className="bg-[#0a0d0f] border border-white/10 rounded-lg p-6 hover:border-[#ff6b00]/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Marinade Staking</h3>
                      <p className="text-sm text-gray-600">Liquid staking with Marinade Finance</p>
              </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#ff6b00]">~7%</p>
                      <p className="text-xs text-zinc-500">APY</p>
                  </div>
              </div>
                  <button className="w-full bg-[#ff6b00] text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition-colors opacity-50 cursor-not-allowed">
                    Coming Soon
                  </button>
                  </div>
              </div>
                </div>
              </motion.div>
            )}

        {/* OLD MERCHANT TAB - REMOVED */}
        {false && activeTab === "merchant" && (
          <>
            {merchants.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="colorful-card rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Merchant Dashboard</h2>
                    <button
                      onClick={() => setShowMerchantForm(true)}
                      className="bg-[#ff6b00] text-black font-semibold px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Register Merchant
                    </button>
                  </div>
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🏪</div>
                    <p className="text-zinc-400 mb-2">No merchants registered</p>
                    <p className="text-sm text-zinc-500 mb-6">Register a merchant to start accepting crypto payments</p>
                    <button
                      onClick={() => setShowMerchantForm(true)}
                      className="bg-[#ff6b00] text-black font-semibold px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : selectedMerchant ? (
              // Show new Merchant Dashboard when merchant is selected
              <div className="-mx-6 -my-8">
                <MerchantDashboard
                  merchant={selectedMerchant}
                  walletAddress={walletAddress || ""}
                  balances={balances}
                  transactions={transactions}
                  onRefresh={async () => {
                    await loadBalances();
                    await loadTransactions();
                    if (selectedMerchant) {
                      await loadPayLinks(selectedMerchant.merchantId);
                    }
                  }}
                  onCreatePayLink={() => {
                    // Directly open pay link form - no merchant required
                    setShowPayLinkForm(true);
                  }}
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="colorful-card rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Select a Merchant</h2>
                    <button
                      onClick={() => setShowMerchantForm(true)}
                      className="bg-[#ff6b00] text-black font-semibold px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Register Merchant
                    </button>
                  </div>
                  <div className="space-y-4">
                    {merchants.map((merchant) => (
                      <motion.div
                        key={merchant.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={async () => {
                          setSelectedMerchant(merchant);
                          await loadPayLinks(merchant.merchantId);
                        }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#ff6b00] transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{merchant.name}</h3>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">
                                <span className="text-gray-500">ID:</span> {merchant.merchantId}
                              </p>
                              <p className="text-gray-600">
                                <span className="text-gray-500">Settlement:</span> {formatAddress(merchant.settlementAddress)}
                              </p>
                              <p className="text-gray-600">
                                <span className="text-gray-500">Token:</span> {merchant.preferredToken}
                              </p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-[#ff6b00] hover:bg-orange-500 rounded-lg text-sm text-black font-semibold transition-colors">
                            Open Dashboard
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}


        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />
        )}

        {/* Merchant Form Modal */}
        {showMerchantForm && (
          <MerchantFormModal
            isOpen={showMerchantForm}
            onClose={() => {
              setShowMerchantForm(false);
              setPendingPayLinkForm(false);
            }}
            onSuccess={async () => {
              await loadMerchants();
              setShowMerchantForm(false);
              // If pay link form was pending, open it now
              if (pendingPayLinkForm) {
                setPendingPayLinkForm(false);
                // Wait a bit for merchants to load
                setTimeout(async () => {
                  await loadMerchants();
                  if (merchants.length > 0) {
                    setSelectedMerchant(merchants[0]);
                    setShowPayLinkForm(true);
                  }
                }, 300);
              }
            }}
            defaultSettlementAddress={walletAddress || undefined}
          />
        )}

        {/* PayLink Form Modal */}
        {showPayLinkForm && (
          <PayLinkFormModal
            isOpen={showPayLinkForm}
            onClose={() => {
              setShowPayLinkForm(false);
            }}
            merchantId={selectedMerchant?.merchantId || merchants[0]?.merchantId}
            onSuccess={() => {
              const merchant = selectedMerchant || merchants[0];
              if (merchant) {
                loadPayLinks(merchant.merchantId);
              }
              // Reload merchants in case a new one was created
              loadMerchants();
            }}
          />
        )}

        {/* Wallet Connection Modal */}
        <WalletConnectionModal
          isOpen={showWalletConnection}
          onClose={() => setShowWalletConnection(false)}
          onConnect={handleWalletConnect}
        />

        {/* Fund Wallet Modal */}
        {walletAddress && (
          <FundWalletModal
            isOpen={showFundWallet}
            onClose={() => setShowFundWallet(false)}
            walletAddress={walletAddress}
          />
        )}

        {/* Seed Phrase Modal */}
        <SeedPhraseModal
          isOpen={showSeedPhrase}
          seedPhrase={newWalletSeedPhrase}
          walletAddress={newWalletAddress}
          onClose={() => {
            // Don't allow closing without confirming
            showToast("Please save your seed phrase before continuing", "warning");
          }}
          onConfirm={handleSeedPhraseConfirmed}
        />

        <ImportWalletPrompt
          isOpen={showImportWalletPrompt}
          existingAddress={existingWalletAddress || ""}
          onClose={() => {
            setShowImportWalletPrompt(false);
            showToast("Please import your wallet to access your funds", "warning");
          }}
          onImport={async (address) => {
            setWalletAddress(address);
            setShowImportWalletPrompt(false);
            setExistingWalletAddress(null);
            await loadBalances();
            await loadTransactions();
            showToast("Wallet imported successfully!", "success");
          }}
        />
        </div>
      </main>
    </div>
  );
}

// Disable static generation - use server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}
