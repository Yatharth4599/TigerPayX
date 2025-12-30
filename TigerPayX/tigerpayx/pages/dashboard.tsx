import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { Navbar } from "@/components/Navbar";
import { isAuthenticated, getAuthEmail } from "@/utils/auth";
import { getDetectedWallets, connectWallet, disconnectWallet, getConnectedWalletAddress, DetectedWallet } from "@/app/wallet/walletDetection";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showSendPaymentModal, setShowSendPaymentModal] = useState(false);
  const [showReceivePaymentModal, setShowReceivePaymentModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [selectedWithdrawCurrency, setSelectedWithdrawCurrency] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [solPrice, setSolPrice] = useState<number>(150); // Default SOL price, will fetch real price
  
  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankCode, setBankCode] = useState<string>(""); // IFSC/Routing/Bank Code
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositWalletAddress, setDepositWalletAddress] = useState<string>("");

  // Handle OnMeta callback
  useEffect(() => {
    const handleOnMetaCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('onmeta_callback') === 'true') {
        // Handle return from OnMeta
        const type = urlParams.get('type') || 'deposit'; // deposit, withdrawal, kyc
        const status = urlParams.get('status') || urlParams.get('success');
        const orderId = urlParams.get('orderId') || urlParams.get('order_id');
        const error = urlParams.get('error') || urlParams.get('errorMessage');
        
        console.log('OnMeta callback received:', { type, status, orderId, error });
        
        if (type === 'kyc') {
          if (status === 'success' || status === 'completed') {
            alert('KYC verification completed successfully!');
          } else if (error) {
            alert(`KYC verification failed: ${error}`);
          }
        } else if (type === 'withdrawal' || urlParams.get('withdrawal') === 'true') {
          if (status === 'success' || status === 'completed') {
            alert('Withdrawal completed successfully!');
          } else if (error || status === 'failed') {
            alert(`Withdrawal failed: ${error || 'Please try again.'}`);
          }
        } else {
          // Default to deposit/onramp
          if (status === 'success' || status === 'completed' || urlParams.get('success') === 'true') {
            alert('Deposit completed successfully!');
            // Refresh wallet balance or update UI
          } else if (error || status === 'failed' || urlParams.get('failed') === 'true') {
            alert(`Deposit failed: ${error || 'Please try again.'}`);
          } else if (urlParams.get('cancelled') === 'true') {
            alert('Deposit was cancelled.');
          }
        }
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/dashboard');
      }
    };

    if (typeof window !== 'undefined') {
      handleOnMetaCallback();
    }
  }, []);

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      setProfileLoading(true);
      try {
        // For development: use mock data
        const isDevelopment = process.env.NODE_ENV === "development" || window.location.hostname === "localhost";
        if (isDevelopment) {
          // Mock user profile for local testing
          setUserProfile({
            name: "John Doe",
            email: getAuthEmail() || "user@example.com",
            handle: "@johndoe",
            avatarInitials: "JD",
            createdAt: new Date().toISOString(),
          });
          setProfileLoading(false);
          return;
        }

        // In production: fetch real user data
        const response = await fetch("/api/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("tigerpayx_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (authChecked) {
      loadUserProfile();
    }
  }, [authChecked]);

  // Check authentication (bypassed in development for local testing)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkAuth = async () => {
        // Allow local testing without authentication - bypass auth check
        // Remove this bypass when ready for production
        const isDevelopment = process.env.NODE_ENV === "development" || window.location.hostname === "localhost";
        
        if (isDevelopment) {
          // Skip authentication in development for local testing
          setAuthChecked(true);
          setLoading(false);
          return;
        }
        
        // Require authentication in production
        if (!isAuthenticated()) {
          await router.push("/login");
          return;
        }
        setAuthChecked(true);
        setLoading(false);
      };
      checkAuth();
    }
  }, [router]);

  // Detect wallets (but don't auto-connect - only restore from localStorage if user explicitly connected)
  useEffect(() => {
    if (typeof window !== "undefined" && authChecked) {
      // Detect available wallets
      const wallets = getDetectedWallets();
      setDetectedWallets(wallets);
      
      // Don't auto-connect from wallet adapter - only restore from localStorage if user previously connected
      // This prevents reconnecting after user explicitly disconnects
    }
  }, [authChecked]);

  // Handle wallet connection
  const handleConnectWallet = async (walletName: string) => {
    setConnectingWallet(walletName);
    try {
      const result = await connectWallet(walletName);
      if (result.success && result.publicKey) {
        setWalletConnected(true);
        setWalletAddress(result.publicKey);
        setConnectedWalletName(walletName);
        setShowWalletModal(false);
        // Store in localStorage for persistence
        localStorage.setItem("tigerpayx_wallet_address", result.publicKey);
        localStorage.setItem("tigerpayx_wallet_name", walletName);
      } else {
        alert(result.error || "Failed to connect wallet");
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      alert(error.message || "Failed to connect wallet. Please make sure the wallet extension is installed.");
    } finally {
      setConnectingWallet(null);
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    try {
      // Disconnect from wallet extension if connected
      if (connectedWalletName) {
        try {
          await disconnectWallet(connectedWalletName);
        } catch (error) {
          console.error("Error disconnecting from wallet extension:", error);
          // Continue anyway - we'll clear local state
        }
      }
      
      // Clear all state and localStorage
      setWalletConnected(false);
      setWalletAddress(null);
      setConnectedWalletName(null);
      setWalletBalance(null);
      
      // Clear localStorage to prevent auto-reconnection on refresh
      localStorage.removeItem("tigerpayx_wallet_address");
      localStorage.removeItem("tigerpayx_wallet_name");
    } catch (error) {
      console.error("Error in disconnect process:", error);
      // Still clear state even if there's an error
      setWalletConnected(false);
      setWalletAddress(null);
      setConnectedWalletName(null);
      setWalletBalance(null);
      localStorage.removeItem("tigerpayx_wallet_address");
      localStorage.removeItem("tigerpayx_wallet_name");
    }
  };

  // Load stored wallet connection on mount (only if localStorage has it - user explicitly connected before)
  useEffect(() => {
    if (typeof window !== "undefined" && authChecked) {
      const storedAddress = localStorage.getItem("tigerpayx_wallet_address");
      const storedName = localStorage.getItem("tigerpayx_wallet_name");
      
      // Only restore if localStorage has stored connection (user explicitly connected before)
      // Don't check wallet adapter directly - respect user's explicit disconnect action
      if (storedAddress && storedName) {
        // Optionally verify wallet is still connected to extension (but don't auto-connect if not)
        try {
          const address = getConnectedWalletAddress(storedName);
          if (address && address === storedAddress) {
            // Wallet extension still shows connected, restore state
            setWalletConnected(true);
            setWalletAddress(storedAddress);
            setConnectedWalletName(storedName);
          } else {
            // Wallet extension shows disconnected or different address, clear localStorage
            localStorage.removeItem("tigerpayx_wallet_address");
            localStorage.removeItem("tigerpayx_wallet_name");
            setWalletConnected(false);
            setWalletAddress(null);
            setConnectedWalletName(null);
          }
        } catch (error) {
          // Error checking wallet - clear stored connection
          localStorage.removeItem("tigerpayx_wallet_address");
          localStorage.removeItem("tigerpayx_wallet_name");
          setWalletConnected(false);
          setWalletAddress(null);
          setConnectedWalletName(null);
        }
      } else {
        // No stored connection - ensure state is cleared
        setWalletConnected(false);
        setWalletAddress(null);
        setConnectedWalletName(null);
      }
    }
  }, [authChecked]);

  // Fetch SOL price in USD
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
        const data = await response.json();
        if (data.solana?.usd) {
          setSolPrice(data.solana.usd);
        }
      } catch (error) {
        console.error("Failed to fetch SOL price:", error);
        // Keep default price if fetch fails
      }
    };
    fetchSolPrice();
    // Refresh price every 60 seconds
    const interval = setInterval(fetchSolPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch wallet balance via API route (avoids CORS and RPC restrictions)
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!walletAddress || !walletConnected) {
        setWalletBalance(null);
        return;
      }

      setBalanceLoading(true);
      try {
        const response = await fetch("/api/wallet/balance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch balance");
        }

        const data = await response.json();
        setWalletBalance(data.balance || data.sol || 0);
      } catch (error: any) {
        console.error("Failed to fetch wallet balance:", error);
        setWalletBalance(null);
      } finally {
        setBalanceLoading(false);
      }
    };

    if (walletConnected && walletAddress) {
      fetchWalletBalance();
      // Refresh balance every 30 seconds
      const interval = setInterval(fetchWalletBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [walletConnected, walletAddress]);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b00] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Profile Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
        >
          {profileLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff6b00]"></div>
            </div>
          ) : userProfile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {userProfile.avatarInitials || (userProfile.name?.charAt(0) || "U")}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {userProfile.name || "User"}
                  </h3>
                  <p className="text-gray-600 text-sm">{userProfile.handle || userProfile.email}</p>
                </div>
              </div>
              <button className="text-[#ff6b00] hover:text-[#e55a00] font-semibold text-sm px-4 py-2 hover:bg-orange-50 rounded-lg transition-colors">
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No profile data available
            </div>
          )}
        </motion.div>

        {/* Balance Section */}
        {walletConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-3xl p-8 md:p-10 border border-orange-300 shadow-2xl relative overflow-hidden">
              <motion.div
                className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-2">Total Balance</p>
                    {balanceLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Loading...</h2>
                      </div>
                    ) : (
                      <h2 className="text-4xl md:text-5xl font-bold text-white">
                        ${walletBalance !== null ? (walletBalance * solPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </h2>
                    )}
                    {walletBalance !== null && (
                      <p className="text-white/70 text-lg mt-2">
                        {walletBalance.toFixed(4)} SOL
                      </p>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setShowSendPaymentModal(true)}
                    className="bg-white text-[#ff6b00] py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => setShowReceivePaymentModal(true)}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/30 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
                  >
                    Receive
                  </button>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/30 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions - Only show if wallet not connected (balance section already has send/receive) */}
        {!walletConnected && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Send Money */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-3xl p-8 border border-orange-300 shadow-2xl relative overflow-hidden"
          >
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Send Money</h2>
              <p className="text-white/90 mb-6">Send payments to anyone, anywhere instantly</p>
              <button 
                onClick={() => setShowSendPaymentModal(true)}
                className="w-full bg-white text-[#ff6b00] py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Send Payment
              </button>
            </div>
          </motion.div>

          {/* Receive Money / Payment Link */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 border border-green-400 shadow-2xl relative overflow-hidden"
          >
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Receive Money</h2>
              <p className="text-white/90 mb-6">Create a payment link to receive payments</p>
              <button 
                onClick={() => setShowReceivePaymentModal(true)}
                className="w-full bg-white text-green-600 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Receive Payment
              </button>
            </div>
          </motion.div>
          </div>
        )}

        {/* Services Section - KYC & Bank Account */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* KYC Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Complete KYC</h3>
                <p className="text-sm text-gray-600">Verify identity to unlock features</p>
              </div>
            </div>
            <button 
              onClick={async () => {
                try {
                  // Call OnMeta KYC API
                  const response = await fetch('/api/onmeta/kyc', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId: getAuthEmail() || undefined,
                      redirectUrl: `${window.location.origin}/dashboard?onmeta_callback=true&type=kyc`,
                    }),
                  });

                  const data = await response.json();
                  
                  if (data.success && data.kycUrl) {
                    // Redirect to OnMeta's KYC page
                    window.location.href = data.kycUrl;
                  } else {
                    alert(data.error || 'Failed to initiate KYC. Please try again.');
                  }
                } catch (error: any) {
                  console.error('KYC error:', error);
                  alert(`Error: ${error.message || 'Failed to initiate KYC. Please try again.'}`);
                }
              }}
              className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
            >
              Start KYC
            </button>
          </motion.div>

          {/* Link Bank Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Link Bank</h3>
                <p className="text-sm text-gray-600">Connect bank for fiat transactions</p>
              </div>
            </div>
            <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
              Link Account
            </button>
          </motion.div>
        </div>

        {/* Wallet & Card Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Connect Crypto Wallet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Connect Wallet</h3>
                  <p className="text-sm text-gray-600">Connect crypto wallet for payments</p>
                </div>
              </div>
              
              {!walletConnected ? (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-gray-900 font-semibold text-sm">Connected</div>
                    <button
                      onClick={handleDisconnectWallet}
                      className="text-gray-500 hover:text-gray-700 text-xs underline"
                    >
                      Disconnect
                    </button>
                  </div>
                  <div className="text-gray-700 text-sm font-mono">
                    {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Unknown"}
                  </div>
                  {connectedWalletName && (
                    <div className="text-gray-500 text-xs mt-1">{connectedWalletName}</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Tiger Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
          >
            {/* Coming Soon Overlay - Subtle badge style */}
            <div className="absolute top-2 right-2 z-20">
              <div className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                Coming Soon
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Tiger Card</h3>
                  <p className="text-sm text-gray-600">Spend crypto anywhere</p>
                </div>
              </div>
              <button className="w-full bg-[#ff6b00] text-white py-3 rounded-xl font-semibold hover:bg-[#e55a00] transition-colors opacity-60 cursor-not-allowed" disabled>
                Apply for Card
              </button>
            </div>
          </motion.div>
        </div>

        {/* Earn & Lending Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Earn Yield */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
          >
            {/* Coming Soon Badge */}
            <div className="absolute top-2 right-2 z-20">
              <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                Coming Soon
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Earn Yield</h3>
                  <p className="text-sm text-gray-600">2% per swap transaction</p>
                </div>
              </div>
              <button className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors opacity-60 cursor-not-allowed" disabled>
                Start Earning
              </button>
            </div>
          </motion.div>

          {/* Take Loan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
          >
            {/* Coming Soon Badge */}
            <div className="absolute top-2 right-2 z-20">
              <div className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                Coming Soon
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Take Loan</h3>
                  <p className="text-sm text-gray-600">Collateral & collateral-free</p>
                </div>
              </div>
              <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors opacity-60 cursor-not-allowed" disabled>
                Apply for Loan
              </button>
            </div>
          </motion.div>
        </div>

        {/* Roar Score Section - Hide for cleaner UI, can be enabled later */}
        {false && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-br from-[#ff6b00] to-[#ff8c42] rounded-2xl p-6 md:p-8 border border-orange-300 shadow-xl relative overflow-hidden mb-8"
        >
          {/* Animated background elements */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm text-white mb-4">
                  <span className="h-2 w-2 bg-white rounded-full"></span>
                  <span>Your Credit Score</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Roar Score
                </h2>
                <p className="text-white/90 text-lg">
                  Build your creditworthiness and unlock better loan terms
                </p>
              </div>
              <div className="text-6xl">🦁</div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Score Display */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-white mb-2">850</div>
                  <div className="text-white/80 text-sm uppercase tracking-wider">Excellent</div>
                </div>
                
                {/* Score Breakdown */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-white/90 text-sm mb-2">
                      <span>Wallet Activity</span>
                      <span>90%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "90%" }}
                        transition={{ duration: 1, delay: 1 }}
                        className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-white/90 text-sm mb-2">
                      <span>Transaction History</span>
                      <span>85%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 1, delay: 1.2 }}
                        className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-white/90 text-sm mb-2">
                      <span>Payment Frequency</span>
                      <span>95%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "95%" }}
                        transition={{ duration: 1, delay: 1.4 }}
                        className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Options */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">💎</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">Collateral Loans</div>
                      <div className="text-white/70 text-sm">Higher Limits</div>
                    </div>
                  </div>
                  <div className="text-white/80 text-sm mb-4">
                    Provide collateral for higher loan amounts and better interest rates
                  </div>
                  <button className="w-full bg-white text-[#ff6b00] py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                    Learn More
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">Collateral-Free Loans</div>
                      <div className="text-white/70 text-sm">Based on Roar Score</div>
                    </div>
                  </div>
                  <div className="text-white/80 text-sm mb-4">
                    Get loans without collateral based on your transaction history and Roar Score
                  </div>
                  <button className="w-full bg-white text-[#ff6b00] py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Send Payment Modal */}
        {showSendPaymentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Choose Payment Method</h3>
                <button
                  onClick={() => setShowSendPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Fiat Payments Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Fiat Payments via OnMeta</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* INR - UPI */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPaymentMethod('INR')}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all text-left"
                    >
                      <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
                        <span className="text-2xl">🇮🇳</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">INR (UPI)</h3>
                      <p className="text-gray-600 text-xs">Indian Rupees via UPI</p>
                      <div className="mt-2 text-xs text-blue-600 font-medium">Powered by OnMeta</div>
                    </motion.button>

                    {/* PHP - GCash */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPaymentMethod('PHP')}
                      className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border-2 border-cyan-200 hover:border-cyan-400 transition-all text-left"
                    >
                      <div className="w-14 h-14 bg-cyan-500 rounded-xl flex items-center justify-center mb-3">
                        <span className="text-2xl">🇵🇭</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">PHP (GCash)</h3>
                      <p className="text-gray-600 text-xs">Philippine Pesos via GCash</p>
                      <div className="mt-2 text-xs text-cyan-600 font-medium">Powered by OnMeta</div>
                    </motion.button>

                    {/* IDR */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPaymentMethod('IDR')}
                      className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200 hover:border-red-400 transition-all text-left"
                    >
                      <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center mb-3">
                        <span className="text-2xl">🇮🇩</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">IDR</h3>
                      <p className="text-gray-600 text-xs">Indonesian Rupiah</p>
                      <div className="mt-2 text-xs text-red-600 font-medium">Powered by OnMeta</div>
                    </motion.button>
                  </div>
                </div>

                {/* Crypto Payments Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Crypto Payments</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Stables - Conditional Locked/Unlocked */}
                    {walletConnected ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPaymentMethod('STABLES')}
                        className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200 hover:border-orange-400 transition-all text-left"
                      >
                        <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mb-3">
                          <span className="text-2xl">💎</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Stablecoins</h3>
                        <p className="text-gray-600 text-xs">Pay with USDC, USDT</p>
                      </motion.button>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 border-2 border-gray-300 border-dashed text-left relative opacity-60 cursor-not-allowed">
                        <div className="absolute top-4 right-4">
                          <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-14 h-14 bg-gray-400 rounded-xl flex items-center justify-center mb-3">
                          <span className="text-2xl">💎</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-1">Stablecoins</h3>
                        <p className="text-gray-500 text-xs mb-2">Pay with USDC, USDT</p>
                        <p className="text-xs text-gray-600 font-medium mt-3 pt-3 border-t border-gray-300">
                          🔒 Connect your wallet to TigerPayX to unlock this
                        </p>
                      </div>
                    )}

                    {/* Bank Account Transfer */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPaymentMethod('BANK')}
                      className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-gray-400 transition-all text-left"
                    >
                      <div className="w-14 h-14 bg-gray-600 rounded-xl flex items-center justify-center mb-3">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Bank Transfer</h3>
                      <p className="text-gray-600 text-xs">Direct bank transfer</p>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Payment Method Selected - Show Details */}
              {selectedPaymentMethod && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Selected: {selectedPaymentMethod}</h4>
                    <button
                      onClick={() => {
                        setSelectedPaymentMethod(null);
                        setDepositAmount('');
                        setDepositWalletAddress('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Amount Input for Fiat Deposits */}
                  {['INR', 'PHP', 'IDR'].includes(selectedPaymentMethod) && (
                    <div className="mb-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount to Deposit
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            {selectedPaymentMethod === 'INR' && '₹'}
                            {selectedPaymentMethod === 'PHP' && '₱'}
                            {selectedPaymentMethod === 'IDR' && 'Rp'}
                          </div>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all bg-white"
                          />
                        </div>
                      </div>
                      
                      {/* Wallet Address Input (Optional - can use connected wallet or enter manually) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Crypto Wallet Address {walletAddress && <span className="text-gray-400 text-xs">(pre-filled from connected wallet)</span>}
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your crypto wallet address (USDC/USDT)"
                          value={depositWalletAddress || walletAddress || ''}
                          onChange={(e) => setDepositWalletAddress(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all bg-white font-mono text-sm"
                        />
                        {walletAddress && !depositWalletAddress && (
                          <p className="mt-1 text-xs text-green-600">Using your connected wallet address</p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          The crypto will be sent to this address after deposit
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-4">
                    {selectedPaymentMethod === 'INR' && 'You will be redirected to OnMeta to complete your INR deposit via UPI'}
                    {selectedPaymentMethod === 'PHP' && 'You will be redirected to OnMeta to complete your PHP deposit via GCash'}
                    {selectedPaymentMethod === 'IDR' && 'You will be redirected to OnMeta to complete your IDR deposit'}
                    {selectedPaymentMethod === 'STABLES' && 'Continue with stablecoin payment'}
                    {selectedPaymentMethod === 'BANK' && 'Continue with bank transfer'}
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedPaymentMethod(null);
                        setDepositAmount('');
                        setDepositWalletAddress('');
                        setShowSendPaymentModal(false);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        // Handle deposit/payment initiation via OnMeta API
                        if (['INR', 'PHP', 'IDR'].includes(selectedPaymentMethod || '')) {
                          const amount = parseFloat(depositAmount);
                          if (isNaN(amount) || amount <= 0) {
                            alert('Please enter a valid amount');
                            return;
                          }

                          // Use manually entered address if provided, otherwise use connected wallet address
                          const targetWalletAddress = depositWalletAddress || walletAddress;
                          if (!targetWalletAddress || targetWalletAddress.trim() === '') {
                            alert('Please enter a wallet address or connect your wallet');
                            return;
                          }

                          // Basic wallet address validation (Solana addresses are base58 encoded, 32-44 chars)
                          const trimmedAddress = targetWalletAddress.trim();
                          if (trimmedAddress.length < 32 || trimmedAddress.length > 44) {
                            alert('Please enter a valid wallet address (32-44 characters)');
                            return;
                          }

                          // Create deposit order via OnMeta API
                          setDepositLoading(true);
                          try {
                            const response = await fetch('/api/onmeta/deposit', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                fiatCurrency: selectedPaymentMethod,
                                fiatAmount: amount,
                                cryptoCurrency: 'USDC',
                                walletAddress: trimmedAddress,
                                userId: getAuthEmail() || undefined,
                                redirectUrl: `${window.location.origin}/dashboard?onmeta_callback=true`,
                              }),
                            });

                            const data = await response.json();
                            
                            if (data.success && data.depositUrl) {
                              // Redirect to OnMeta's deposit page
                              window.location.href = data.depositUrl;
                            } else {
                              alert(data.error || 'Failed to initiate deposit. Please try again.');
                              setDepositLoading(false);
                            }
                          } catch (error: any) {
                            console.error('Deposit error:', error);
                            alert(`Error: ${error.message || 'Failed to initiate deposit. Please try again.'}`);
                            setDepositLoading(false);
                          }
                        } else {
                          // Handle other payment methods (Stables, Bank Transfer)
                          console.log('Initiate payment for:', selectedPaymentMethod);
                          alert('This payment method will be implemented soon.');
                          setSelectedPaymentMethod(null);
                          setDepositAmount('');
                          setDepositWalletAddress('');
                          setShowSendPaymentModal(false);
                        }
                      }}
                      disabled={
                        (['INR', 'PHP', 'IDR'].includes(selectedPaymentMethod || '') && (!depositAmount || parseFloat(depositAmount) <= 0 || (!walletAddress && !depositWalletAddress)))
                      }
                      className="flex-1 px-4 py-2 bg-[#ff6b00] text-white rounded-xl font-semibold hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {depositLoading ? 'Processing...' : 'Continue'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Withdraw to Bank Account</h3>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Currency Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Currency
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {/* INR */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedWithdrawCurrency('INR')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedWithdrawCurrency === 'INR'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">🇮🇳</div>
                      <div className="text-sm font-semibold text-gray-900">INR</div>
                      <div className="text-xs text-gray-500">India</div>
                    </motion.button>

                    {/* PHP */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedWithdrawCurrency('PHP')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedWithdrawCurrency === 'PHP'
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">🇵🇭</div>
                      <div className="text-sm font-semibold text-gray-900">PHP</div>
                      <div className="text-xs text-gray-500">Philippines</div>
                    </motion.button>

                    {/* IDR */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedWithdrawCurrency('IDR')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedWithdrawCurrency === 'IDR'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">🇮🇩</div>
                      <div className="text-sm font-semibold text-gray-900">IDR</div>
                      <div className="text-xs text-gray-500">Indonesia</div>
                    </motion.button>
                  </div>
                </div>

                {/* Amount Input */}
                {selectedWithdrawCurrency && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount to Withdraw
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        {selectedWithdrawCurrency === 'INR' && '₹'}
                        {selectedWithdrawCurrency === 'PHP' && '₱'}
                        {selectedWithdrawCurrency === 'IDR' && 'Rp'}
                      </div>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                    {walletBalance !== null && (
                      <p className="mt-2 text-sm text-gray-500">
                        Available: {walletBalance.toFixed(4)} SOL (~${(walletBalance * solPrice).toFixed(2)})
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Bank Account Details */}
                {selectedWithdrawCurrency && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter account number"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code {selectedWithdrawCurrency === 'PHP' && '(or Routing Number)'} {selectedWithdrawCurrency === 'IDR' && '(or Bank Code)'}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          selectedWithdrawCurrency === 'INR' ? 'Enter IFSC code' :
                          selectedWithdrawCurrency === 'PHP' ? 'Enter routing number' :
                          'Enter bank code'
                        }
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter account holder name"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Info Box */}
                {selectedWithdrawCurrency && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Powered by OnMeta</p>
                        <p className="text-blue-700">Withdrawals are processed securely and typically take 1-3 business days to reflect in your bank account.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setSelectedWithdrawCurrency(null);
                      // Reset form fields
                      setWithdrawAmount('');
                      setBankAccountNumber('');
                      setBankCode('');
                      setAccountHolderName('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedWithdrawCurrency || !withdrawAmount || !bankAccountNumber || !bankCode || !accountHolderName) {
                        alert('Please fill in all required fields');
                        return;
                      }

                      const amount = parseFloat(withdrawAmount);
                      if (isNaN(amount) || amount <= 0) {
                        alert('Please enter a valid amount');
                        return;
                      }

                      setWithdrawLoading(true);
                      try {
                        const payload: any = {
                          fiatCurrency: selectedWithdrawCurrency,
                          fiatAmount: amount,
                          cryptoCurrency: 'USDC',
                          bankAccountNumber,
                          accountHolderName,
                          userId: getAuthEmail() || undefined,
                        };

                        // Add currency-specific bank code field
                        if (selectedWithdrawCurrency === 'INR') {
                          payload.ifscCode = bankCode;
                        } else if (selectedWithdrawCurrency === 'PHP') {
                          payload.routingNumber = bankCode;
                        } else if (selectedWithdrawCurrency === 'IDR') {
                          payload.bankCode = bankCode;
                        }

                        const response = await fetch('/api/onmeta/withdraw', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        });

                        const data = await response.json();

                        if (data.success) {
                          alert(`Withdrawal initiated successfully! Order ID: ${data.orderId || data.transactionId || 'N/A'}`);
                          // Reset form
                          setWithdrawAmount('');
                          setBankAccountNumber('');
                          setBankCode('');
                          setAccountHolderName('');
                          setSelectedWithdrawCurrency(null);
                          setShowWithdrawModal(false);
                        } else {
                          alert(data.error || 'Failed to initiate withdrawal. Please try again.');
                        }
                      } catch (error: any) {
                        console.error('Withdrawal error:', error);
                        alert('An error occurred. Please try again.');
                      } finally {
                        setWithdrawLoading(false);
                      }
                    }}
                    disabled={!selectedWithdrawCurrency || withdrawLoading || !withdrawAmount || !bankAccountNumber || !bankCode || !accountHolderName}
                    className="flex-1 px-4 py-3 bg-[#ff6b00] text-white rounded-xl font-semibold hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {withdrawLoading ? 'Processing...' : 'Withdraw'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Receive Payment Modal */}
        {showReceivePaymentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Receive Payment</h3>
                <button
                  onClick={() => setShowReceivePaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Create Payment Link */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 hover:border-green-400 transition-all text-left"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Payment Link</h3>
                  <p className="text-gray-600 text-sm">Generate a shareable payment link</p>
                </motion.button>

                {/* Show QR Code */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 hover:border-blue-400 transition-all text-left"
                >
                  <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Show QR Code</h3>
                  <p className="text-gray-600 text-sm">Display QR code to receive payments</p>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Wallet Connection Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Connect Wallet</h3>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {detectedWallets.length > 0 ? (
                  detectedWallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => wallet.installed ? handleConnectWallet(wallet.name) : window.open("https://phantom.app/", "_blank")}
                      disabled={!wallet.installed || connectingWallet === wallet.name}
                      className={`w-full rounded-xl p-4 flex items-center justify-between transition-colors ${
                        wallet.installed
                          ? "bg-gray-50 hover:bg-gray-100"
                          : "bg-gray-100 opacity-60 cursor-not-allowed"
                      } ${connectingWallet === wallet.name ? "opacity-50 cursor-wait" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          wallet.name === "Phantom" ? "bg-indigo-100" :
                          wallet.name === "Solflare" ? "bg-orange-100" :
                          wallet.name === "Backpack" ? "bg-purple-100" :
                          "bg-blue-100"
                        }`}>
                          <span className="text-2xl">{wallet.icon}</span>
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{wallet.name}</div>
                          <div className="text-sm text-gray-600">
                            {wallet.installed ? "Solana Wallet" : "Not installed - Click to download"}
                          </div>
                        </div>
                      </div>
                      {connectingWallet === wallet.name ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="mb-2">No wallets detected</p>
                    <p className="text-sm">Please install a Solana wallet extension like Phantom</p>
                    <a
                      href="https://phantom.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-2 inline-block"
                    >
                      Download Phantom
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
