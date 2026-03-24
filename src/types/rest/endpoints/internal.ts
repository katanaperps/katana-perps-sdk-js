import type {
  PayoutProgram,
  RestRequestByWallet,
  RestRequestByWalletOptional,
} from '#index';
import type { RestRequestWithSignature } from '#types/utils';
import type { KatanaPerpsDeposit } from './GetDeposits';
import type { KatanaPerpsWithdrawal } from './GetWithdrawals';
import type { DelegatedKeyParams } from '../../delegatedKeys';

export type VaultType = 'fixedIncomeVaultV1' | 'profitShareVaultV1';

/**
 * @hidden
 */
export interface KatanaPerpsVaultDeposit {
  /**
   * Exchange-assigned deposit identifier
   */
  depositId: string;
  /**
   * Depositor address
   */
  wallet: string;
  /**
   * Quantity of the deposit
   */
  quantity: string;
  /**
   * Timestamp of crediting the deposited funds on the exchange
   */
  time: number;
}

/**
 * @hidden
 */
export interface KatanaPerpsVaultWithdrawal {
  /**
   * Exchange-assigned withdrawal identifier
   */
  withdrawalId: string;
  /**
   * Depositor address
   */
  wallet: string;
  /**
   * Quantity of the withdrawal
   */
  quantity: string;
  /**
   * Timestamp of withdrawal API request
   */
  time: number;
  /**
   * Timestamp of withdrawal application
   */
  processedTime: number;
}

/*
 * Get vaults
 */

/**
 * @hidden
 */
export interface RestRequestGetVaults {
  /**
   * Manager wallet address, returns all vaults if not specified
   */
  manager?: string;
}

/**
 * @hidden
 */
export interface KatanaPerpsVault {
  type: VaultType;
  /**
   * Address of the managed account provider contract
   */
  provider: string;
  /**
   * Manager wallet address
   */
  manager: string;
  /**
   * true if a new configuration is awaiting application
   */
  pendingConfiguration: boolean;
  /**
   * Days since vault creation
   */
  age: number;
  /**
   * Manager-defined name
   */
  name: string;
  /**
   * Manager-provided description
   */
  description: string;
  /**
   * X display name
   */
  managerXName: string;
  /**
   * X @ handle
   */
  managerXUsername: string;
  /**
   * X profile image URL
   */
  managerXProfileImageUrl: string;
  /**
   * Total vault APY in decimal notation with 8 decimals.
   * For example, `1.00%` is expressed as `0.01000000`.
   */
  apy: string;
  /**
   * Vault fixed APY in decimal notation with 8 decimals.
   * For example, `1.00%` is expressed as `0.01000000`.
   */
  apyFixed: string;
  /**
   * Vault farm APY in decimal notation with 8 decimals.
   * For example, `1.00%` is expressed as `0.01000000`.
   */
  apyFarm: string | null;
  /**
   * Vault TVL
   */
  tvl: string;
  /**
   * Total account value / depositor obligations
   */
  collateralization: string;
}

/**
 * @hidden
 */
export type RestResponseGetVaults = {
  /**
   * Exchange-wide vault TVL
   */
  tvl: string;
  vaults: KatanaPerpsVault[];
};

/*
 * Get vault depositors
 */

/**
 * @hidden
 */
export interface RestRequestGetVaultDepositors {
  /**
   * Manager wallet address
   */
  manager: string;
}

/**
 * @hidden
 */
export interface KatanaPerpsVaultDepositor {
  /**
   * Depositor address
   */
  wallet: string;
  /**
   * Timestamp of the most recent zero to non-zero balance change
   */
  firstDepositTime: number;
}

/**
 * @hidden
 */
export type RestResponseGetVaultDepositors = KatanaPerpsVaultDepositor[];

/*
 * Get vault balance history
 */

/**
 * @hidden
 */
export interface RestRequestGetVaultBalanceHistory {
  /**
   * Manager wallet address
   */
  manager: string;
}

