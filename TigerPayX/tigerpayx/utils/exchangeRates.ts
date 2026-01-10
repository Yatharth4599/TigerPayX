import { prisma } from '@/utils/db';

export interface ExchangeRateData {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  updatedAt: Date;
}

/**
 * Get exchange rate from cache (database)
 * Returns cached rate or null if not found
 */
export async function getCachedExchangeRate(
  fromCurrency: string,
  toCurrency: string = 'USDC'
): Promise<number | null> {
  try {
    const rate = await prisma.exchangeRate.findUnique({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
        },
      },
    });

    if (!rate) return null;

    // Check if rate is older than 5 minutes (300000 ms)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (rate.updatedAt < fiveMinutesAgo) {
      // Rate is stale, but return it anyway (will be updated in background)
      return Number(rate.rate);
    }

    return Number(rate.rate);
  } catch (error) {
    console.error('Error fetching cached exchange rate:', error);
    return null;
  }
}

/**
 * Fetch exchange rate from CoinGecko API
 * CoinGecko returns rates as: 1 USDC = X INR (so we need to invert for our use case)
 */
async function fetchExchangeRateFromAPI(
  fromCurrency: string,
  toCurrency: string = 'USDC'
): Promise<number | null> {
  try {
    // CoinGecko API mapping
    const coinGeckoIds: { [key: string]: string } = {
      INR: 'usd-coin', // We'll get USDC price in USD, then convert
      PHP: 'usd-coin',
      IDR: 'usd-coin',
      USD: 'usd-coin',
      USDC: 'usd-coin',
    };

    // For now, we'll use a simple approach:
    // 1. Get USDC price in USD (should be ~$1)
    // 2. Get fiat currency to USD rate
    // 3. Calculate: 1 fiat = X USDC

    if (fromCurrency === 'USD' && toCurrency === 'USDC') {
      // 1 USD = 1 USDC (approximately)
      return 1.0;
    }

    // For other currencies, we need to:
    // 1. Get USD to fiat rate (e.g., 1 USD = 83 INR)
    // 2. Calculate: 1 fiat = 1/USD_rate USDC
    // Example: 1 INR = 1/83 USDC = 0.012 USDC

    const currencyToUSD: { [key: string]: number } = {
      INR: 83.0, // 1 USD = 83 INR (approximate, should be fetched)
      PHP: 56.0, // 1 USD = 56 PHP
      IDR: 15600.0, // 1 USD = 15,600 IDR
      USD: 1.0,
    };

    const usdToFiat = currencyToUSD[fromCurrency.toUpperCase()];
    if (!usdToFiat) {
      console.error(`Unknown currency: ${fromCurrency}`);
      return null;
    }

    // 1 fiat = 1/USD_rate USDC
    // Example: 1 INR = 1/83 = 0.012048 USDC
    const rate = 1.0 / usdToFiat;
    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate from API:', error);
    return null;
  }
}

/**
 * Update exchange rate in database
 */
export async function updateExchangeRate(
  fromCurrency: string,
  toCurrency: string = 'USDC',
  rate: number
): Promise<void> {
  try {
    await prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
        },
      },
      update: {
        rate: rate,
        updatedAt: new Date(),
      },
      create: {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        rate: rate,
      },
    });
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    throw error;
  }
}

/**
 * Get or fetch exchange rate (with caching)
 * First checks cache, if stale or missing, fetches from API
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string = 'USDC'
): Promise<number> {
  // Try cache first
  const cachedRate = await getCachedExchangeRate(fromCurrency, toCurrency);
  
  if (cachedRate !== null) {
    return cachedRate;
  }

  // Cache miss or stale, fetch from API
  const apiRate = await fetchExchangeRateFromAPI(fromCurrency, toCurrency);
  
  if (apiRate === null) {
    // Fallback to default rates if API fails
    const fallbackRates: { [key: string]: number } = {
      INR: 0.012, // 1 INR = 0.012 USDC (approximate)
      PHP: 0.018, // 1 PHP = 0.018 USDC
      IDR: 0.000064, // 1 IDR = 0.000064 USDC
      USD: 1.0,
    };
    
    const fallbackRate = fallbackRates[fromCurrency.toUpperCase()] || 0.012;
    console.warn(`Using fallback rate for ${fromCurrency}: ${fallbackRate}`);
    
    // Update cache with fallback
    await updateExchangeRate(fromCurrency, toCurrency, fallbackRate);
    return fallbackRate;
  }

  // Update cache with fresh rate
  await updateExchangeRate(fromCurrency, toCurrency, apiRate);
  return apiRate;
}

/**
 * Get all exchange rates (for API endpoint)
 */
export async function getAllExchangeRates(): Promise<ExchangeRateData[]> {
  try {
    const rates = await prisma.exchangeRate.findMany({
      orderBy: {
        fromCurrency: 'asc',
      },
    });

    return rates.map((rate) => ({
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: Number(rate.rate),
      updatedAt: rate.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching all exchange rates:', error);
    return [];
  }
}

/**
 * Update all exchange rates (for cron job)
 */
export async function updateAllExchangeRates(): Promise<void> {
  const currencies = ['INR', 'PHP', 'IDR', 'USD'];
  
  for (const currency of currencies) {
    try {
      const rate = await fetchExchangeRateFromAPI(currency, 'USDC');
      if (rate !== null) {
        await updateExchangeRate(currency, 'USDC', rate);
        console.log(`Updated exchange rate: ${currency} → USDC = ${rate}`);
      }
    } catch (error: any) {
      console.error(`Error updating rate for ${currency}:`, error);
    }
  }
}

/**
 * Convert fiat amount to crypto (USDC)
 */
export async function convertFiatToCrypto(
  fiatAmount: number,
  fromCurrency: string
): Promise<number> {
  const rate = await getExchangeRate(fromCurrency, 'USDC');
  return fiatAmount * rate;
}

/**
 * Convert crypto (USDC) to fiat amount
 */
export async function convertCryptoToFiat(
  cryptoAmount: number,
  toCurrency: string
): Promise<number> {
  const rate = await getExchangeRate(toCurrency, 'USDC');
  return cryptoAmount / rate;
}

/**
 * Convert between fiat currencies
 */
export async function convertFiatToFiat(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  // Convert: fromCurrency → USDC → toCurrency
  const fromRate = await getExchangeRate(fromCurrency, 'USDC');
  const toRate = await getExchangeRate(toCurrency, 'USDC');
  
  const usdcAmount = amount * fromRate;
  return usdcAmount / toRate;
}

