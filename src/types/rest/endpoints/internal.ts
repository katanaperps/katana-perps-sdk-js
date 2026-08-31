import type {
  DepositSource,
  PayoutProgram,
  RestRequestByWallet,
  RestRequestByWalletOptional,
} from '#index';
import type { RestRequestWithSignature } from '#types/utils';
import type { KatanaPerpsDeposit } from './GetDeposits';
import type { KatanaPerpsFill } from './GetFills';
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
   * Source of the deposit
   */
  bridgeSource: DepositSource;
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
   * Address of the state aggregator contract of the vault's provider
   * instance; null for provider types without one
   */
  stateAggregator: string | null;
  /**
   * Manager wallet address
   */
  manager: string;
  /**
   * Timestamp at which the vault was exited on-chain; null if not exited
   */
  exitedTime: number | null;
  /**
   * Timestamp at which the vault manager wallet was liquidated; null if not
   * liquidated
   */
  liquidatedTime: number | null;
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

/*
 * Taker Competition V3
 */

/**
 * @hidden
 */
export interface RestRequestGetTakerCompetitionV3ByName
  extends RestRequestByWalletOptional {
  name: string;
}

/**
 * @hidden
 */
export interface RestRequestGetTakerCompetitionV3List {}

/**
 * @hidden
 */
export interface RestRequestRegisterTakerCompetitionV3 {
  name: string;
  wallet: string;
}

/**
 * @hidden
 */
export interface RestRequestSetTakerCompetitionV3DisplayName
  extends RestRequestRegisterTakerCompetitionV3 {
  displayName: string;
}

/**
 * @hidden
 */
export interface RestRequestGetTakerCompetitionV3Payout {
  wallet: string;
  program: PayoutProgram;
}

/**
 * @hidden
 */
export type RestRequestAuthorizeTakerCompetitionV3Payout =
  RestRequestGetTakerCompetitionV3Payout;

/**
 * @hidden
 */
export interface KatanaPerpsTakerCompetitionV3Summary {
  name: string;
  startsAt: number;
  endsAt: number;
  reviewEndsAt: number;
  escrowContractAddress: string | null;
}

/**
 * @hidden
 */
export interface KatanaPerpsTakerCompetitionV3MilestoneCompetition {
  name: string;
  startsAt: number;
  endsAt: number;
  reviewEndsAt: number;
  escrowContractAddress: string | null;
  totalRewardQuantity: string;
  walletCount: number;
  pnlRewardPool: string;
  pnlMaxWinners: number;
  volumeRewardPool: string;
  totalVolume: string;
  qualifyingVolume: string;
  milestoneTiers: ReadonlyArray<{
    thresholdVolumeUsd: string;
    poolRewardQuantity: string;
  }>;
}

/**
 * @hidden
 */

export interface KatanaPerpsTakerCompetitionV3PnLLeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  pnl: string;
  pnlPercent: string;
  volume: string;
  rewardQuantity: string;
}

/**
 * @hidden
 */

export interface KatanaPerpsTakerCompetitionV3VolumeLeaderboardEntry
  extends KatanaPerpsTakerCompetitionV3PnLLeaderboardEntry {}

/**
 * @hidden
 */

interface KatanaPerpsTakerCompetitionV3WalletBase {
  readonly isRegistered: boolean;
  readonly isBlacklisted: boolean;
  readonly hasSufficientEquity: boolean;
}

/**
 * @hidden
 */

export type KatanaPerpsTakerCompetitionV3WalletRegistered =
  KatanaPerpsTakerCompetitionV3WalletBase & {
    readonly isRegistered: true;
    readonly hasSufficientEquity: true;
    readonly address: string;
    readonly displayName: string;
    readonly pnl: string;
    readonly pnlPercent: string;
    readonly volume: string;
    readonly qualifiedVolume: string;
    readonly pnlRank: number | null;
    readonly volumeRank: number | null;
    readonly volumeRewardQuantity: string | null;
  };

/**
 * @hidden
 */

export type KatanaPerpsTakerCompetitionV3WalletUnregistered =
  KatanaPerpsTakerCompetitionV3WalletBase & {
    isRegistered: false;
  };

/**
 * @hidden
 */

export type KatanaPerpsTakerCompetitionV3Wallet =
  | KatanaPerpsTakerCompetitionV3WalletRegistered
  | KatanaPerpsTakerCompetitionV3WalletUnregistered;

