import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { Navbar } from "@/components/Navbar";
import { isAuthenticated, getAuthEmail } from "@/utils/auth";
import { getDetectedWallets, connectWallet, disconnectWallet, getConnectedWalletAddress, DetectedWallet } from "@/app/wallet/walletDetection";
import { showToast, ToastContainer } from "@/components/Toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SkeletonCard, SkeletonBalance, SkeletonTable } from "@/components/SkeletonLoader";
import { CopyButton } from "@/components/CopyButton";

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
  const [depositErrors, setDepositErrors] = useState<{ amount?: string; address?: string }>({});
  
  // OnMeta authentication state
  const [onMetaAccessToken, setOnMetaAccessToken] = useState<string | null>(null);
  const [onMetaRefreshToken, setOnMetaRefreshToken] = useState<string | null>(null);
  const [onMetaBankStatus, setOnMetaBankStatus] = useState<string | null>(null);
  const [onMetaUPIStatus, setOnMetaUPIStatus] = useState<string | null>(null);
  const [onMetaKYCStatus, setOnMetaKYCStatus] = useState<string | null>(null);
  const [onMetaAuthLoading, setOnMetaAuthLoading] = useState(true); // Track authentication loading state
  const [kycStatusCheckLoading, setKycStatusCheckLoading] = useState(false); // Track KYC status check loading
  const [showLinkBankModal, setShowLinkBankModal] = useState(false);
  const [showLinkUPIModal, setShowLinkUPIModal] = useState(false);
  
  // Link Bank Account form state
  const [linkBankName, setLinkBankName] = useState<string>("");
  const [linkBankPAN, setLinkBankPAN] = useState<string>("");
  const [linkBankEmail, setLinkBankEmail] = useState<string>("");
  const [linkBankKYCVerified, setLinkBankKYCVerified] = useState<boolean>(false);
  const [linkBankAccountNumber, setLinkBankAccountNumber] = useState<string>("");
  const [linkBankIFSC, setLinkBankIFSC] = useState<string>("");
  const [linkBankAccountHolder, setLinkBankAccountHolder] = useState<string>("");
  const [linkBankPhoneCountryCode, setLinkBankPhoneCountryCode] = useState<string>("+91");
  const [linkBankPhoneNumber, setLinkBankPhoneNumber] = useState<string>("");
  const [linkBankLoading, setLinkBankLoading] = useState(false);
  
  // Link UPI form state
  const [linkUPIName, setLinkUPIName] = useState<string>("");
  const [linkUPIEmail, setLinkUPIEmail] = useState<string>("");
  const [linkUPIId, setLinkUPIId] = useState<string>("");
  const [linkUPIPhoneCountryCode, setLinkUPIPhoneCountryCode] = useState<string>("+91");
  const [linkUPIPhoneNumber, setLinkUPIPhoneNumber] = useState<string>("");
  const [linkUPILoading, setLinkUPILoading] = useState(false);
  
  // Supported tokens and limits state
  const [supportedTokens, setSupportedTokens] = useState<any[]>([]);
  const [chainLimits, setChainLimits] = useState<any[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [limitsLoading, setLimitsLoading] = useState(false);
  
  // Quotation state
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [quotation, setQuotation] = useState<any>(null);
  const [quotationForm, setQuotationForm] = useState({
    buyTokenSymbol: 'USDC',
    chainId: 80001, // Polygon testnet default
    fiatCurrency: 'inr',
    fiatAmount: '',
    buyTokenAddress: '',
  });
  
  // Store linked UPI ID and bank details for order creation
  const [linkedUPIId, setLinkedUPIId] = useState<string | null>(null);
  const [linkedBankDetails, setLinkedBankDetails] = useState<any>(null);
  
  // Order status state
  const [showOrderStatusModal, setShowOrderStatusModal] = useState(false);
  const [orderStatusLoading, setOrderStatusLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [orderStatusInput, setOrderStatusInput] = useState<string>('');
  
  // Update UTR state
  const [showUpdateUTRModal, setShowUpdateUTRModal] = useState(false);
  const [updateUTRLoading, setUpdateUTRLoading] = useState(false);
  const [updateUTRForm, setUpdateUTRForm] = useState({
    orderId: '',
    utr: '',
    paymentMode: '',
  });
  
  // Order history state
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [orderHistorySkip, setOrderHistorySkip] = useState(0);
  const [orderHistoryHasMore, setOrderHistoryHasMore] = useState(false);

  // Supported currencies state
  const [supportedCurrencies, setSupportedCurrencies] = useState<any[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);

  // KYC Submission state
  const [showKYCSubmitModal, setShowKYCSubmitModal] = useState(false);
  const [kycSubmitLoading, setKycSubmitLoading] = useState(false);
  const [kycSubmitForm, setKycSubmitForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    panNumber: '',
    aadharNumber: '',
    incomeRange: '<10L' as '<10L' | '10L-15L' | '15L-20L' | '20L-25L' | '25L-50L' | '>50L',
    profession: '',
    selfie: '',
    aadharFront: '',
    aadharBack: '',
    panFront: '',
    panBack: '',
  });

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
            showToast('KYC verification completed successfully!', 'success');
            // Store KYC verification status in localStorage
            localStorage.setItem('onmeta_kyc_verified', 'true');
            localStorage.setItem('onmeta_kyc_verified_timestamp', Date.now().toString());
            setOnMetaKYCStatus('VERIFIED');
            
            // Fetch updated KYC status from API to confirm
            const userEmail = getAuthEmail();
            if (userEmail && onMetaAccessToken) {
              fetch('/api/onmeta/kyc-status', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${onMetaAccessToken}`,
                },
                body: JSON.stringify({ email: userEmail }),
              })
              .then(res => res.json())
              .then(data => {
                if (data.success && (data.isVerified || data.kycStatus === 'VERIFIED' || data.kycStatus === 'verified')) {
                  // Confirm KYC is verified
                  localStorage.setItem('onmeta_kyc_verified', 'true');
                  setOnMetaKYCStatus('VERIFIED');
                }
              })
              .catch(err => console.error('Failed to fetch KYC status:', err));
            }
          } else if (error || status === 'failure') {
            showToast(`KYC verification failed: ${error || 'Please try again'}`, 'error');
            localStorage.removeItem('onmeta_kyc_verified');
            localStorage.removeItem('onmeta_kyc_verified_timestamp');
          }
        } else if (type === 'withdrawal' || urlParams.get('withdrawal') === 'true') {
          if (status === 'success' || status === 'completed') {
            showToast('Withdrawal completed successfully!', 'success');
          } else if (error || status === 'failed') {
            showToast(`Withdrawal failed: ${error || 'Please try again.'}`, 'error');
          }
        } else {
          // Default to deposit/onramp
          if (status === 'success' || status === 'completed' || urlParams.get('success') === 'true') {
            showToast('Deposit completed successfully!', 'success');
            // Refresh wallet balance or update UI
          } else if (error || status === 'failed' || urlParams.get('failed') === 'true') {
            showToast(`Deposit failed: ${error || 'Please try again.'}`, 'error');
          } else if (urlParams.get('cancelled') === 'true') {
            showToast('Deposit was cancelled.', 'warning');
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

  // OnMeta Login - Auto-login user with their email
  useEffect(() => {
    const onMetaLogin = async () => {
      const userEmail = getAuthEmail();
      if (!userEmail) {
        setOnMetaAuthLoading(false);
        return;
      }
      
      setOnMetaAuthLoading(true);
      
      // Check if we have a stored refresh token first
      const storedRefreshToken = localStorage.getItem('onmeta_refresh_token');
      if (storedRefreshToken && !onMetaAccessToken) {
        // Try to refresh the token
        try {
          const refreshResponse = await fetch('/api/onmeta/auth/refresh', {
            headers: {
              'Authorization': `Bearer ${storedRefreshToken}`,
            },
          });
          
          if (!refreshResponse.ok) {
            // 401 is expected when refresh token is expired - handle gracefully
            if (refreshResponse.status === 401) {
              console.log('OnMeta refresh token expired or invalid, will login instead');
              // Clear invalid refresh token
              localStorage.removeItem('onmeta_refresh_token');
              // Continue to login flow below (don't throw error)
            } else {
              // For other errors, extract readable error message
              let errorText = '';
              try {
                const errorData = await refreshResponse.json();
                // Extract error message from various possible formats
                if (typeof errorData.error === 'string') {
                  errorText = errorData.error;
                } else if (errorData.error?.message) {
                  errorText = errorData.error.message;
                } else if (typeof errorData.message === 'string') {
                  errorText = errorData.message;
                } else {
                  errorText = `HTTP ${refreshResponse.status}`;
                }
              } catch (e) {
                try {
                  const text = await refreshResponse.text();
                  errorText = text.substring(0, 100) || `HTTP ${refreshResponse.status}`;
                } catch (textError) {
                  errorText = `HTTP ${refreshResponse.status}`;
                }
              }
              console.error('OnMeta token refresh failed:', refreshResponse.status, errorText);
              // For non-401 errors, still clear token and continue to login
              localStorage.removeItem('onmeta_refresh_token');
              // Throw error for non-401 errors
              throw new Error(`Failed to refresh token: ${errorText}`);
            }
          } else {
            // Success - parse response
            const refreshData = await refreshResponse.json();
            
            if (refreshData.success && refreshData.accessToken) {
              setOnMetaAccessToken(refreshData.accessToken);
              if (refreshData.refreshToken) {
                setOnMetaRefreshToken(refreshData.refreshToken);
                localStorage.setItem('onmeta_refresh_token', refreshData.refreshToken);
              }
              console.log('OnMeta token refreshed successfully');
              fetchOnMetaAccountStatus(refreshData.accessToken);
              setOnMetaAuthLoading(false);
              return;
            } else {
              // Extract readable error message
              let errorMsg = 'No access token received';
              if (refreshData.error) {
                if (typeof refreshData.error === 'string') {
                  errorMsg = refreshData.error;
                } else if (refreshData.error?.message) {
                  errorMsg = refreshData.error.message;
                }
              } else if (refreshData.message) {
                errorMsg = refreshData.message;
              }
              console.error('OnMeta token refresh failed: No access token in response', refreshData);
              throw new Error(errorMsg);
            }
          }
        } catch (error: any) {
          // Extract readable error message
          let errorMessage = 'Token refresh failed';
          if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else if (error?.error) {
            errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
          } else if (error) {
            errorMessage = JSON.stringify(error);
          }
          console.log('OnMeta token refresh failed, will try login:', errorMessage);
          // Clear invalid refresh token
          localStorage.removeItem('onmeta_refresh_token');
          // Continue to try login
        }
      }

      // If no valid token, login with email
      if (!onMetaAccessToken) {
        try {
          const response = await fetch('/api/onmeta/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail }),
          });

          if (!response.ok) {
            // Try to parse error from response
            let errorText = '';
            try {
              const errorData = await response.json();
              errorText = errorData.error || errorData.message || errorData.errorMessage || `HTTP ${response.status}`;
              console.error('OnMeta login failed:', response.status, errorData);
            } catch (e) {
              const text = await response.text();
              errorText = text.substring(0, 200) || `HTTP ${response.status}`;
              console.error('OnMeta login failed (non-JSON):', response.status, text.substring(0, 100));
            }
            throw new Error(errorText || `Failed to login: ${response.status}`);
          }

          const data = await response.json();
          console.log('OnMeta login API response:', data);
          
          // Check for access token in OnMeta response structure:
          // { success: true, data: { accessToken: "...", refreshToken: "..." }, error: {} }
          // Priority: data.data.accessToken (OnMeta format) > data.accessToken (fallback)
          const accessToken = data.data?.accessToken || 
                            data.data?.access_token || 
                            data.accessToken || 
                            data.access_token || 
                            data.token ||
                            data.result?.accessToken ||
                            data.result?.access_token ||
                            data.result?.token;
          
          const refreshToken = data.data?.refreshToken || 
                              data.data?.refresh_token ||
                              data.refreshToken || 
                              data.refresh_token ||
                              data.result?.refreshToken ||
                              data.result?.refresh_token;
          
          // Log all possible token fields for debugging
          if (!accessToken) {
            console.error('Access token not found. Response structure:', {
              keys: Object.keys(data),
              dataKeys: data.data ? Object.keys(data.data) : null,
              resultKeys: data.result ? Object.keys(data.result) : null,
              fullData: data,
            });
          } else {
            console.log('Access token found successfully:', {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
            });
          }
          
          if (accessToken) {
            setOnMetaAccessToken(accessToken);
            if (refreshToken) {
              setOnMetaRefreshToken(refreshToken);
              // Store refresh token in localStorage for persistence
              localStorage.setItem('onmeta_refresh_token', refreshToken);
            }
            console.log('OnMeta login successful');
            
            // Check and store KYC verification status after successful login
            const storedKYCVerified = localStorage.getItem('onmeta_kyc_verified');
            if (storedKYCVerified === 'true') {
              setOnMetaKYCStatus('VERIFIED');
            } else {
              // Optionally verify KYC status with OnMeta API
              const userEmail = getAuthEmail();
              if (userEmail) {
                fetch('/api/onmeta/kyc-status', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify({ email: userEmail }),
                })
                .then(res => res.json())
                .then(data => {
                  if (data.success && (data.isVerified || data.kycStatus === 'VERIFIED' || data.kycStatus === 'verified')) {
                    localStorage.setItem('onmeta_kyc_verified', 'true');
                    localStorage.setItem('onmeta_kyc_verified_timestamp', Date.now().toString());
                    setOnMetaKYCStatus('VERIFIED');
                  }
                })
                .catch(err => console.error('Failed to check KYC status:', err));
              }
            }
            
            // Fetch bank and UPI status
            fetchOnMetaAccountStatus(accessToken);
          } else {
            // Extract error message from multiple possible fields
            const errorMsg = data.error || 
                           data.message || 
                           data.errorMessage || 
                           data.msg ||
                           (data.errors && Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
                           (data.success === false ? 'Login failed: No access token received' : 'Login failed: Access token not found in response');
            console.error('OnMeta login failed:', {
              error: errorMsg,
              fullResponse: data,
              status: response.status,
              hasAccessToken: !!accessToken,
              responseKeys: Object.keys(data),
            });
            showToast(`OnMeta authentication failed: ${errorMsg}`, 'error');
          }
        } catch (error: any) {
          // Better error extraction from fetch errors
          let errorMsg = 'Network error occurred';
          
          // Try to extract error from response if available
          if (error?.response) {
            try {
              const errorData = await error.response.json();
              errorMsg = errorData.error || errorData.message || errorMsg;
            } catch (e) {
              // If response is not JSON, try to get text
              try {
                const text = await error.response.text();
                errorMsg = text.substring(0, 200) || errorMsg;
              } catch (e2) {
                // Ignore
              }
            }
          } else if (error?.message) {
            errorMsg = error.message;
          } else if (error?.error) {
            errorMsg = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
          } else if (typeof error === 'string') {
            errorMsg = error;
          }
          
          console.error('OnMeta login error:', errorMsg, error);
          showToast(`OnMeta authentication failed: ${errorMsg}`, 'error');
    } finally {
          setOnMetaAuthLoading(false);
        }
      } else {
        setOnMetaAuthLoading(false);
      }
    };

    if (authChecked) {
      onMetaLogin();
    } else {
      setOnMetaAuthLoading(false);
    }
    
    // Load KYC verification status from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedKYCVerified = localStorage.getItem('onmeta_kyc_verified');
      if (storedKYCVerified === 'true') {
        setOnMetaKYCStatus('VERIFIED');
      }
    }
  }, [authChecked]);

  // Helper function to ensure we have a valid access token
  // Tries to refresh token if needed, or login if refresh fails
  const ensureValidAccessToken = async (): Promise<string | null> => {
    // If we have a valid access token, return it
    if (onMetaAccessToken) {
      return onMetaAccessToken;
    }

    // Try to refresh token
    const storedRefreshToken = localStorage.getItem('onmeta_refresh_token');
    if (storedRefreshToken) {
      try {
        console.log('🔄 Access token missing, attempting to refresh...');
        const refreshResponse = await fetch('/api/onmeta/auth/refresh', {
          headers: {
            'Authorization': `Bearer ${storedRefreshToken}`,
          },
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.accessToken) {
            setOnMetaAccessToken(refreshData.accessToken);
            if (refreshData.refreshToken) {
              setOnMetaRefreshToken(refreshData.refreshToken);
              localStorage.setItem('onmeta_refresh_token', refreshData.refreshToken);
            }
            console.log('✅ Token refreshed successfully');
            return refreshData.accessToken;
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    // If refresh failed, try to login
    const userEmail = getAuthEmail();
    if (userEmail) {
      try {
        console.log('🔄 Attempting to login to get new access token...');
        const loginResponse = await fetch('/api/onmeta/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          const accessToken = loginData.data?.accessToken || 
                            loginData.data?.access_token || 
                            loginData.accessToken || 
                            loginData.access_token || 
                            loginData.token;
          
          const refreshToken = loginData.data?.refreshToken || 
                              loginData.data?.refresh_token ||
                              loginData.refreshToken || 
                              loginData.refresh_token;

          if (accessToken) {
            setOnMetaAccessToken(accessToken);
            if (refreshToken) {
              setOnMetaRefreshToken(refreshToken);
              localStorage.setItem('onmeta_refresh_token', refreshToken);
            }
            console.log('✅ Login successful, new access token obtained');
            return accessToken;
          }
        }
      } catch (error) {
        console.error('Login failed:', error);
      }
    }

    return null;
  };

  // Fetch OnMeta account status (bank and UPI)
  const fetchOnMetaAccountStatus = async (accessToken: string, upiRefNumber?: string, bankRefNumber?: string) => {
    if (!accessToken) {
      console.log('Skipping account status fetch - no access token');
      return;
    }
    
    try {
      // Fetch bank status - use provided refNumber or get from localStorage
      const storedBankRefNumber = bankRefNumber || localStorage.getItem('onmeta_bank_ref_number');
      const bankStatusUrl = storedBankRefNumber 
        ? `/api/onmeta/account/bank-status?refNumber=${encodeURIComponent(storedBankRefNumber)}`
        : '/api/onmeta/account/bank-status';
      
      const bankResponse = await fetch(bankStatusUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (bankResponse.ok) {
        const bankData = await bankResponse.json();
        if (bankData.success) {
          setOnMetaBankStatus(bankData.status);
        }
      } else {
        // Don't show error for bank status - it's optional
        const bankData = await bankResponse.json().catch(() => ({}));
        console.log('Bank status not available:', bankData.error || bankResponse.status);
      }

      // Fetch UPI status - use provided refNumber or get from localStorage
      const storedUPIRefNumber = upiRefNumber || localStorage.getItem('onmeta_upi_ref_number');
      const upiStatusUrl = storedUPIRefNumber
        ? `/api/onmeta/account/upi-status?refNumber=${encodeURIComponent(storedUPIRefNumber)}`
        : '/api/onmeta/account/upi-status';
      
      const upiResponse = await fetch(upiStatusUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (upiResponse.ok) {
        const upiData = await upiResponse.json();
        if (upiData.success) {
          setOnMetaUPIStatus(upiData.status);
          // Update stored reference number if we get a new one
          if (upiData.refNumber && !storedUPIRefNumber) {
            localStorage.setItem('onmeta_upi_ref_number', upiData.refNumber);
          }
        }
      } else {
        // Don't show error for UPI status - it's optional
        const upiData = await upiResponse.json().catch(() => ({}));
        console.log('UPI status not available:', upiData.error || upiResponse.status);
      }
    } catch (error) {
      // Don't break the app if account status fetch fails
      console.error('Error fetching OnMeta account status (non-critical):', error);
    }
  };

  // Fetch supported tokens
  const fetchSupportedTokens = async () => {
    setTokensLoading(true);
    try {
      const response = await fetch('/api/onmeta/tokens');
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to fetch supported tokens:', response.status, text.substring(0, 100));
        throw new Error(`Failed to fetch tokens: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle response format: {success: true, data: [...]} or {success: true, tokens: [...]}
      const tokens = data.data || data.tokens || [];
      
      if (data.success && tokens.length > 0) {
        setSupportedTokens(tokens);
        console.log('Supported tokens loaded:', tokens.length);
      } else {
        console.error('Failed to fetch supported tokens:', data.error || 'No tokens data');
      }
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
    } finally {
      setTokensLoading(false);
          }
  };

  // Fetch chain-wise limits
  const fetchChainLimits = async () => {
    setLimitsLoading(true);
    try {
      const response = await fetch('/api/onmeta/chain-limits');
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to fetch chain limits:', response.status, text.substring(0, 100));
        throw new Error(`Failed to fetch chain limits: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle response format: {success: true, data: [...]} or {success: true, limits: [...]}
      const limits = data.data || data.limits || [];
      
      if (data.success && limits.length > 0) {
        setChainLimits(limits);
        console.log('Chain limits loaded:', limits.length);
      } else {
        console.error('Failed to fetch chain limits:', data.error || 'No limits data');
      }
    } catch (error) {
      console.error('Error fetching chain limits:', error);
    } finally {
      setLimitsLoading(false);
    }
  };

  // Fetch supported currencies
  const fetchSupportedCurrenciesData = async () => {
    setCurrenciesLoading(true);
    try {
      const response = await fetch('/api/onmeta/currencies');
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to fetch supported currencies:', response.status, text.substring(0, 100));
        throw new Error(`Failed to fetch currencies: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle response format: {success: true, data: [...]} or {success: true, currencies: [...]}
      const currencies = data.data || data.currencies || data.supportedCurrencies || [];
      
      if (data.success) {
        // Handle empty currencies array (when endpoint returns 404, we return success with empty array)
        setSupportedCurrencies(currencies);
        if (currencies.length === 0) {
          console.log('No currencies available (endpoint may not exist)');
        } else {
          console.log('Supported currencies loaded:', currencies.length);
        }
      } else {
        const errorMsg = data.error || data.message || 'Currencies endpoint not available';
        console.log('Currencies not available:', errorMsg);
        setSupportedCurrencies([]);
        // Don't show error toast for currencies - it's not critical, just log it
      }
    } catch (error: any) {
      console.log('Error fetching supported currencies (non-critical):', error?.message || 'Network error');
      setSupportedCurrencies([]);
    } finally {
      setCurrenciesLoading(false);
    }
  };

  // Fetch tokens and limits on mount
  useEffect(() => {
    fetchSupportedTokens();
    fetchChainLimits();
    fetchSupportedCurrenciesData();
  }, []);

  // Fetch order history
  const fetchOrderHistory = async (skip: number = 0, append: boolean = false) => {
    if (!onMetaAccessToken) {
      console.log('OnMeta access token not available yet');
      return;
    }

    setOrderHistoryLoading(true);
    
    try {
      const response = await fetch(`/api/onmeta/orders/history?skip=${skip}`, {
        headers: {
          'Authorization': `Bearer ${onMetaAccessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Order history fetch failed (non-critical):', {
          status: response.status,
          error: errorData.error || errorData.message,
        });
        if (!append) {
          setOrderHistory([]);
        }
        return;
      }

      const data = await response.json();
      
      // Handle response format: {success: true, data: [...]} or {success: true, orders: [...]}
      const orders = data.data || data.orders || [];
      
      if (data.success) {
        if (orders.length > 0) {
          if (append) {
            setOrderHistory(prev => [...prev, ...orders]);
          } else {
            setOrderHistory(orders);
          }
          setOrderHistoryHasMore(data.hasMore || orders.length === 10);
          setOrderHistorySkip(skip);
          console.log('Order history fetched successfully:', orders.length, 'orders');
        } else {
          // Empty orders is valid - user just hasn't made any orders yet
          if (!append) {
            setOrderHistory([]);
          }
        }
      } else {
        console.log('Order history fetch returned success:false (non-critical):', data.error || data.message);
        if (!append) {
          setOrderHistory([]);
        }
      }
    } catch (error) {
      // Don't break the app if order history fails
      console.log('Error fetching order history (non-critical):', error);
      if (!append) {
        setOrderHistory([]);
    }
    } finally {
      setOrderHistoryLoading(false);
    }
  };

  // Fetch order history when access token is available
  useEffect(() => {
    if (onMetaAccessToken) {
      fetchOrderHistory(0, false);
    }
  }, [onMetaAccessToken]);

  // Auto-refresh order history every 30 seconds if there are pending orders
  useEffect(() => {
    if (!onMetaAccessToken || orderHistory.length === 0) return;

    const hasPendingOrders = orderHistory.some((order: any) => {
      const status = order.status || order.orderStatus || '';
      return status === 'pending' || status === 'PENDING' || status === 'fiatPending' || 
             status === 'orderReceived' || status === 'fiatReceived' || status === 'InProgress';
    });

    if (hasPendingOrders) {
      const interval = setInterval(() => {
        if (!orderHistoryLoading) {
          fetchOrderHistory(0, false);
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [onMetaAccessToken, orderHistory, orderHistoryLoading]);

  // Update UTR
  const handleUpdateUTR = async () => {
    if (!updateUTRForm.orderId || updateUTRForm.orderId.trim() === '') {
      showToast('Please enter an order ID', 'error');
      return;
    }

    if (!updateUTRForm.utr || updateUTRForm.utr.trim() === '') {
      showToast('Please enter a UTR', 'error');
      return;
    }

    if (!onMetaAccessToken) {
      showToast('OnMeta authentication required. Please wait for authentication to complete or refresh the page.', 'warning');
        return;
    }

    setUpdateUTRLoading(true);
    
      try {
      const response = await fetch('/api/onmeta/orders/update-utr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${onMetaAccessToken}`,
        },
        body: JSON.stringify({
          orderId: updateUTRForm.orderId.trim(),
          utr: updateUTRForm.utr.trim(),
          paymentMode: updateUTRForm.paymentMode || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        showToast(data.message || 'UTR updated successfully!', 'success');
        setShowUpdateUTRModal(false);
        setUpdateUTRForm({
          orderId: '',
          utr: '',
          paymentMode: '',
        });
      } else {
        showToast(data.error || 'Failed to update UTR. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Error updating UTR:', error);
      showToast(`Error: ${error.message || 'Failed to update UTR. Please try again.'}`, 'error');
    } finally {
      setUpdateUTRLoading(false);
    }
  };

  // Fetch order status
  const fetchOrderStatus = async () => {
    if (!orderStatusInput || orderStatusInput.trim() === '') {
      showToast('Please enter an order ID', 'error');
      return;
    }

    if (!onMetaAccessToken) {
      showToast('OnMeta authentication required. Please wait for authentication to complete or refresh the page.', 'warning');
      return;
    }

    setOrderStatusLoading(true);
    setOrderStatus(null);
    
    try {
      const response = await fetch('/api/onmeta/orders/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${onMetaAccessToken}`,
        },
        body: JSON.stringify({
          orderId: orderStatusInput.trim(),
        }),
      });

      const data = await response.json();
      
      if (data.success && data.status) {
        setOrderStatus(data);
        console.log('Order status fetched successfully:', data);
        showToast('Order status fetched successfully', 'success');
      } else {
        showToast(data.error || 'Failed to fetch order status. Please check the order ID and try again.', 'error');
        setOrderStatus(null);
      }
    } catch (error: any) {
      console.error('Error fetching order status:', error);
      showToast(`Error: ${error.message || 'Failed to fetch order status. Please try again.'}`, 'error');
      setOrderStatus(null);
    } finally {
      setOrderStatusLoading(false);
    }
  };

  // Fetch quotation
  const fetchQuotation = async () => {
    if (!quotationForm.buyTokenSymbol || !quotationForm.chainId || !quotationForm.fiatCurrency || !quotationForm.fiatAmount || !quotationForm.buyTokenAddress) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const fiatAmount = parseFloat(quotationForm.fiatAmount);
    if (isNaN(fiatAmount) || fiatAmount <= 0) {
      showToast('Please enter a valid fiat amount', 'error');
      return;
    }

    setQuotationLoading(true);
    setQuotation(null);
    
    try {
      const response = await fetch('/api/onmeta/quotation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyTokenSymbol: quotationForm.buyTokenSymbol,
          chainId: quotationForm.chainId,
          fiatCurrency: quotationForm.fiatCurrency,
          fiatAmount: fiatAmount,
          buyTokenAddress: quotationForm.buyTokenAddress,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.quotation) {
        setQuotation(data.quotation);
        console.log('Quotation fetched successfully:', data.quotation);
        showToast('Quotation fetched successfully', 'success');
      } else {
        showToast(data.error || 'Failed to fetch quotation. Please try again.', 'error');
        setQuotation(null);
      }
    } catch (error: any) {
      console.error('Error fetching quotation:', error);
      showToast(`Error: ${error.message || 'Failed to fetch quotation. Please try again.'}`, 'error');
      setQuotation(null);
    } finally {
      setQuotationLoading(false);
    }
  };

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
        showToast(result.error || "Failed to connect wallet", "error");
          }
        } catch (error: any) {
      console.error("Error connecting wallet:", error);
      showToast(error.message || "Failed to connect wallet. Please make sure the wallet extension is installed.", "error");
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

  // Fetch SOL price in USD via backend API (avoids CORS and rate limiting)
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch("/api/crypto/price?ids=solana&vs_currencies=usd");
        if (!response.ok) {
          throw new Error(`Failed to fetch SOL price: ${response.status}`);
        }
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
    // Refresh price every 60 seconds (backend has caching to reduce rate limit issues)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <Navbar />
      <ToastContainer />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Profile Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
            >
          {profileLoading ? (
            <div className="flex items-center gap-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
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
                        <LoadingSpinner size="sm" />
                        <div className="h-12 bg-white/20 rounded-lg w-48 animate-pulse"></div>
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

        {/* Services Section - KYC, Bank Account & UPI */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
            <div className="space-y-2">
              <button 
                onClick={() => {
                  // Open OnMeta KYC Widget
                  const apiKey = process.env.NEXT_PUBLIC_ONMETA_CLIENT_ID || '2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4';
                  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
                  const successUrl = encodeURIComponent(`${baseUrl}/dashboard?onmeta_callback=true&type=kyc&status=success`);
                  const failureUrl = encodeURIComponent(`${baseUrl}/dashboard?onmeta_callback=true&type=kyc&status=failure`);
                  
                  // Production KYC widget URL
                  const kycWidgetUrl = `https://platform.onmeta.in/kyc/?apiKey=${apiKey}&successRedirectUrl=${successUrl}&failureRedirectUrl=${failureUrl}`;
                  
                  // Open in new window or redirect
                  window.open(kycWidgetUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                }}
                className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Start KYC Verification
              </button>
              <button 
                onClick={async () => {
                  // Force console to show logs - clear any filters
                  console.clear();
                  console.log('%c=== KYC STATUS CHECK STARTED ===', 'color: blue; font-size: 16px; font-weight: bold;');
                  console.log('Button clicked - function executing');
                  
                  // Check browser console filter settings
                  console.warn('If you don\'t see logs, check console filter settings (make sure "All levels" or "Verbose" is selected)');
                  
                  const userEmail = getAuthEmail();
                  if (!userEmail) {
                    console.error('❌ No user email found');
                    showToast('User email not found', 'error');
                    return;
                  }

                  console.log('✅ User Email:', userEmail);
                  
                  setKycStatusCheckLoading(true);
                  try {
                    // Ensure we have a valid access token
                    let accessToken = await ensureValidAccessToken();
                    if (!accessToken) {
                      console.error('❌ Failed to obtain access token');
                      showToast('Failed to authenticate. Please try logging in again.', 'error');
                      setKycStatusCheckLoading(false);
                      return;
                    }

                    console.log('✅ Has Access Token:', !!accessToken);
                    console.log('📡 Making API request to /api/onmeta/kyc-status...');
                    
                    const response = await fetch('/api/onmeta/kyc-status', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                      },
                      body: JSON.stringify({ email: userEmail }),
                    });

                    console.log('📥 Response Status:', response.status, response.statusText);
                    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
                    
                    // Get response as text first to see raw response
                    const responseText = await response.text();
                    console.log('📥 Raw Response Text:', responseText);
                    console.log('📥 Response Length:', responseText.length);
                    
                    // Parse as JSON
                    let data;
                    try {
                      data = JSON.parse(responseText);
                    } catch (parseError) {
                      console.error('❌ Failed to parse response as JSON:', parseError);
                      console.error('Raw response:', responseText);
                      alert(`Failed to parse API response:\n\n${responseText}\n\nCheck console for details.`);
                      return;
                    }
                    console.log('%c=== FULL KYC STATUS API RESPONSE ===', 'color: green; font-size: 14px; font-weight: bold;');
                    console.log('📋 Raw Response Data (JSON):', JSON.stringify(data, null, 2));
                    console.log('🔑 Response Keys:', Object.keys(data));
                    console.table({
                      'success': data.success,
                      'isVerified': data.isVerified,
                      'kycStatus': data.kycStatus,
                      'status': data.status,
                      'error': data.error,
                      'message': data.message,
                      'hasData': !!data.data,
                      'data.kycStatus': data.data?.kycStatus,
                      'data.status': data.data?.status,
                      'data.isVerified': data.data?.isVerified,
                    });

                    // Check if KYC is verified - handle various response formats
                    // Check all possible locations for verification status
                    const kycStatus = data.kycStatus || data.status || data.kyc_status || data.data?.kycStatus || data.data?.status;
                    const isVerifiedFlag = data.isVerified === true || 
                                         data.is_verified === true || 
                                         data.data?.isVerified === true ||
                                         data.data?.is_verified === true;
                    const isVerifiedStatus = kycStatus === 'VERIFIED' || 
                                            kycStatus === 'verified' ||
                                            kycStatus === 'VERIFIED_SUCCESS' ||
                                            kycStatus === 'SUCCESS';
                    
                    // Check verification even if success is false - OnMeta might return status even if success: false
                    const isVerified = isVerifiedFlag || isVerifiedStatus;
                    
                    console.log('%c=== VERIFICATION CHECK ===', 'color: orange; font-size: 14px; font-weight: bold;');
                    console.log('🔍 kycStatus value:', kycStatus);
                    console.log('🔍 isVerifiedFlag:', isVerifiedFlag);
                    console.log('🔍 isVerifiedStatus:', isVerifiedStatus);
                    console.log('🔍 Final isVerified:', isVerified);

                    if (isVerified) {
                      // Store KYC verification status
                      localStorage.setItem('onmeta_kyc_verified', 'true');
                      localStorage.setItem('onmeta_kyc_verified_timestamp', Date.now().toString());
                      setOnMetaKYCStatus('VERIFIED');
                      console.log('%c✅ KYC IS VERIFIED - Stored in localStorage', 'color: green; font-size: 16px; font-weight: bold;');
                      showToast('KYC Status: VERIFIED ✓', 'success');
                    } else {
                      // Clear stored KYC status if not verified
                      localStorage.removeItem('onmeta_kyc_verified');
                      localStorage.removeItem('onmeta_kyc_verified_timestamp');
                      setOnMetaKYCStatus(null);
                      
                      // Show status message with detailed info
                      const status = kycStatus || data.status || (data.isVerified === false ? 'Not Verified' : 'Unknown');
                      const errorMsg = data.error || data.message || '';
                      
                      console.log('%c❌ KYC IS NOT VERIFIED', 'color: red; font-size: 16px; font-weight: bold;');
                      console.log('📊 Status:', status);
                      console.log('📊 isVerified:', data.isVerified);
                      console.log('📊 Error/Message:', errorMsg);
                      console.log('📊 Full data object:', data);
                      
                      // Determine the reason and show helpful message
                      let statusMessage = '';
                      if (data.isVerified === false) {
                        if (kycStatus) {
                          statusMessage = `KYC Status: ${kycStatus}. Please complete KYC verification to proceed.`;
                        } else if (errorMsg) {
                          statusMessage = `KYC not verified: ${errorMsg}. Please complete KYC verification.`;
                        } else {
                          statusMessage = 'KYC is not verified. Please complete KYC verification to link UPI or bank accounts.';
                        }
                      } else {
                        statusMessage = `KYC Status: ${status || 'Unknown'}`;
                        if (errorMsg) {
                          statusMessage += ` - ${errorMsg}`;
                        }
                      }
                      
                      showToast(statusMessage, 'warning');
                      console.log('📢 Toast message shown:', statusMessage);
                    }
                    console.log('%c=== KYC STATUS CHECK COMPLETED ===', 'color: blue; font-size: 16px; font-weight: bold;');
                  } catch (error: any) {
                    console.error('%c=== KYC STATUS CHECK ERROR ===', 'color: red; font-size: 16px; font-weight: bold;');
                    console.error('❌ Error Object:', error);
                    console.error('❌ Error Message:', error?.message);
                    console.error('❌ Error Stack:', error?.stack);
                    alert(`KYC Status Check Failed:\n\n${error?.message || 'Unknown error'}\n\nCheck console for details.`);
                    showToast('Failed to check KYC status. Please try again.', 'error');
                  } finally {
                    setKycStatusCheckLoading(false);
                  }
                }}
                disabled={kycStatusCheckLoading || !onMetaAccessToken || onMetaAuthLoading}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {kycStatusCheckLoading ? 'Checking...' : 'Check KYC Status'}
              </button>
              {onMetaKYCStatus === 'VERIFIED' && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    KYC Verified
                  </p>
                </div>
              )}
            </div>
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
                <h3 className="text-lg font-bold text-gray-900">Link Bank Account</h3>
                <p className="text-sm text-gray-600">Connect bank for fiat transactions</p>
                {onMetaBankStatus && (
                  <p className="text-xs mt-1 font-medium">
                    Status: <span className={onMetaBankStatus === 'SUCCESS' ? 'text-green-600' : onMetaBankStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-600'}>
                      {onMetaBankStatus}
                    </span>
                  </p>
                )}
              </div>
            </div>
              <button
              onClick={() => {
                if (!onMetaAccessToken) {
                  if (onMetaAuthLoading) {
                    showToast('Please wait for OnMeta authentication to complete', 'warning');
                  } else {
                    showToast('OnMeta authentication failed. Please refresh the page to try again.', 'error');
                  }
                  return;
                }
                // Pre-fill form with user data
                setLinkBankName(userProfile?.name || '');
                setLinkBankEmail(getAuthEmail() || '');
                setLinkBankKYCVerified(false); // User can update this
                setShowLinkBankModal(true);
              }}
              disabled={onMetaAuthLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
              {onMetaAuthLoading ? 'Authenticating...' : onMetaBankStatus === 'SUCCESS' ? '✓ Bank Linked' : onMetaBankStatus === 'PENDING' ? 'Bank Linking...' : 'Link Bank Account'}
              </button>
                    </motion.div>
          
          {/* Link UPI ID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Link UPI ID</h3>
                <p className="text-sm text-gray-600">Connect UPI for instant payments</p>
                {onMetaUPIStatus && (
                  <p className="text-xs mt-1 font-medium">
                    Status: <span className={onMetaUPIStatus === 'SUCCESS' ? 'text-green-600' : onMetaUPIStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-600'}>
                      {onMetaUPIStatus}
                    </span>
                  </p>
                )}
              </div>
            </div>
              <button
              onClick={() => {
                if (!onMetaAccessToken) {
                  if (onMetaAuthLoading) {
                    showToast('Please wait for OnMeta authentication to complete', 'warning');
                  } else {
                    showToast('OnMeta authentication failed. Please refresh the page to try again.', 'error');
                  }
                  return;
                }
                // Pre-fill form with user data
                setLinkUPIName(userProfile?.name || '');
                setLinkUPIEmail(getAuthEmail() || '');
                setShowLinkUPIModal(true);
              }}
              disabled={onMetaAuthLoading}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {onMetaAuthLoading ? 'Authenticating...' : onMetaUPIStatus === 'SUCCESS' ? '✓ UPI Linked' : onMetaUPIStatus === 'PENDING' ? 'UPI Linking...' : 'Link UPI ID'}
              </button>
          </motion.div>
            </div>

        {/* Supported Tokens & Limits Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Supported Tokens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Supported Tokens</h3>
                <p className="text-sm text-gray-600">Available cryptocurrencies</p>
              </div>
            </div>
            {tokensLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : supportedTokens.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {supportedTokens.slice(0, 10).map((token, index) => (
                  <div key={token.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {token.logoUrl && (
                        <img src={token.logoUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
                      )}
            <div>
                        <p className="font-semibold text-gray-900">{token.symbol || token.name || 'Unknown'}</p>
                        {token.chain && (
                          <p className="text-xs text-gray-500">{token.chain}</p>
                        )}
            </div>
                    </div>
                    {token.address && (
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-gray-400 font-mono truncate max-w-[100px]">
                          {token.address.slice(0, 6)}...{token.address.slice(-4)}
                        </p>
                        <CopyButton text={token.address} size="sm" />
                      </div>
                    )}
                  </div>
                ))}
                {supportedTokens.length > 10 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{supportedTokens.length - 10} more tokens
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No tokens available</p>
                    <button
                  onClick={fetchSupportedTokens}
                  className="mt-2 text-sm text-[#ff6b00] hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
          </motion.div>

          {/* Chain-wise Limits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Chain Limits</h3>
                <p className="text-sm text-gray-600">Min/Max fiat limits per chain</p>
              </div>
            </div>
            {limitsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : chainLimits.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {chainLimits.map((limit, index) => {
                  // Handle API response structure: {chain, chainId, minLimit: {INR: 500, PHP: 500}, maxLimit: {INR: 500000, PHP: 50000}}
                  const currencies = limit.minLimit ? Object.keys(limit.minLimit) : [];
                  
                  return (
                    <div key={limit.chainId || index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-gray-900 text-base">
                          {limit.chain || `Chain ${limit.chainId}`}
                        </p>
                        <span className="text-xs text-gray-500 font-mono">ID: {limit.chainId}</span>
                      </div>
                      {currencies.length > 0 ? (
                        <div className="space-y-2">
                          {currencies.map((currency) => {
                            const min = limit.minLimit?.[currency] || 0;
                            const max = limit.maxLimit?.[currency] || 0;
                            const symbol = currency === 'INR' ? '₹' : currency === 'PHP' ? '₱' : currency === 'IDR' ? 'Rp' : '$';
                            
                            return (
                              <div key={currency} className="p-2 bg-white rounded border border-gray-100">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-600">{currency}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-gray-500 text-xs">Min</p>
                                    <p className="font-semibold text-gray-900">
                                      {symbol}{min.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs">Max</p>
                                    <p className="font-semibold text-gray-900">
                                      {symbol}{max.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No limits available</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-3">No limits available</p>
                <button
                  onClick={fetchChainLimits}
                  className="text-sm text-[#ff6b00] hover:text-[#e55a00] font-medium"
                >
                  Retry
                </button>
              </div>
            )}
          </motion.div>
          </div>

        {/* Supported Currencies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Supported Currencies</h3>
              <p className="text-sm text-gray-600">Available currencies and payment modes</p>
            </div>
          </div>
          {currenciesLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff6b00]"></div>
              <p className="text-sm text-gray-500 mt-2">Loading currencies...</p>
            </div>
          ) : supportedCurrencies.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {supportedCurrencies.map((currency: any, index: number) => (
                <div key={currency.currency || index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {currency.currency || currency.code || 'Unknown'}
                    </h4>
                    <span className="text-2xl">
                      {currency.currency === 'INR' && '🇮🇳'}
                      {currency.currency === 'PHP' && '🇵🇭'}
                      {currency.currency === 'IDR' && '🇮🇩'}
                      {currency.currency === 'USD' && '🇺🇸'}
                    </span>
                  </div>
                  {currency.paymentModes && currency.paymentModes.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Payment Modes:</p>
                      <div className="flex flex-wrap gap-1">
                        {currency.paymentModes.map((mode: string, modeIndex: number) => (
                          <span
                            key={modeIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium"
                          >
                            {mode.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No currencies available</p>
                  <button
                onClick={fetchSupportedCurrenciesData}
                className="mt-2 text-sm text-[#ff6b00] hover:underline"
                  >
                Retry
                  </button>
                  </div>
              )}
        </motion.div>

        {/* Token Quotation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
                      </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Token Quotation</h3>
              <p className="text-sm text-gray-600">Get real-time token prices and conversion rates</p>
            </div>
          </div>
                        <button
            onClick={() => setShowQuotationModal(true)}
            className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors"
          >
            Get Quotation
                        </button>
        </motion.div>

        {/* Order Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
                      </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Order Status</h3>
              <p className="text-sm text-gray-600">Check the status of your orders</p>
                      </div>
                    </div>
                  <button
            onClick={() => setShowOrderStatusModal(true)}
            className="w-full bg-violet-500 text-white py-3 rounded-xl font-semibold hover:bg-violet-600 transition-colors"
                  >
            Check Order Status
                  </button>
        </motion.div>

        {/* Update UTR Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow mb-8"
                    >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
                  </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Update UTR</h3>
              <p className="text-sm text-gray-600">Update UTR from payment success screen</p>
                    </div>
                    </div>
          <button
            onClick={() => setShowUpdateUTRModal(true)}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
          >
            Update UTR
          </button>
        </motion.div>

        {/* Order History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                </div>
                    <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">Order History</h3>
                  {orderHistory.some((order: any) => {
                    const status = order.status || order.orderStatus || '';
                    return status === 'pending' || status === 'PENDING' || status === 'fiatPending' || 
                           status === 'orderReceived' || status === 'fiatReceived' || status === 'InProgress';
                  }) && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                      Auto-refreshing
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Your recent transactions</p>
                    </div>
            </div>
                  <button
              onClick={() => fetchOrderHistory(0, false)}
              disabled={orderHistoryLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
              {orderHistoryLoading && <LoadingSpinner size="sm" />}
              {orderHistoryLoading ? 'Loading...' : 'Refresh'}
                  </button>
                        </div>

          {orderHistoryLoading && orderHistory.length === 0 ? (
            <SkeletonTable />
          ) : orderHistory.length > 0 ? (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orderHistory.map((order: any, index: number) => (
                  <div
                    key={order.orderId || order.id || index}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          order.status === 'completed' || order.status === 'SUCCESS' || order.status === 'transferred'
                            ? 'bg-green-500 animate-pulse'
                            : order.status === 'pending' || order.status === 'PENDING' || order.status === 'fiatPending' || order.status === 'orderReceived' || order.status === 'fiatReceived' || order.status === 'InProgress'
                            ? 'bg-yellow-500 animate-pulse'
                            : order.status === 'failed' || order.status === 'FAILED' || order.status === 'expired'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                        }`}></div>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              Order #{order.orderId || order.id || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {order.orderId || order.id || 'N/A'}
                            </p>
                          </div>
                          {(order.orderId || order.id) && (
                            <CopyButton text={order.orderId || order.id} />
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed' || order.status === 'SUCCESS' || order.status === 'transferred'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : order.status === 'pending' || order.status === 'PENDING' || order.status === 'fiatPending' || order.status === 'orderReceived' || order.status === 'fiatReceived' || order.status === 'InProgress'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : order.status === 'failed' || order.status === 'FAILED' || order.status === 'expired'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {order.status === 'completed' || order.status === 'SUCCESS' ? '✓ Completed' :
                         order.status === 'transferred' ? '✓ Transferred' :
                         order.status === 'pending' || order.status === 'PENDING' ? '⏳ Pending' :
                         order.status === 'fiatPending' ? '⏳ Payment Pending' :
                         order.status === 'orderReceived' ? '✅ Payment Received' :
                         order.status === 'fiatReceived' ? '💰 Fiat Received' :
                         order.status === 'InProgress' ? '⏳ In Progress' :
                         order.status === 'failed' || order.status === 'FAILED' ? '❌ Failed' :
                         order.status === 'expired' ? '⏰ Expired' :
                         order.status || order.orderStatus || 'Unknown'}
                      </span>
                        </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      {order.fiatAmount && (
                          <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-semibold text-gray-900">
                            {order.fiatCurrency === 'INR' ? '₹' : order.fiatCurrency === 'PHP' ? '₱' : order.fiatCurrency === 'IDR' ? 'Rp' : '$'}
                            {order.fiatAmount?.toLocaleString()}
                    </p>
                        </div>
                      )}
                      {order.buyTokenSymbol && (
                        <div>
                          <p className="text-gray-500">Token</p>
                          <p className="font-semibold text-gray-900">{order.buyTokenSymbol}</p>
                  </div>
                      )}
                      {order.createdAt && (
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                  </div>
                      )}
                      {order.paymentMode && (
                        <div>
                          <p className="text-gray-500">Payment</p>
                          <p className="font-semibold text-gray-900">{order.paymentMode}</p>
                  </div>
                      )}
                  </div>
                  </div>
                ))}
              </div>
              {orderHistoryHasMore && (
                <button
                  onClick={() => fetchOrderHistory(orderHistorySkip + 1, true)}
                  disabled={orderHistoryLoading}
                  className="w-full mt-4 px-4 py-2 text-sm font-medium text-[#ff6b00] bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {orderHistoryLoading && <LoadingSpinner size="sm" />}
                  {orderHistoryLoading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Your order history will appear here once you create your first deposit or withdrawal.
              </p>
              <button
                onClick={() => setShowSendPaymentModal(true)}
                className="px-6 py-3 bg-[#ff6b00] text-white rounded-xl font-semibold hover:bg-[#e55a00] transition-colors mb-3"
              >
                Create Your First Order
              </button>
              <button
                onClick={() => fetchOrderHistory(0, false)}
                className="mt-2 text-sm text-[#ff6b00] hover:underline"
              >
                Retry
              </button>
                </div>
          )}
                    </motion.div>

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
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 text-sm font-mono">
                      {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Unknown"}
                    </span>
                    {walletAddress && <CopyButton text={walletAddress} size="sm" />}
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
                            onChange={(e) => {
                              setDepositAmount(e.target.value);
                              if (depositErrors.amount) {
                                setDepositErrors({ ...depositErrors, amount: undefined });
                              }
                            }}
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all bg-white ${
                              depositErrors.amount 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                                : 'border-gray-200 focus:border-[#ff6b00] focus:ring-[#ff6b00]/20'
                            }`}
                          />
                          {depositErrors.amount && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {depositErrors.amount}
                            </p>
                          )}
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
                          onChange={(e) => {
                            setDepositWalletAddress(e.target.value);
                            if (depositErrors.address) {
                              setDepositErrors({ ...depositErrors, address: undefined });
                            }
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all bg-white font-mono text-sm ${
                            depositErrors.address 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-200 focus:border-[#ff6b00] focus:ring-[#ff6b00]/20'
                          }`}
                        />
                        {depositErrors.address && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {depositErrors.address}
                          </p>
                        )}
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
                          const errors: { amount?: string; address?: string } = {};
                          const amount = parseFloat(depositAmount);
                          if (isNaN(amount) || amount <= 0) {
                            errors.amount = 'Please enter a valid amount';
                          }

                          // Use manually entered address if provided, otherwise use connected wallet address
                          const targetWalletAddress = depositWalletAddress || walletAddress;
                          if (!targetWalletAddress || targetWalletAddress.trim() === '') {
                            errors.address = 'Please enter a wallet address or connect your wallet';
                          } else {
                            // Basic wallet address validation (Solana addresses are base58 encoded, 32-44 chars)
                            const trimmedAddress = targetWalletAddress.trim();
                            if (trimmedAddress.length < 32 || trimmedAddress.length > 44) {
                              errors.address = 'Wallet address must be 32-44 characters';
                            }
                          }

                          if (Object.keys(errors).length > 0) {
                            setDepositErrors(errors);
                            showToast('Please fix the errors in the form', 'error');
                            return;
                          }
                          
                          setDepositErrors({});
                          
                          // Get trimmed address after validation
                          const trimmedAddress = (depositWalletAddress || walletAddress || '').trim();

                          // Check if OnMeta access token is available
                          if (!onMetaAccessToken) {
                            showToast('OnMeta authentication required. Please wait for authentication to complete or refresh the page.', 'warning');
                            setDepositLoading(false);
                            return;
                          }

                          // Determine payment mode based on currency
                          let paymentMode = '';
                          if (selectedPaymentMethod === 'INR') {
                            // Check if UPI is linked, default to UPI if available
                            if (onMetaUPIStatus === 'SUCCESS') {
                              paymentMode = 'INR_UPI';
                            } else if (onMetaBankStatus === 'SUCCESS') {
                              paymentMode = 'INR_IMPS'; // Default to IMPS for bank
                            } else {
                              showToast('Please link your UPI ID or Bank Account first before creating an order.', 'warning');
                              setDepositLoading(false);
                              return;
                            }
                          } else if (selectedPaymentMethod === 'PHP') {
                            paymentMode = 'PHP_EWALLET_GCASH'; // Default to GCash
                          } else if (selectedPaymentMethod === 'IDR') {
                            // IDR payment modes - you may need to check what's available
                            paymentMode = 'IDR_BANK_TRANSFER'; // Adjust based on available modes
                          }

                          // Get token address - you may want to fetch this from supported tokens
                          // For now, using a default USDC address for Polygon testnet
                          const buyTokenAddress = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'; // USDC on Polygon testnet
                          const chainId = 80001; // Polygon testnet

                          // Build request body
                          const requestBody: any = {
                            buyTokenSymbol: 'USDC',
                            chainId: chainId,
                            fiatCurrency: selectedPaymentMethod.toLowerCase(),
                            fiatAmount: amount,
                            buyTokenAddress: buyTokenAddress,
                            receiverAddress: trimmedAddress,
                            paymentMode: paymentMode,
                            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/dashboard?onmeta_callback=true`,
                            metaData: {
                              userId: getAuthEmail() || '',
                              userName: userProfile?.name || '',
                            },
                          };

                          // Add UPI ID if payment mode is UPI
                          if (paymentMode.includes('UPI')) {
                            if (onMetaUPIStatus === 'SUCCESS' && linkedUPIId) {
                              requestBody.upiId = { upiId: linkedUPIId };
                            } else {
                              // Prompt for UPI ID if not stored
                              const upiId = prompt('Enter your UPI ID (e.g., yourname@paytm):');
                              if (!upiId) {
                                setDepositLoading(false);
                                return;
                              }
                              requestBody.upiId = { upiId: upiId };
                            }
                          }

                          // Add bank details if payment mode is IMPS/NEFT
                          if (paymentMode.includes('IMPS') || paymentMode.includes('NEFT')) {
                            if (onMetaBankStatus === 'SUCCESS' && linkedBankDetails) {
                              requestBody.bankDetails = linkedBankDetails;
                            } else if (linkBankAccountNumber && linkBankIFSC && linkBankAccountHolder) {
                              // Use form data if available
                              requestBody.bankDetails = {
                                accountNumber: linkBankAccountNumber,
                                ifscCode: linkBankIFSC,
                                accountHolderName: linkBankAccountHolder,
                              };
                            } else {
                              showToast('Bank account details are required. Please link your bank account with complete details.', 'warning');
                              setDepositLoading(false);
                              return;
                            }
                          }

                          // Create onramp order via OnMeta API
                          setDepositLoading(true);
                          try {
                            const response = await fetch('/api/onmeta/orders/create-onramp', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${onMetaAccessToken}`,
                              },
                              body: JSON.stringify(requestBody),
                            });

                            const data = await response.json();
                            
                            if (data.success && (data.orderUrl || data.depositUrl)) {
                              // Redirect to OnMeta's order page
                              window.location.href = data.orderUrl || data.depositUrl;
                            } else {
                              showToast(data.error || 'Failed to create onramp order. Please try again.', 'error');
                              setDepositLoading(false);
                            }
                          } catch (error: any) {
                            console.error('Create onramp order error:', error);
                            showToast(`Error: ${error.message || 'Failed to create onramp order. Please try again.'}`, 'error');
                            setDepositLoading(false);
                          }
                        } else {
                          // Handle other payment methods (Stables, Bank Transfer)
                          console.log('Initiate payment for:', selectedPaymentMethod);
                          showToast('This payment method will be implemented soon.', 'info');
                          setSelectedPaymentMethod(null);
                          setDepositAmount('');
                          setDepositWalletAddress('');
                          setShowSendPaymentModal(false);
                        }
                      }}
                      disabled={
                        (['INR', 'PHP', 'IDR'].includes(selectedPaymentMethod || '') && (!depositAmount || parseFloat(depositAmount) <= 0 || (!walletAddress && !depositWalletAddress)))
                      }
                      className="flex-1 px-4 py-3 sm:py-2 bg-[#ff6b00] text-white rounded-xl font-semibold hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {depositLoading && <LoadingSpinner size="sm" />}
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl w-full shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
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
                        showToast('Please fill in all required fields', 'error');
                        return;
                      }

                      const amount = parseFloat(withdrawAmount);
                      if (isNaN(amount) || amount <= 0) {
                        showToast('Please enter a valid amount', 'error');
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
                          showToast(`Withdrawal initiated successfully! Order ID: ${data.orderId || data.transactionId || 'N/A'}`, 'success');
                          // Reset form
                          setWithdrawAmount('');
                          setBankAccountNumber('');
                          setBankCode('');
                          setAccountHolderName('');
                          setSelectedWithdrawCurrency(null);
                          setShowWithdrawModal(false);
                        } else {
                          showToast(data.error || 'Failed to initiate withdrawal. Please try again.', 'error');
                        }
                      } catch (error: any) {
                        console.error('Withdrawal error:', error);
                        showToast('An error occurred. Please try again.', 'error');
                      } finally {
                        setWithdrawLoading(false);
                      }
                    }}
                    disabled={!selectedWithdrawCurrency || withdrawLoading || !withdrawAmount || !bankAccountNumber || !bankCode || !accountHolderName}
                    className="flex-1 px-4 py-3 bg-[#ff6b00] text-white rounded-xl font-semibold hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {withdrawLoading && <LoadingSpinner size="sm" />}
                    {withdrawLoading ? 'Processing...' : 'Withdraw'}
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Link Bank Account Modal */}
        {showLinkBankModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl w-full shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Link Bank Account</h3>
                    <button
                      onClick={() => {
                    setShowLinkBankModal(false);
                    // Reset form
                    setLinkBankName('');
                    setLinkBankPAN('');
                    setLinkBankEmail('');
                    setLinkBankKYCVerified(false);
                    setLinkBankAccountNumber('');
                    setLinkBankIFSC('');
                    setLinkBankAccountHolder('');
                    setLinkBankPhoneNumber('');
                      }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                    </button>
                  </div>

              <div className="space-y-4">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (as per bank records)</label>
                      <input
                        type="text"
                        value={linkBankName}
                        onChange={(e) => setLinkBankName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                      <input
                        type="text"
                        value={linkBankPAN}
                        onChange={(e) => setLinkBankPAN(e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={linkBankEmail}
                        onChange={(e) => setLinkBankEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="flex gap-2">
                        <select
                          value={linkBankPhoneCountryCode}
                          onChange={(e) => setLinkBankPhoneCountryCode(e.target.value)}
                          className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                        >
                          <option value="+91">+91 (IN)</option>
                          <option value="+63">+63 (PH)</option>
                          <option value="+62">+62 (ID)</option>
                        </select>
                        <input
                          type="tel"
                          value={linkBankPhoneNumber}
                          onChange={(e) => setLinkBankPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="1234567890"
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="kycVerified"
                        checked={linkBankKYCVerified}
                        onChange={(e) => setLinkBankKYCVerified(e.target.checked)}
                        className="w-5 h-5 text-[#ff6b00] border-gray-300 rounded focus:ring-[#ff6b00]"
                      />
                      <label htmlFor="kycVerified" className="text-sm text-gray-700">
                        KYC Verified
                      </label>
                    </div>
                  </div>
          </div>

                {/* Bank Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={linkBankAccountNumber}
                        onChange={(e) => setLinkBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter account number"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        value={linkBankIFSC}
                        onChange={(e) => setLinkBankIFSC(e.target.value.toUpperCase())}
                        placeholder="ABCD0123456"
                        maxLength={11}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                      <input
                        type="text"
                        value={linkBankAccountHolder}
                        onChange={(e) => setLinkBankAccountHolder(e.target.value)}
                        placeholder="As per bank records"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                  </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                          onClick={() => {
                      setShowLinkBankModal(false);
                      // Reset form
                      setLinkBankName('');
                      setLinkBankPAN('');
                      setLinkBankEmail('');
                      setLinkBankKYCVerified(false);
                      setLinkBankAccountNumber('');
                      setLinkBankIFSC('');
                      setLinkBankAccountHolder('');
                      setLinkBankPhoneNumber('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!onMetaAccessToken) {
                        showToast('OnMeta authentication required. Please refresh the page.', 'warning');
                        return;
                      }

                      if (!linkBankName || !linkBankPAN || !linkBankEmail || !linkBankAccountNumber || !linkBankIFSC || !linkBankAccountHolder || !linkBankPhoneNumber) {
                        showToast('Please fill in all required fields', 'error');
                        return;
                      }

                      setLinkBankLoading(true);
                      try {
                        const response = await fetch('/api/onmeta/account/link-bank', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${onMetaAccessToken}`,
                          },
                          body: JSON.stringify({
                            name: linkBankName,
                            panNumber: linkBankPAN,
                            email: linkBankEmail,
                            kycVerified: linkBankKYCVerified,
                            bankDetails: {
                              accountNumber: linkBankAccountNumber,
                              ifscCode: linkBankIFSC,
                              accountHolderName: linkBankAccountHolder,
                            },
                            phone: {
                              countryCode: linkBankPhoneCountryCode,
                              number: linkBankPhoneNumber,
                            },
                          }),
                        });

                        const data = await response.json();
                        
                        if (data.success) {
                          showToast(`Bank account linking ${data.status || 'initiated'}!`, 'success');
                          setOnMetaBankStatus(data.status);
                          
                          // Store bank details for order creation
                          if (data.status === 'SUCCESS') {
                            setLinkedBankDetails({
                              accountNumber: linkBankAccountNumber,
                              ifscCode: linkBankIFSC,
                              accountHolderName: linkBankAccountHolder,
                            });
                          }
                          
                          // Store reference number (refNumber) for status checks
                          if (data.refNumber) {
                            localStorage.setItem('onmeta_bank_ref_number', data.refNumber);
                            console.log('Stored bank reference number:', data.refNumber);
                          }
                          
                          setShowLinkBankModal(false);
                          // Reset form
                          setLinkBankName('');
                          setLinkBankPAN('');
                          setLinkBankEmail('');
                          setLinkBankKYCVerified(false);
                          setLinkBankAccountNumber('');
                          setLinkBankIFSC('');
                          setLinkBankAccountHolder('');
                          setLinkBankPhoneNumber('');
                          // Refresh account status with reference number
                          if (data.refNumber) {
                            fetchOnMetaAccountStatus(onMetaAccessToken, undefined, data.refNumber);
                          } else {
                            fetchOnMetaAccountStatus(onMetaAccessToken);
                          }
                        } else {
                          showToast(data.error || 'Failed to link bank account. Please try again.', 'error');
                        }
                      } catch (error: any) {
                        console.error('Link bank error:', error);
                        showToast(`Error: ${error.message || 'Failed to link bank account. Please try again.'}`, 'error');
                      } finally {
                        setLinkBankLoading(false);
                      }
                    }}
                    disabled={linkBankLoading}
                    className="flex-1 px-4 py-3 bg-[#ff6b00] text-white rounded-xl font-semibold hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                    {linkBankLoading && <LoadingSpinner size="sm" />}
                    {linkBankLoading ? 'Linking...' : 'Link Bank Account'}
                    </button>
                </div>
              </div>
            </motion.div>
                  </div>
                )}

        {/* Link UPI Modal */}
        {showLinkUPIModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl w-full shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Link UPI ID</h3>
                      <button
                  onClick={() => {
                    setShowLinkUPIModal(false);
                    // Reset form
                    setLinkUPIName('');
                    setLinkUPIEmail('');
                    setLinkUPIId('');
                    setLinkUPIPhoneNumber('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                      </button>
          </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (as per bank records)</label>
                  <input
                    type="text"
                    value={linkUPIName}
                    onChange={(e) => setLinkUPIName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                  />
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={linkUPIEmail}
                    onChange={(e) => setLinkUPIEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                  />
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                  <input
                    type="text"
                    value={linkUPIId}
                    onChange={(e) => setLinkUPIId(e.target.value.toLowerCase())}
                    placeholder="yourname@paytm or yourname@upi"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">Format: yourname@bankname (e.g., john@paytm, jane@ybl)</p>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                  <div className="flex gap-2">
                    <select
                      value={linkUPIPhoneCountryCode}
                      onChange={(e) => setLinkUPIPhoneCountryCode(e.target.value)}
                      className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+63">+63 (PH)</option>
                      <option value="+62">+62 (ID)</option>
                    </select>
                    <input
                      type="tel"
                      value={linkUPIPhoneNumber}
                      onChange={(e) => setLinkUPIPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567890 (optional)"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                      <button
                    onClick={() => {
                      setShowLinkUPIModal(false);
                      // Reset form
                      setLinkUPIName('');
                      setLinkUPIEmail('');
                      setLinkUPIId('');
                      setLinkUPIPhoneNumber('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!onMetaAccessToken) {
                        showToast('OnMeta authentication required. Please refresh the page.', 'error');
                        return;
                      }

                      // Check if KYC is verified before allowing UPI linking
                      // OnMeta requires KYC to be verified before linking UPI
                      const storedKYCVerified = localStorage.getItem('onmeta_kyc_verified');
                      if (storedKYCVerified !== 'true' && onMetaKYCStatus !== 'VERIFIED') {
                        // Try to verify KYC status with OnMeta API
                        const userEmail = getAuthEmail();
                        if (userEmail) {
                          try {
                            const kycResponse = await fetch('/api/onmeta/kyc-status', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${onMetaAccessToken}`,
                              },
                              body: JSON.stringify({ email: userEmail }),
                            });
                            
                            const kycData = await kycResponse.json();
                            console.log('KYC status check result:', { 
                              status: kycResponse.status, 
                              ok: kycResponse.ok,
                              data: kycData,
                              isVerified: kycData.isVerified,
                              kycStatus: kycData.kycStatus,
                              success: kycData.success,
                              error: kycData.error,
                              message: kycData.message
                            });
                            
                            // Check if KYC is verified - handle various response formats
                            const isVerified = (
                              kycData.isVerified === true || 
                              kycData.kycStatus === 'VERIFIED' || 
                              kycData.kycStatus === 'verified' ||
                              kycData.kycStatus === 'VERIFIED_SUCCESS' ||
                              kycData.kycStatus === 'SUCCESS'
                            );
                            
                            if (isVerified) {
                              // Store KYC verification status
                              localStorage.setItem('onmeta_kyc_verified', 'true');
                              localStorage.setItem('onmeta_kyc_verified_timestamp', Date.now().toString());
                              setOnMetaKYCStatus('VERIFIED');
                              console.log('KYC verified, proceeding with UPI linking');
                            } else {
                              // KYC status not explicitly verified
                              // Check if API explicitly says "KYC not verified" - only then block
                              // Otherwise, allow proceeding and let OnMeta handle validation
                              const errorMsg = kycData.error || kycData.message || '';
                              const errorMsgStr = typeof errorMsg === 'string' ? errorMsg : (errorMsg.message || '');
                              const explicitlyNotVerified = errorMsgStr.toLowerCase().includes('kyc not verified') || 
                                                           errorMsgStr.toLowerCase().includes('kyc verification required') ||
                                                           errorMsgStr.toLowerCase().includes('kyc is not verified');
                              
                              if (explicitlyNotVerified && kycResponse.ok && kycData.success === false) {
                                // API explicitly says KYC is not verified - block and show message
                                localStorage.removeItem('onmeta_kyc_verified');
                                localStorage.removeItem('onmeta_kyc_verified_timestamp');
                                setOnMetaKYCStatus(null);
                                console.log('KYC explicitly not verified by API, blocking UPI link');
                                showToast('KYC verification is required before linking UPI. Please complete KYC verification first.', 'warning');
                                return;
                              } else {
                                // KYC status unclear or API didn't explicitly say not verified
                                // Allow proceeding - OnMeta will validate KYC when linking UPI
                                console.log('KYC status unclear or not explicitly denied, allowing UPI link attempt - OnMeta will validate');
                                // Don't block - continue to UPI linking
                              }
                            }
                          } catch (kycError) {
                            console.error('KYC status check error:', kycError);
                            // If KYC check fails, allow proceeding (graceful degradation)
                            // OnMeta API will return an error if KYC is not verified
                            // Don't block the user - let OnMeta API handle the validation
                            console.log('KYC check failed, allowing UPI link attempt - OnMeta will validate');
                          }
                        } else {
                          showToast('KYC verification is required before linking UPI. Please complete KYC verification first.', 'warning');
                          return;
                        }
                      }

                      if (!linkUPIName || !linkUPIEmail || !linkUPIId) {
                        showToast('Please fill in all required fields', 'error');
                        return;
                      }

                      if (!linkUPIId.includes('@')) {
                        showToast('Invalid UPI ID format. Should be like: yourname@bankname', 'error');
                        return;
                      }

                      setLinkUPILoading(true);
                      try {
                        // Ensure we have a valid access token before making the request
                        let accessToken = await ensureValidAccessToken();
                        if (!accessToken) {
                          showToast('Failed to authenticate. Please try logging in again.', 'error');
                          setLinkUPILoading(false);
                          return;
                        }

                        const requestBody: any = {
                          name: linkUPIName,
                          email: linkUPIEmail,
                          upiId: linkUPIId,
                        };

                        if (linkUPIPhoneNumber) {
                          requestBody.phone = {
                            countryCode: linkUPIPhoneCountryCode,
                            number: linkUPIPhoneNumber,
                          };
                        }

                        let response = await fetch('/api/onmeta/account/link-upi', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                          },
                          body: JSON.stringify(requestBody),
                        });

                        let data = await response.json();

                        // If we get 401, try refreshing token and retry once
                        if (response.status === 401) {
                          console.log('🔄 Got 401, refreshing token and retrying...');
                          accessToken = await ensureValidAccessToken();
                          if (accessToken) {
                            // Retry the request with new token
                            response = await fetch('/api/onmeta/account/link-upi', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                              },
                              body: JSON.stringify(requestBody),
                            });
                            data = await response.json();
                          }
                        }
                        console.log('Link UPI API response:', {
                          status: response.status,
                          success: data.success,
                          upiStatus: data.status,
                          error: data.error,
                          refNumber: data.refNumber,
                          fullResponse: data,
                        });
                        
                        // Check both success flag and status field
                        // OnMeta can return success: true but status: "FAILED"
                        const upiStatus = data.status || data.data?.status;
                        const isSuccess = data.success && (upiStatus === 'SUCCESS' || upiStatus === 'PENDING');
                        
                        if (isSuccess) {
                          // Success or Pending - show success message
                          const statusMessage = upiStatus === 'SUCCESS' ? 'linked successfully' : 'initiated';
                          showToast(`UPI ID linking ${statusMessage}!`, 'success');
                          setOnMetaUPIStatus(upiStatus);
                          
                          // Store UPI ID and reference ID for future status checks
                          if (upiStatus === 'SUCCESS') {
                            setLinkedUPIId(linkUPIId);
                          }
                          
                          // Store reference ID (refNumber) for status checks
                          if (data.refNumber) {
                            localStorage.setItem('onmeta_upi_ref_number', data.refNumber);
                            console.log('Stored UPI reference number:', data.refNumber);
                          }
                          
                          setShowLinkUPIModal(false);
                          // Reset form
                          setLinkUPIName('');
                          setLinkUPIEmail('');
                          setLinkUPIId('');
                          setLinkUPIPhoneNumber('');
                          // Refresh account status with reference number
                          if (accessToken) {
                            if (data.refNumber) {
                              fetchOnMetaAccountStatus(accessToken, data.refNumber);
                            } else {
                              fetchOnMetaAccountStatus(accessToken);
                            }
                          }
                        } else {
                          // Failed - check UPI status using refNumber to get more details
                          let errorMsg = 'Failed to link UPI ID. Please try again.';
                          
                          // If we have a refNumber, try to get detailed status
                          if (data.refNumber && accessToken) {
                            try {
                              console.log('Checking UPI status for refNumber:', data.refNumber);
                              const statusResponse = await fetch(`/api/onmeta/account/upi-status?refNumber=${encodeURIComponent(data.refNumber)}`, {
                                headers: {
                                  'Authorization': `Bearer ${accessToken}`,
                                },
                              });
                              
                              if (statusResponse.ok) {
                                const statusData = await statusResponse.json();
                                console.log('UPI status check result:', statusData);
                                
                                // Extract error message from status response
                                if (statusData.error) {
                                  errorMsg = typeof statusData.error === 'string' ? statusData.error : (statusData.error.message || errorMsg);
                                } else if (statusData.message) {
                                  errorMsg = statusData.message;
                                } else if (statusData.status === 'FAILED') {
                                  errorMsg = 'UPI linking failed. Please verify your UPI ID and try again.';
                                }
                              }
                            } catch (statusError) {
                              console.error('Failed to check UPI status:', statusError);
                            }
                          }
                          
                          // Extract error message from response
                          if (data.error) {
                            if (typeof data.error === 'string') {
                              errorMsg = data.error;
                            } else if (typeof data.error === 'object' && data.error.message) {
                              errorMsg = data.error.message;
                            } else if (typeof data.error === 'object' && data.error.code) {
                              errorMsg = data.error.message || `Error ${data.error.code}`;
                            }
                          } else if (data.message) {
                            errorMsg = typeof data.message === 'string' ? data.message : String(data.message);
                          } else if (upiStatus === 'FAILED') {
                            errorMsg = 'UPI linking failed. Please verify your UPI ID and try again.';
                          }
                          
                          // Store refNumber even if failed, so user can check status later
                          if (data.refNumber) {
                            localStorage.setItem('onmeta_upi_ref_number', data.refNumber);
                            console.log('Stored UPI reference number (failed):', data.refNumber);
                          }
                          
                          setOnMetaUPIStatus(upiStatus || 'FAILED');
                          console.error('Link UPI failed:', errorMsg, data);
                          
                          // If error is about KYC, clear stored KYC status and show helpful message
                          if (errorMsg.toLowerCase().includes('kyc') || errorMsg.toLowerCase().includes('not verified')) {
                            localStorage.removeItem('onmeta_kyc_verified');
                            localStorage.removeItem('onmeta_kyc_verified_timestamp');
                            setOnMetaKYCStatus(null);
                            // Only show KYC message if the error doesn't already contain it
                            if (!errorMsg.toLowerCase().includes('kyc verification is required')) {
                              errorMsg = 'KYC verification is required. Please complete KYC verification first, then try again.';
                            }
                          }
                          
                          showToast(errorMsg, 'error');
                        }
                      } catch (error: any) {
                        console.error('Link UPI error:', error);
                        // Ensure we always show a string error message, not an object
                        const errorMsg = error?.message || error?.error || (typeof error === 'string' ? error : 'Failed to link UPI ID. Please try again.');
                        showToast(`Error: ${errorMsg}`, 'error');
                      } finally {
                        setLinkUPILoading(false);
                      }
                    }}
                    disabled={linkUPILoading}
                    className="flex-1 px-4 py-3 bg-[#ff6b00] text-white rounded-xl font-semibold hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {linkUPILoading ? 'Linking...' : 'Link UPI ID'}
                      </button>
                </div>
                    </div>
          </motion.div>
                    </div>
                  )}

        {/* KYC Submission Modal */}
        {showKYCSubmitModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Submit KYC Data</h3>
                      <button
                  onClick={() => {
                    setShowKYCSubmitModal(false);
                    // Reset form
                    setKycSubmitForm({
                      email: '',
                      firstName: '',
                      lastName: '',
                      panNumber: '',
                      aadharNumber: '',
                      incomeRange: '<10L',
                      profession: '',
                      selfie: '',
                      aadharFront: '',
                      aadharBack: '',
                      panFront: '',
                      panBack: '',
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                      </button>
                    </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={kycSubmitForm.email}
                        onChange={(e) => setKycSubmitForm({ ...kycSubmitForm, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={kycSubmitForm.firstName}
                        onChange={(e) => setKycSubmitForm({ ...kycSubmitForm, firstName: e.target.value })}
                        placeholder="John"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={kycSubmitForm.lastName}
                        onChange={(e) => setKycSubmitForm({ ...kycSubmitForm, lastName: e.target.value })}
                        placeholder="Doe"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number *</label>
                      <input
                        type="text"
                        value={kycSubmitForm.panNumber}
                        onChange={(e) => setKycSubmitForm({ ...kycSubmitForm, panNumber: e.target.value.toUpperCase() })}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number *</label>
                      <input
                        type="text"
                        value={kycSubmitForm.aadharNumber}
                        onChange={(e) => setKycSubmitForm({ ...kycSubmitForm, aadharNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="123456789012"
                        maxLength={12}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Income Range *</label>
                      <select
                        value={kycSubmitForm.incomeRange}
                        onChange={(e) => setKycSubmitForm({ ...kycSubmitForm, incomeRange: e.target.value as any })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      >
                        <option value="<10L">Less than 10L</option>
                        <option value="10L-15L">10L - 15L</option>
                        <option value="15L-20L">15L - 20L</option>
                        <option value="20L-25L">20L - 25L</option>
                        <option value="25L-50L">25L - 50L</option>
                        <option value=">50L">Greater than 50L</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profession *</label>
                      <input
                        type="text"
                        value={kycSubmitForm.profession}
                        onChange={(e) => setKycSubmitForm({ ...kycSubmitForm, profession: e.target.value })}
                        placeholder="Business man, Writer, Journalist"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Uploads */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Document Uploads *</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Selfie */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Selfie</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const base64 = await new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const result = reader.result as string;
                                // Remove data URL prefix if present
                                const base64String = result.includes(',') ? result.split(',')[1] : result;
                                resolve(base64String);
                              };
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                            setKycSubmitForm({ ...kycSubmitForm, selfie: base64 });
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                      {kycSubmitForm.selfie && <p className="mt-1 text-xs text-green-600">✓ Selfie uploaded</p>}
                    </div>

                    {/* Aadhaar Front */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Front</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const base64 = await new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const result = reader.result as string;
                                const base64String = result.includes(',') ? result.split(',')[1] : result;
                                resolve(base64String);
                              };
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                            setKycSubmitForm({ ...kycSubmitForm, aadharFront: base64 });
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                      {kycSubmitForm.aadharFront && <p className="mt-1 text-xs text-green-600">✓ Aadhaar front uploaded</p>}
                    </div>

                    {/* Aadhaar Back */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Back</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const base64 = await new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const result = reader.result as string;
                                const base64String = result.includes(',') ? result.split(',')[1] : result;
                                resolve(base64String);
                              };
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                            setKycSubmitForm({ ...kycSubmitForm, aadharBack: base64 });
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                      {kycSubmitForm.aadharBack && <p className="mt-1 text-xs text-green-600">✓ Aadhaar back uploaded</p>}
                    </div>

                    {/* PAN Front */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Front</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const base64 = await new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const result = reader.result as string;
                                const base64String = result.includes(',') ? result.split(',')[1] : result;
                                resolve(base64String);
                              };
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                            setKycSubmitForm({ ...kycSubmitForm, panFront: base64 });
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                      {kycSubmitForm.panFront && <p className="mt-1 text-xs text-green-600">✓ PAN front uploaded</p>}
                    </div>

                    {/* PAN Back */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Back</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const base64 = await new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const result = reader.result as string;
                                const base64String = result.includes(',') ? result.split(',')[1] : result;
                                resolve(base64String);
                              };
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                            setKycSubmitForm({ ...kycSubmitForm, panBack: base64 });
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                      />
                      {kycSubmitForm.panBack && <p className="mt-1 text-xs text-green-600">✓ PAN back uploaded</p>}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                <button
                    onClick={() => {
                      setShowKYCSubmitModal(false);
                      setKycSubmitForm({
                        email: '',
                        firstName: '',
                        lastName: '',
                        panNumber: '',
                        aadharNumber: '',
                        incomeRange: '<10L',
                        profession: '',
                        selfie: '',
                        aadharFront: '',
                        aadharBack: '',
                        panFront: '',
                        panBack: '',
                      });
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!onMetaAccessToken) {
                        showToast('OnMeta authentication required. Please refresh the page.', 'error');
                        return;
                      }

                      // Validation
                      if (!kycSubmitForm.email || !kycSubmitForm.firstName || !kycSubmitForm.lastName ||
                          !kycSubmitForm.panNumber || !kycSubmitForm.aadharNumber || !kycSubmitForm.profession ||
                          !kycSubmitForm.selfie || !kycSubmitForm.aadharFront || !kycSubmitForm.aadharBack ||
                          !kycSubmitForm.panFront || !kycSubmitForm.panBack) {
                        showToast('Please fill in all required fields and upload all documents', 'error');
                        return;
                      }

                      setKycSubmitLoading(true);
                      try {
                        const response = await fetch('/api/onmeta/kyc/submit', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${onMetaAccessToken}`,
                          },
                          body: JSON.stringify(kycSubmitForm),
                        });

                        if (!response.ok) {
                          const text = await response.text();
                          throw new Error(`Failed to submit KYC: ${response.status}`);
                        }

                        const data = await response.json();
                        
                        if (data.success) {
                          showToast(data.message || 'KYC data submitted successfully!', 'success');
                          setShowKYCSubmitModal(false);
                          setKycSubmitForm({
                            email: '',
                            firstName: '',
                            lastName: '',
                            panNumber: '',
                            aadharNumber: '',
                            incomeRange: '<10L',
                            profession: '',
                            selfie: '',
                            aadharFront: '',
                            aadharBack: '',
                            panFront: '',
                            panBack: '',
                          });
                        } else {
                          showToast(data.error || 'Failed to submit KYC data. Please try again.', 'error');
                        }
                      } catch (error: any) {
                        console.error('KYC submission error:', error);
                        showToast(`Error: ${error.message || 'Failed to submit KYC data. Please try again.'}`, 'error');
                      } finally {
                        setKycSubmitLoading(false);
                      }
                    }}
                    disabled={kycSubmitLoading}
                    className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {kycSubmitLoading && <LoadingSpinner size="sm" />}
                    {kycSubmitLoading ? 'Submitting...' : 'Submit KYC Data'}
                </button>
                </div>
                    </div>
          </motion.div>
          </div>
        )}

        {/* Update UTR Modal */}
        {showUpdateUTRModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Update UTR</h3>
                <button
                  onClick={() => {
                    setShowUpdateUTRModal(false);
                    setUpdateUTRForm({
                      orderId: '',
                      utr: '',
                      paymentMode: '',
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

                    <div className="space-y-4">
                {/* Order ID Input */}
                            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                  <input
                    type="text"
                    value={updateUTRForm.orderId}
                    onChange={(e) => setUpdateUTRForm({ ...updateUTRForm, orderId: e.target.value })}
                    placeholder="Enter order ID from create order response"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all font-mono text-sm"
                  />
                </div>

                {/* UTR Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UTR (Unique Transaction Reference)</label>
                  <input
                    type="text"
                    value={updateUTRForm.utr}
                  onChange={(e) => {
                      // Allow only alphanumeric for UTR
                      const value = e.target.value.replace(/[^A-Za-z0-9]/g, '');
                      setUpdateUTRForm({ ...updateUTRForm, utr: value });
                  }}
                    placeholder="Enter UTR from payment success screen"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    UPI/IMPS: 12 digits | NEFT: 16 alphanumeric characters
                  </p>
                </div>

                {/* Payment Mode Selection (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode (Optional - for validation)</label>
                  <select
                    value={updateUTRForm.paymentMode}
                    onChange={(e) => setUpdateUTRForm({ ...updateUTRForm, paymentMode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                >
                    <option value="">Select payment mode (optional)</option>
                    <option value="INR_UPI">UPI (12 digits)</option>
                    <option value="INR_IMPS">IMPS (12 digits)</option>
                    <option value="INR_NEFT">NEFT (16 alphanumeric)</option>
                </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Selecting payment mode helps validate UTR format
                  </p>
                            </div>

                {/* UTR Format Info */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">UTR Format Guidelines:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• UPI Payment: 12 character numbers</li>
                    <li>• IMPS Payment: 12 character numbers</li>
                    <li>• NEFT Payment: 16 character alphanumeric</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                          <button
                  onClick={() => {
                      setShowUpdateUTRModal(false);
                      setUpdateUTRForm({
                        orderId: '',
                        utr: '',
                        paymentMode: '',
                      });
                  }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUTR}
                    disabled={updateUTRLoading}
                    className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updateUTRLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Updating...
                      </>
                    ) : (
                      'Update UTR'
                    )}
                          </button>
                      </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Order Status Modal */}
        {showOrderStatusModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl w-full shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Check Order Status</h3>
                <button
                  onClick={() => {
                    setShowOrderStatusModal(false);
                    setOrderStatus(null);
                    setOrderStatusInput('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                        </div>

              <div className="space-y-4">
                {/* Order ID Input */}
                        <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                          <input
                    type="text"
                    value={orderStatusInput}
                    onChange={(e) => setOrderStatusInput(e.target.value)}
                    placeholder="Enter order ID from create order response"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter the order ID you received when creating an order</p>
                        </div>

                {/* Order Status Result */}
                {orderStatus && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200"
                  >
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Order Status Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-semibold text-gray-900 font-mono text-sm">{orderStatus.orderId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                          orderStatus.status === 'completed' || orderStatus.status === 'SUCCESS' 
                            ? 'bg-green-100 text-green-700' 
                            : orderStatus.status === 'pending' || orderStatus.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : orderStatus.status === 'failed' || orderStatus.status === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                          {orderStatus.status || orderStatus.orderStatus || 'Unknown'}
                    </span>
                      </div>
                      {orderStatus.order && typeof orderStatus.order === 'object' && (
                        <div className="mt-4 pt-4 border-t border-violet-200">
                          <h5 className="font-semibold text-gray-900 mb-2">Order Details:</h5>
                          <pre className="text-xs bg-white p-3 rounded-lg overflow-x-auto">
                            {JSON.stringify(orderStatus.order, null, 2)}
                          </pre>
                        </div>
                      )}
                      {orderStatus.message && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Message:</strong> {orderStatus.message}
                        </div>
                      )}
                    </div>
                </motion.div>
              )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                <button
                    onClick={() => {
                      setShowOrderStatusModal(false);
                      setOrderStatus(null);
                      setOrderStatusInput('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
                <button
                    onClick={fetchOrderStatus}
                    disabled={orderStatusLoading}
                    className="flex-1 px-4 py-3 bg-violet-500 text-white rounded-xl font-semibold hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {orderStatusLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Fetching...
                      </>
                  ) : (
                      'Check Status'
                  )}
                </button>
                      </div>
                    </div>
          </motion.div>
          </div>
                  )}

        {/* Token Quotation Modal */}
        {showQuotationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Get Token Quotation</h3>
                <button
                  onClick={() => {
                    setShowQuotationModal(false);
                    setQuotation(null);
                    setQuotationForm({
                      buyTokenSymbol: 'USDC',
                      chainId: 80001,
                      fiatCurrency: 'inr',
                      fiatAmount: '',
                      buyTokenAddress: '',
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Token Symbol */}
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Token Symbol</label>
                  <input
                    type="text"
                    value={quotationForm.buyTokenSymbol}
                    onChange={(e) => setQuotationForm({ ...quotationForm, buyTokenSymbol: e.target.value.toUpperCase() })}
                    placeholder="USDC"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                  />
                        </div>

                {/* Chain ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chain ID</label>
                  <select
                    value={quotationForm.chainId}
                    onChange={(e) => setQuotationForm({ ...quotationForm, chainId: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                  >
                    <option value={80001}>80001 - Polygon Testnet</option>
                    <option value={137}>137 - Polygon Mainnet</option>
                    <option value={1}>1 - Ethereum Mainnet</option>
                    <option value={5}>5 - Goerli Testnet</option>
                    <option value={56}>56 - BSC Mainnet</option>
                    <option value={97}>97 - BSC Testnet</option>
                  </select>
                        </div>

                {/* Fiat Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiat Currency</label>
                  <select
                    value={quotationForm.fiatCurrency}
                    onChange={(e) => setQuotationForm({ ...quotationForm, fiatCurrency: e.target.value.toLowerCase() })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                  >
                    <option value="inr">INR - Indian Rupee</option>
                    <option value="php">PHP - Philippine Peso</option>
                    <option value="idr">IDR - Indonesian Rupiah</option>
                    <option value="usd">USD - US Dollar</option>
                  </select>
                        </div>

                {/* Fiat Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiat Amount</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      {quotationForm.fiatCurrency === 'inr' && '₹'}
                      {quotationForm.fiatCurrency === 'php' && '₱'}
                      {quotationForm.fiatCurrency === 'idr' && 'Rp'}
                      {quotationForm.fiatCurrency === 'usd' && '$'}
                        </div>
                    <input
                      type="number"
                      value={quotationForm.fiatAmount}
                      onChange={(e) => setQuotationForm({ ...quotationForm, fiatAmount: e.target.value })}
                      placeholder="100"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Token Address */}
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Token Contract Address</label>
                  <input
                    type="text"
                    value={quotationForm.buyTokenAddress}
                    onChange={(e) => setQuotationForm({ ...quotationForm, buyTokenAddress: e.target.value })}
                    placeholder="0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter the smart contract address of the token</p>
              </div>

                {/* Quotation Result */}
                {quotation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200"
                  >
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Quotation Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Token Symbol:</span>
                        <span className="font-semibold text-gray-900">{quotation.buyTokenSymbol || quotationForm.buyTokenSymbol}</span>
                  </div>
                      {quotation.buyTokenAmount !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Token Amount:</span>
                          <span className="font-semibold text-gray-900">{quotation.buyTokenAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
              </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Fiat Amount:</span>
                        <span className="font-semibold text-gray-900">
                          {quotationForm.fiatCurrency === 'inr' ? '₹' : quotationForm.fiatCurrency === 'php' ? '₱' : quotationForm.fiatCurrency === 'idr' ? 'Rp' : '$'}
                          {quotation.fiatAmount?.toLocaleString() || quotationForm.fiatAmount}
                        </span>
                  </div>
                      {quotation.conversionRate !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Conversion Rate:</span>
                          <span className="font-semibold text-gray-900">
                            {quotationForm.fiatCurrency === 'inr' ? '₹' : quotationForm.fiatCurrency === 'php' ? '₱' : quotationForm.fiatCurrency === 'idr' ? 'Rp' : '$'}
                            {quotation.conversionRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} per {quotation.buyTokenSymbol || quotationForm.buyTokenSymbol}
                          </span>
              </div>
                      )}
                      {quotation.commission !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Commission:</span>
                          <span className="font-semibold text-gray-900">
                            {quotationForm.fiatCurrency === 'inr' ? '₹' : quotationForm.fiatCurrency === 'php' ? '₱' : quotationForm.fiatCurrency === 'idr' ? 'Rp' : '$'}
                            {quotation.commission.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      {quotation.totalAmount !== undefined && (
                        <div className="flex justify-between items-center pt-3 border-t border-teal-200">
                          <span className="text-gray-700 font-semibold">Total Amount:</span>
                          <span className="font-bold text-lg text-teal-600">
                            {quotationForm.fiatCurrency === 'inr' ? '₹' : quotationForm.fiatCurrency === 'php' ? '₱' : quotationForm.fiatCurrency === 'idr' ? 'Rp' : '$'}
                            {quotation.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                </div>
              </motion.div>
            )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                    onClick={() => {
                      setShowQuotationModal(false);
                      setQuotation(null);
                      setQuotationForm({
                        buyTokenSymbol: 'USDC',
                        chainId: 80001,
                        fiatCurrency: 'inr',
                        fiatAmount: '',
                        buyTokenAddress: '',
                      });
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Close
                    </button>
                    <button
                    onClick={fetchQuotation}
                    disabled={quotationLoading}
                    className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {quotationLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Fetching...
                      </>
                    ) : (
                      'Get Quotation'
                    )}
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