/**
 * @hidden
 */
export type RestResponseGetVaultBalanceHistory = {
  cursor?: string | null;
  count: number;
  items: (KatanaPerpsVaultDeposit | KatanaPerpsVaultWithdrawal)[];
};

/*
 * Get vault depositor balance history
 */

/**
 * @hidden
 */
export interface RestRequestGetVaultDepositorBalanceHistory {
  /**
   * Manager wallet address
   */
  manager: string;
  /**
   * Contributor wallet address, may be depositor or manager
   */
  depositor: string;
}

/**
 * @hidden
 */
export type RestResponseGetVaultDepositorBalanceHistory = {
  cursor?: string | null;
  count: number;
  items: (KatanaPerpsDeposit | KatanaPerpsWithdrawal)[];
};

/*
 * Get vault farm earnings
 */

/**
 * @hidden
 */
export interface RestRequestGetVaultFarmEarnings {
  /**
   * Manager wallet address
   */
  manager: string;
  /**
   * Depositor wallet address
   */
  depositor: string;
}

/**
 * @hidden
 */
export type RestResponseGetVaultFarmEarnings = {
  /**
   * Earned token quantity
   */
  quantity: string;
};

/*
 * Set vault details
 */

/**
 * @hidden
 */
export interface RestRequestSetVaultDetails
  extends Required<RestRequestByWallet>,
    DelegatedKeyParams {
  /**
   * Max 30 characters
   * @see VAULT_NAME_CHARACTER_LIMIT
   */
  name: string;
  /**
   * Max 2,000 characters
   * @see VAULT_DESCRIPTION_CHARACTER_LIMIT
   */
  description: string;
}

/**
 * @hidden
 */
export interface RestResponseSetVaultDetails {
  name: string;
  description: string;
}

/**
 * @hidden
 */
export type RestRequestSetVaultDetailsSigned =
  RestRequestWithSignature<RestRequestSetVaultDetails>;

/*
 * X (Twitter) Connection Management for Vaults
 */

/**
 * @hidden
 */
export interface RestRequestGetVaultXConnectionChallenge
  extends Required<RestRequestByWallet> {
  manager: string;
}

/**
 * @hidden
 */
export interface RestResponseGetVaultXConnectionChallenge {
  challenge: string;
}

/**
 * @hidden
 */
export interface RestRequestSetVaultXConnection
  extends Required<RestRequestByWallet> {
  code: string;
  manager: string;
}

/**
 * @hidden
 */
export interface RestRequestRemoveVaultXConnection
  extends Required<RestRequestByWallet> {
  manager: string;
}

/**
 * @hidden
 */
export interface RestRequestFarmPayout extends Required<RestRequestByWallet> {
  program: PayoutProgram;
  managedAccount: string;
}

/**
 * @hidden
 */
export interface RestResponseFarmPayout {
  assetAddress: string;
  assetSymbol: string;
  txHash: string;
}

/**
 * @hidden
 */
export interface RestRequestGetKatanaPoints
  extends RestRequestByWalletOptional {}

/**
 * @hidden
 */
export type KatanaPointsPeriod = {
  startsAt: number;
  endsAt: number;
  reviewEndsAt: number;
  points?: string | null;
  isWalletEligible?: boolean;
};

/**
 * @hidden
 */
export const PointsProgramRank = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
  platinum: 'platinum',
  diamond: 'diamond',
  unranked: 'unranked',
} as const;

/**
 * @hidden
 */
export type PointsProgramRank =
  (typeof PointsProgramRank)[keyof typeof PointsProgramRank];

/**
 * @hidden
 */
export interface RestResponseGetKatanaPoints {
  currentPeriodWeek: number;
  currentPeriodEndsAt: number;
  pastPeriods: KatanaPointsPeriod[];
  isWalletEligible: boolean;
  walletRank: PointsProgramRank;
  walletTotalRewards: string;
}
