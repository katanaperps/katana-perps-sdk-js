export const REST_API_KEY_HEADER = 'kp-api-key';
export const REST_HMAC_SIGNATURE_HEADER = 'kp-hmac-signature';

export const EIP_712_DOMAIN_NAME = 'KatanaPerps';

export const EIP_712_DOMAIN_VERSION = '2.0.0';

export const EIP_712_DOMAIN_VERSION_SANDBOX = '2.0.0-sandbox';

export const EIP_712_DOMAIN_NAME_FIXED_INCOME_VAULT_PROVIDER =
  'KatanaPerpsFixedIncomeVault';

export const EIP_712_DOMAIN_NAME_PROFIT_SHARE_VAULT_PROVIDER =
  'KatanaPerpsProfitShareVault';

export const EIP_712_DOMAIN_VERSION_VAULT_PROVIDER = '1.0.0';

export const EIP_712_DOMAIN_VERSION_VAULT_PROVIDER_SANDBOX = '1.0.0-sandbox';

// sdk-js-docs-v1-perps.katana.network
// api-docs-v1-perps.katana.network

export const VAULT_NAME_CHARACTER_LIMIT = 30;
export const VAULT_DESCRIPTION_CHARACTER_LIMIT = 2_000;

/**
 * The contracts' `FixedIncomeVaultConstants_v1` values, in pips or seconds. The
 * EIP-712 domain values are exported separately above.
 */
export const FIXED_INCOME_VAULT_PROVIDER_CONSTANTS = Object.freeze({
  fixedIncomeVaultInterestPeriodInS: 31_536_000n, // 1 year
  fixedIncomeVaultMinWithdrawalMaximumGasFee: 1_000_000n, // $0.01
  fixedIncomeVaultMaxInterestMultiplier: 1_000_000_000n, // 1000%
  fixedIncomeVaultMinInterestMultiplier: 0n, // 0%
  fixedIncomeVaultMaxNetDeposits: 18_446_744_073_709_551_615n, // type(uint64).max
  fixedIncomeVaultMinNetDeposits: 10_000_000_000n, // $100
  fixedIncomeVaultMaxWithdrawalThresholdMultiplier: 999_999_999n, // 999.999999%
  fixedIncomeVaultMinWithdrawalThresholdMultiplier: 50_000_000n, // 50%
  fixedIncomeVaultMaxExitThresholdMultiplier: 200_000_000n, // 200%
  fixedIncomeVaultMinExitThresholdMultiplier: 50_000_000n, // 50%
  fixedIncomeVaultMaxDepositWithdrawalExitAgeInS: 2_419_200n, // 28 days
  fixedIncomeVaultMinDepositWithdrawalExitAgeInS: 3_600n, // 1 hour
  fixedIncomeVaultMaxWithdrawalLimitPercentForDepositors: 100_000_000n, // 100%
  fixedIncomeVaultMinWithdrawalLimitPercentForDepositors: 10_000_000n, // 10%
  fixedIncomeVaultMaxWithdrawalLimitPercentForVault: 100_000_000n, // 100%
  fixedIncomeVaultMinWithdrawalLimitPercentForVault: 0n, // 0%
  fixedIncomeVaultMaxWithdrawalLimitWindowSizeInS: 604_800n, // 1 week
  fixedIncomeVaultMinWithdrawalLimitWindowSizeInS: 0n,
} as const);

/**
 * The contracts' `ProfitShareVaultConstants_v1` values, in pips or seconds. The
 * EIP-712 domain values are exported separately above.
 */
export const PROFIT_SHARE_VAULT_PROVIDER_CONSTANTS = Object.freeze({
  profitShareVaultInitialSharePrice: 100_000_000n, // $1
  profitShareVaultManagementFeePeriodInS: 31_536_000n, // 1 year
  profitShareVaultMinWithdrawalMaximumGasFee: 1_000_000n, // $0.01
  profitShareVaultMaxTotalShares: 18_446_744_073_709_551_615n, // type(uint64).max
  profitShareVaultMaxCarryFeeMultiplier: 50_000_000n, // 50%
  profitShareVaultMinCarryFeeMultiplier: 0n, // 0%
  profitShareVaultMaxExchangeCarryFeeMultiplier: 100_000_000n, // 100% of the carry fee
  profitShareVaultMinExchangeCarryFeeMultiplier: 0n, // 0% of the carry fee
  profitShareVaultMaxManagementFeeMultiplier: 10_000_000n, // 10% per year
  profitShareVaultMinManagementFeeMultiplier: 0n, // 0% per year
  profitShareVaultMaxNetDeposits: 18_446_744_073_709_551_615n, // type(uint64).max
  profitShareVaultMinNetDeposits: 10_000_000_000n, // $100
  profitShareVaultMaxDepositWithdrawalExitAgeInS: 2_419_200n, // 28 days
  profitShareVaultMinDepositWithdrawalExitAgeInS: 3_600n, // 1 hour
  profitShareVaultMaxWithdrawalLimitPercentForDepositors: 100_000_000n, // 100%
  profitShareVaultMinWithdrawalLimitPercentForDepositors: 10_000_000n, // 10%
  profitShareVaultMaxWithdrawalLimitPercentForVault: 100_000_000n, // 100%
  profitShareVaultMinWithdrawalLimitPercentForVault: 0n, // 0%
  profitShareVaultMaxWithdrawalLimitWindowSizeInS: 604_800n, // 1 week
  profitShareVaultMinWithdrawalLimitWindowSizeInS: 0n,
} as const);

export const WALLET_SIGNATURE_MESSAGE =
  'Sign this free message to prove you control this wallet';

/**
 * The URI that will be used based on the configuration given.  This includes
 * sandbox vs production as well as the multi-verse chain that should be used
 * (eth default for all clients).
 *
 * @see docs [Websocket API Interaction Docs](https://api-docs-v1-perps.katana.network/#websocket-api-interaction)
 * @see docs [REST API Interaction Docs](https://api-docs-v1-perps.katana.network/#rest-api-interaction)
 * @see docs [Sandbox API Docs](https://api-docs-v1-perps.katana.network/#sandbox)
 *
 * @internal
 */
export const URLS = Object.freeze({
  sandbox: {
    v1: {
      rest: 'https://api-perps-sandbox.katana.network/v1',
      websocket: 'wss://websocket-perps-sandbox.katana.network/v1',
    },
  },
  production: {
    v1: {
      rest: 'https://api-perps.katana.network/v1',
      websocket: 'wss://websocket-perps.katana.network/v1',
    },
  },
} as const);