/**
 * @hidden
 */
export interface RestResponseGetTakerCompetitionV3ByName {
  competition: KatanaPerpsTakerCompetitionV3MilestoneCompetition;
  pnlLeaderboard: KatanaPerpsTakerCompetitionV3PnLLeaderboardEntry[];
  volumeLeaderboard: KatanaPerpsTakerCompetitionV3VolumeLeaderboardEntry[];
  wallet: KatanaPerpsTakerCompetitionV3Wallet | null;
}

/**
 * @hidden
 */
export interface RestResponseGetTakerCompetitionV3List {
  competitions: KatanaPerpsTakerCompetitionV3Summary[];
}

/**
 * @hidden
 */
export type RestResponseRegisterTakerCompetitionV3 = Record<string, never>;

/**
 * @hidden
 */
export type RestResponseSetTakerCompetitionV3DisplayName = Record<
  string,
  never
>;

/**
 * @hidden
 */
export interface RestResponseGetTakerCompetitionV3Payout {
  assetAddress: string;
  assetSymbol: string;
  payoutWalletAddress: string;
  quantityEarned: string;
  quantityPaid: string;
  quantityOwed: string;
}

/**
 * @hidden
 */
export interface RestResponseAuthorizeTakerCompetitionV3Payout {
  assetAddress: string;
  assetSymbol: string;
  txHash: string;
}

/**
 * @hidden
 */
export interface RestRequestGetKatanaPoints
  extends RestRequestByWalletOptional {
  seasonId?: number;
}

/**
 * @hidden
 */
export type KatanaPointsPeriod = {
  sequence: number;
  startsAt: number;
  endsAt: number;
  reviewEndsAt: number;
  points?: string | null;
  isWalletEligible?: boolean;
  walletRank?: PointsProgramRank;
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
  currentSeasonId: number;
  currentSeasonEndsAt: number;
  currentPeriodWeek: number;
  currentPeriodEndsAt: number;
  pastPeriods: KatanaPointsPeriod[];
  isWalletEligible: boolean;
  walletRank: PointsProgramRank;
  walletTotalRewards: string;
  vbUsdcRewards: string | null;
  katRewards: string | null;
}

/**
 * @hidden
 */
export interface RestRequestGetKatanaPointSeasons {}

/**
 * @hidden
 */
export type RestResponseGetKatanaPointSeasons = Array<{
  seasonId: number;
  isCurrent: boolean;
  isPending: boolean;
  periods: Array<{
    id: number;
    sequence: number;
    startsAt: number;
    endsAt: number;
    reviewEndsAt: number;
  }>;
}>;

/*
 * Builder Rewards
 */

/**
 * @hidden
 */
export interface RestRequestGetBuilderRewards {
  wallet: string;
}

/**
 * @hidden
 */
export interface RestResponseGetBuilderRewards {
  /**
   * Builder code (`B:[A-Za-z0-9]{8}`) when the wallet is registered as a builder
   */
  code?: string;
  makerFeeRate: string;
  takerFeeRate: string;
  program: 'builderRewards';
  assetAddress: string;
  assetSymbol: string;
  quantityEarned: string;
  quantityPaid: string;
  quantityOwed: string;
}

/**
 * @hidden
 */
export interface RestRequestGetBuilderRewardsFills {
  wallet: string;
}

/**
 * @hidden
 */
export interface BuilderRewardFill extends KatanaPerpsFill {
  /**
   * Builder fee earned by the requesting builder wallet on this fill
   */
  builderFee: string;
  /**
   * Which trade side(s) generated the builder fee
   */
  builderFeeSide: 'maker' | 'taker' | 'both';
}

/**
 * @hidden
 */
export interface RestResponseGetBuilderRewardsFills {
  fills: BuilderRewardFill[];
}

/**
 * @hidden
 */
export interface RestRequestGetBuilderRewardsDailyFees {
  wallet: string;
}

/**
 * @hidden
 */
export interface BuilderRewardDailyFeesRow {
  /**
   * Inclusive UTC day range start, in milliseconds
   */
  startsAt: number;
  /**
   * Inclusive UTC day range end, in milliseconds
   */
  endsAt: number;
  builderFees: string;
  uniqueWallets: number;
}

/**
 * @hidden
 */
export interface RestResponseGetBuilderRewardsDailyFees {
  dailyFees: BuilderRewardDailyFeesRow[];
}
