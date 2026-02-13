import BigNumber from 'bignumber.js';
import { ethers, type TransactionRequest } from 'ethers';

import { multiplyPips } from '#pipmath';

import { BridgeConfig } from '#bridge/config';
import {
  IOFT__factory,
  IVaultComposerSync__factory,
  ExchangeLocalDepositAdapter_v1__factory,
} from '#typechain-types/index';
import { BridgeTarget } from '#types/enums/request';

import {
  getBridgeTargetConfig,
  loadExchangeLayerZeroAddressFromApiIfNeeded,
  loadExchangeLocalDepositAddressFromApiIfNeeded,
  loadStargateBridgeForwarderContractAddressFromApiIfNeeded,
} from './utils';

import type { Expand } from '../types/utils';

export enum DepositBridgeAdapterPayloadType {
  addManagedAccount,
  depositToManagedAccount,
  depositToWallet,
}

export type AddManagedAccountBridgePayloadParameters = {
  fixedIncomeVaultProviderAddress: string;
  managerWallet: string;
  addManagedAccountPayload: string; // encoded using getEncodedFixedIncomeVaultConfigurationFields
};

export type DepositToManagedAccountBridgePayloadParameters = {
  depositorWallet: string;
  fixedIncomeVaultProviderAddress: string;
  managerWallet: string;
};

export type DepositToWalletBridgePayloadParameters = {
  depositorWallet: string;
};

export type DepositBaseParameters = {
  exchangeLayerZeroAdapterAddress?: string;
  exchangeLocalDepositAdapterAddress?: string;
  minimumForwardQuantityMultiplierInPips: bigint;
  quantityInAssetUnits: bigint;
  sourceBridgeTarget: BridgeTarget;
  stargateBridgeForwarderContractAddress?: string;
  bridgePayloadType: DepositBridgeAdapterPayloadType;
};

export type AddManagedAccountParameters = Expand<
  DepositBaseParameters & {
    bridgePayloadType: DepositBridgeAdapterPayloadType.addManagedAccount;
  } & AddManagedAccountBridgePayloadParameters
>;

export type DepositToManagedAccountParameters = Expand<
  DepositBaseParameters & {
    bridgePayloadType: DepositBridgeAdapterPayloadType.depositToManagedAccount;
  } & DepositToManagedAccountBridgePayloadParameters
>;

export type DepositToWalletParameters = Expand<
  DepositBaseParameters & {
    bridgePayloadType: DepositBridgeAdapterPayloadType.depositToWallet;
  } & DepositToWalletBridgePayloadParameters
>;

/**
 * Encoded withdrawal bridge payload
 */
export type EncodedDepositBridgeAdapterPayload = string;

export type FixedIncomeVaultConfigurationFields = {
  managerWallet: string;
  effectiveTimestampInS: number;
  interestMultiplierInPips: bigint;
  maximumNetDepositsInPips: bigint;
  maximumTotalOwedQuantityAvailableForExitWithdrawalMultiplierNeededToInitiateExitInPips: bigint;
  minimumTotalOwedQuantityAvailableForExitWithdrawalMultiplierToAllowManagerWalletWithdrawalInPips: bigint;
  minimumUnappliedWithdrawalAgeInSNeededToInitiateExit: number;
  withdrawalLimitPercentForDepositorsInPips: bigint;
  withdrawalLimitPercentForVaultInPips: bigint;
};

export const fixedIncomeVaultConfigurationFieldsLength =
  32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32; // tuple header + address + uint64 + uint64 + uint64 + uint64 + uint64 + uint64 + uint64 + uint64

export const depositBridgeAdapterPayloadLengths = {
  [DepositBridgeAdapterPayloadType.addManagedAccount]:
    32 + 32 + 32 + 32 + 32 + 32 + fixedIncomeVaultConfigurationFieldsLength, // uint8 + tuple header + uint32 + address + address + bytes length + bytes
  [DepositBridgeAdapterPayloadType.depositToManagedAccount]:
    32 + 32 + 32 + 32 + 32 + 32 + 32 + 32, // uint8 + tuple header + uint32 + address + address + address + bytes length + bytes
  [DepositBridgeAdapterPayloadType.depositToWallet]: 32 + 32 + 32, // uint8 + uint32 + address
};

export function decodeDepositBridgeAdapterPayloadType(
  payload: EncodedDepositBridgeAdapterPayload,
) {
  return parseInt(
    ethers.AbiCoder.defaultAbiCoder().decode(['uint8'], payload)[0],
    10,
  );
}

export function decodeDepositBridgeAdapterPayload(
  payload: EncodedDepositBridgeAdapterPayload,
) {
  const bridgePayloadType = decodeDepositBridgeAdapterPayloadType(payload);

  if (bridgePayloadType === DepositBridgeAdapterPayloadType.addManagedAccount) {
    const [
      ,
      [
        sourceEndpointId,
        managedAccountProvider,
        managerWallet,
        addManagedAccountPayload,
        depositPayload,
      ],
    ] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['uint8', 'tuple(uint32,address,address,bytes,bytes)'],
      payload,
    );

    return {
      bridgePayloadType,
      sourceEndpointId,
      managedAccountProvider,
      managerWallet,
      addManagedAccountPayload,
      depositPayload,
    };
  }

  if (
    bridgePayloadType ===
    DepositBridgeAdapterPayloadType.depositToManagedAccount
  ) {
    const [
      ,
      [
        sourceEndpointId,
        depositorWallet,
        managedAccountProvider,
        managerWallet,
        depositPayload,
      ],
    ] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['uint8', 'tuple(uint32,address,address,address,bytes)'],
      payload,
    );

    return {
      bridgePayloadType,
      sourceEndpointId,
      depositorWallet,
      managedAccountProvider,
      managerWallet,
      depositPayload,
    };
  }

  if (bridgePayloadType === DepositBridgeAdapterPayloadType.depositToWallet) {
    const [, [sourceEndpointId, depositorWallet]] =
      ethers.AbiCoder.defaultAbiCoder().decode(
        ['uint8', 'tuple(uint32,address)'],
        payload,
      );

    return {
      bridgePayloadType,
      sourceEndpointId,
      depositorWallet,
    };
  }

  return undefined;
}

/**
 * Deposit funds cross-chain into the Exchange using a LayerZero OFT or Stargate
 */
export async function depositViaBridge(
  parameters:
    | AddManagedAccountParameters
    | DepositToManagedAccountParameters
    | DepositToWalletParameters,
  providers: {
    // If the source chain is Ethereum then both these params should be for
    // the same provider
    ethereum: ethers.Provider;
    sourceChain: ethers.Provider;
  },
  sourceSigner: ethers.Signer,
  sandbox: boolean,
  extraRequestParams?: Pick<TransactionRequest, 'nonce'>,
  /** Let software wallet show estimate to the user. Even on expected TX failure. */
  ignoreEstimateError?: boolean,
): Promise<string> {
  return parameters.sourceBridgeTarget === BridgeTarget.STARGATE_ETHEREUM ?
      depositViaVaultComposerSync(
        parameters,
        providers,
        sourceSigner,
        sandbox,
        extraRequestParams,
        ignoreEstimateError,
      )
    : depositViaForwarder(
        parameters,
        providers,
        sourceSigner,
        sandbox,
        extraRequestParams,
        ignoreEstimateError,
      );
}

/**
 * Deposit funds cross-chain into the Exchange using a LayerZero OFT or Stargate
 */
export async function depositViaVaultComposerSync(
  parameters:
    | AddManagedAccountParameters
    | DepositToManagedAccountParameters
    | DepositToWalletParameters,
  providers: {
    // If the source chain is Ethereum then both these params should be for
    // the same provider
    ethereum: ethers.Provider;
    sourceChain: ethers.Provider;
  },
  sourceSigner: ethers.Signer,
  sandbox: boolean,
  extraRequestParams?: Pick<TransactionRequest, 'nonce'>,
  /** Let software wallet show estimate to the user. Even on expected TX failure. */
  ignoreEstimateError?: boolean,
): Promise<string> {
  const [{ sendParam, sourceConfig }, { gasFee }] = await Promise.all([
    getDepositFromEthereumSendParamAndSourceConfig(parameters, sandbox),
    estimateDepositFromEthereumFees(parameters, providers, sandbox),
  ]);

  let gasLimit: number = BridgeConfig.settings.depositSourceChainGasLimit;
  const vaultComposerSync = IVaultComposerSync__factory.connect(
    sourceConfig.layerZeroVaultComposerSyncAddress,
    sourceSigner,
  );
  const sourceWallet = await sourceSigner.getAddress();

  try {
    // Estimate gas
    const estimatedGasLimit =
      await vaultComposerSync.depositAndSend.estimateGas(
        parameters.quantityInAssetUnits,
        sendParam,
        sourceWallet, // Refund address - extra gas (if any) is returned to this address
        {
          ...extraRequestParams,
          from: sourceWallet,
          // Native gas to pay for the cross chain message fee
          value: gasFee,
        },
      );
    // Add 20% buffer for safety
    gasLimit = Number(
      new BigNumber(estimatedGasLimit.toString())
        .times(new BigNumber(1.2))
        .toFixed(0),
    );
  } catch (error) {
    // ethers.js will perform the estimation at the block gas limit, which is much higher than the
    // gas actually needed by the tx. If the wallet does not have the funds to cover the tx at this
    // high gas limit then the RPC will throw an INSUFFICIENT_FUNDS error; however the wallet may
    // still have enough funds to successfully bridge at the actual gas limit. In this case simply
    // fall through and use the configured default gas limit. The wallet software in use should
    // still show if that limit is insufficient, which is only an issue for blockchains with
    // variable gas costs such as Arbitrum One
    if (error?.code === 'INSUFFICIENT_FUNDS') {
      console.log(
        '[depositViaVaultComposerSync] Insufficient funds - continue with default gas',
      );
    } else if (ignoreEstimateError) {
      // TODO: In latest contract it throws 'CALL_EXCEPTION' instead of 'INSUFFICIENT_FUNDS'
      console.log(
        '[depositViaVaultComposerSync] Estimate failed - continue with default gas',
        error,
      );
    } else {
      throw error;
    }
  }

  const response = await vaultComposerSync.depositAndSend.send(
    parameters.quantityInAssetUnits,
    sendParam,
    sourceWallet, // Refund address - extra gas (if any) is returned to this address
    {
      ...extraRequestParams,
      from: sourceWallet,
      gasLimit,
      value: gasFee, // Native gas to pay for the cross chain message fee
    },
  );

  return response.hash;
}

/**
 * Deposit funds cross-chain into the Exchange using a LayerZero OFT or Stargate
 */
export async function depositViaForwarder(
  parameters:
    | AddManagedAccountParameters
    | DepositToManagedAccountParameters
    | DepositToWalletParameters,
  providers: {
    // If the source chain is Ethereum then both these params should be for
    // the same provider
    ethereum: ethers.Provider;
    sourceChain: ethers.Provider;
  },
  sourceSigner: ethers.Signer,
  sandbox: boolean,
  extraRequestParams?: Pick<TransactionRequest, 'nonce'>,
  /** Let software wallet show estimate to the user. Even on expected TX failure. */
  ignoreEstimateError?: boolean,
): Promise<string> {
  const [{ sendParam, sourceConfig }, { gasFee }] = await Promise.all([
    getDepositViaForwarderSendParamAndSourceConfig(
      parameters,
      providers,
      sandbox,
    ),
    estimateDepositViaForwarderFees(parameters, providers, sandbox),
  ]);

  let gasLimit: number = BridgeConfig.settings.depositSourceChainGasLimit;
  const oft = IOFT__factory.connect(
    sourceConfig.layerzeroOFTAddress,
    sourceSigner,
  );
  const sourceWallet = await sourceSigner.getAddress();

  try {
    // Estimate gas
    const estimatedGasLimit = await oft.send.estimateGas(
      sendParam,
      { nativeFee: gasFee, lzTokenFee: 0 },
      sourceWallet, // Refund address - extra gas (if any) is returned to this address
      {
        ...extraRequestParams,
        from: sourceWallet, // Native gas to pay for the cross chain message fee
        value: gasFee,
      },
    );
    // Add 20% buffer for safety
    gasLimit = Number(
      new BigNumber(estimatedGasLimit.toString())
        .times(new BigNumber(1.2))
        .toFixed(0),
    );
  } catch (error) {
    // ethers.js will perform the estimation at the block gas limit, which is much higher than the
    // gas actually needed by the tx. If the wallet does not have the funds to cover the tx at this
    // high gas limit then the RPC will throw an INSUFFICIENT_FUNDS error; however the wallet may
    // still have enough funds to successfully bridge at the actual gas limit. In this case simply
    // fall through and use the configured default gas limit. The wallet software in use should
    // still show if that limit is insufficient, which is only an issue for blockchains with
    // variable gas costs such as Arbitrum One
    if (error?.code === 'INSUFFICIENT_FUNDS') {
      console.log(
        '[depositViaForwarder] Insufficient funds - continue with default gas',
      );
    } else if (ignoreEstimateError) {
      // TODO: In latest contract it throws 'CALL_EXCEPTION' instead of 'INSUFFICIENT_FUNDS'
      console.log(
        '[depositViaForwarder] Estimate failed - continue with default gas',
        error,
      );
    } else {
      throw error;
    }
  }

  const response = await oft.send(
    sendParam,
    { nativeFee: gasFee, lzTokenFee: 0 },
    sourceWallet, // Refund address - extra gas (if any) is returned to this address
    {
      ...extraRequestParams,
      from: sourceWallet,
      gasLimit,
      value: gasFee,
    }, // Native gas to pay for the cross chain message fee
  );

  return response.hash;
}

/**
 * Deposit funds locally on Katana
 */
export async function depositLocally(
  parameters:
    | AddManagedAccountParameters
    | DepositToManagedAccountParameters
    | DepositToWalletParameters,
  signer: ethers.Signer,
  sandbox: boolean,
  extraRequestParams?: Pick<TransactionRequest, 'nonce'>,
  /** Let software wallet show estimate to the user. Even on expected TX failure. */
  ignoreEstimateError?: boolean,
): Promise<string> {
  const sourceConfig = getBridgeTargetConfig(
    BridgeTarget.KATANA_KATANA,
    sandbox,
  );
  const exchangeLocalDepositAdapterAddress =
    await loadExchangeLocalDepositAddressFromApiIfNeeded(
      parameters.exchangeLocalDepositAdapterAddress,
    );

  let gasLimit: number = BridgeConfig.settings.depositSourceChainGasLimit;
  const localDepositAdapter = ExchangeLocalDepositAdapter_v1__factory.connect(
    exchangeLocalDepositAdapterAddress,
    signer,
  );
  const wallet = await signer.getAddress();

  try {
    // Estimate gas
    const estimatedGasLimit = await localDepositAdapter.deposit.estimateGas(
      parameters.quantityInAssetUnits,
      encodeDepositBridgeAdapterPayload(sourceConfig, parameters),
      {
        ...extraRequestParams,
        from: wallet,
      },
    );
    // Add 20% buffer for safety
    gasLimit = Number(
      new BigNumber(estimatedGasLimit.toString())
        .times(new BigNumber(1.2))
        .toFixed(0),
    );
  } catch (error) {
    // ethers.js will perform the estimation at the block gas limit, which is much higher than the
    // gas actually needed by the tx. If the wallet does not have the funds to cover the tx at this
    // high gas limit then the RPC will throw an INSUFFICIENT_FUNDS error; however the wallet may
    // still have enough funds to successfully bridge at the actual gas limit. In this case simply
    // fall through and use the configured default gas limit. The wallet software in use should
    // still show if that limit is insufficient, which is only an issue for blockchains with
    // variable gas costs such as Arbitrum One
    if (error?.code === 'INSUFFICIENT_FUNDS') {
      console.log(
        '[depositViaForwarder] Insufficient funds - continue with default gas',
      );
    } else if (ignoreEstimateError) {
      // TODO: In latest contract it throws 'CALL_EXCEPTION' instead of 'INSUFFICIENT_FUNDS'
      console.log(
        '[depositViaForwarder] Estimate failed - continue with default gas',
        error,
      );
    } else {
      throw error;
    }
  }

  const response = await localDepositAdapter.deposit(
    parameters.quantityInAssetUnits,
    encodeDepositBridgeAdapterPayload(sourceConfig, parameters),
    {
      ...extraRequestParams,
      gasLimit,
      from: wallet,
    },
  );

  return response.hash;
}

export function encodeDepositBridgeAdapterPayload(
  sourceConfig: ReturnType<typeof getBridgeTargetConfig>,
  parameters:
    | Pick<
        AddManagedAccountParameters,
        | 'bridgePayloadType'
        | 'fixedIncomeVaultProviderAddress'
        | 'managerWallet'
        | 'addManagedAccountPayload'
      >
    | Pick<
        DepositToManagedAccountParameters,
        | 'bridgePayloadType'
        | 'depositorWallet'
        | 'fixedIncomeVaultProviderAddress'
        | 'managerWallet'
      >
    | Pick<DepositToWalletParameters, 'bridgePayloadType' | 'depositorWallet'>,
): EncodedDepositBridgeAdapterPayload {
  if (
    parameters.bridgePayloadType ===
    DepositBridgeAdapterPayloadType.addManagedAccount
  ) {
    return ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint8', 'tuple(uint32,address,address,bytes,bytes)'],
      [
        DepositBridgeAdapterPayloadType.addManagedAccount,
        [
          sourceConfig.layerZeroEndpointId,
          parameters.fixedIncomeVaultProviderAddress,
          parameters.managerWallet,
          parameters.addManagedAccountPayload,
          '0x',
        ],
      ],
    );
  }

  if (
    parameters.bridgePayloadType ===
    DepositBridgeAdapterPayloadType.depositToManagedAccount
  ) {
    return ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint8', 'tuple(uint32,address,address,address,bytes)'],
      [
        DepositBridgeAdapterPayloadType.depositToManagedAccount,
        [
          sourceConfig.layerZeroEndpointId,
          parameters.depositorWallet,
          parameters.fixedIncomeVaultProviderAddress,
          parameters.managerWallet,
          '0x', // depositPayload
        ],
      ],
    );
  }

  if (
    parameters.bridgePayloadType ===
    DepositBridgeAdapterPayloadType.depositToWallet
  ) {
    return ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint8', 'tuple(uint32,address)'],
      [
        DepositBridgeAdapterPayloadType.depositToWallet,
        [sourceConfig.layerZeroEndpointId, parameters.depositorWallet],
      ],
    );
  }

  throw new Error(
    `Invalid bridge payload type ${(parameters as { bridgePayloadType: number }).bridgePayloadType}`,
  );
}

export function encodeFixedIncomeVaultConfigurationFields(
  configurationFields: FixedIncomeVaultConfigurationFields,
) {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['tuple(address,uint64,uint64,uint64,uint64,uint64,uint64,uint64,uint64)'],
    [
      [
        configurationFields.managerWallet,
        configurationFields.effectiveTimestampInS,
        configurationFields.interestMultiplierInPips,
        configurationFields.maximumNetDepositsInPips,
        configurationFields.maximumTotalOwedQuantityAvailableForExitWithdrawalMultiplierNeededToInitiateExitInPips,
        configurationFields.minimumTotalOwedQuantityAvailableForExitWithdrawalMultiplierToAllowManagerWalletWithdrawalInPips,
        configurationFields.minimumUnappliedWithdrawalAgeInSNeededToInitiateExit,
        configurationFields.withdrawalLimitPercentForDepositorsInPips,
        configurationFields.withdrawalLimitPercentForVaultInPips,
      ],
    ],
  );
}

/**
 * Estimate native gas fee needed to deposit USDC cross-chain into the Exchange
 */
export async function estimateDepositFees(
  parameters:
    | AddManagedAccountParameters
    | DepositToManagedAccountParameters
    | DepositToWalletParameters,
  providers: {
    // If the source chain is Ethereum then both these params should be for
    // the same provider
    ethereum: ethers.Provider;
    sourceChain: ethers.Provider;
  },
  sandbox: boolean,
): Promise<{
  gasFee: bigint;
  quantityDeliveredInAssetUnits: bigint;
}> {
  if (parameters.sourceBridgeTarget === BridgeTarget.STARGATE_ETHEREUM) {
    return estimateDepositFromEthereumFees(parameters, providers, sandbox);
  }

  return estimateDepositViaForwarderFees(parameters, providers, sandbox);
}

export function getDestinationWallet(
  parameters:
    | AddManagedAccountParameters
    | DepositToManagedAccountParameters
    | DepositToWalletParameters,
) {
  if (
    parameters.bridgePayloadType ===
    DepositBridgeAdapterPayloadType.addManagedAccount
  ) {
    return parameters.managerWallet;
  }

  if (
    parameters.bridgePayloadType ===
      DepositBridgeAdapterPayloadType.depositToManagedAccount ||
    parameters.bridgePayloadType ===
      DepositBridgeAdapterPayloadType.depositToWallet
  ) {
    return parameters.depositorWallet;
  }

  throw new Error(
    `Invalid bridge payload type ${(parameters as { bridgePayloadType: number }).bridgePayloadType}`,
  );
}

/**
 * Estimate native gas fee needed to deposit USDC cross-chain into the Exchange
 * from Ethereum using the OFT pathway
 */
async function estimateDepositFromEthereumFees(
  parameters:
    | AddManagedAccountParameters
    | DepositToManagedAccountParameters
    | DepositToWalletParameters,
  providers: {
    ethereum: ethers.Provider;
  },
  sandbox: boolean,
): Promise<{
  gasFee: bigint;
  quantityDeliveredInAssetUnits: bigint;
}> {
  const { sendParam, sourceConfig } =
    await getDepositFromEthereumSendParamAndSourceConfig(parameters, sandbox);

  const oft = IOFT__factory.connect(
    sourceConfig.layerzeroOFTAddress,
    providers.ethereum,
  );
  const [[gasFee], [, , receipt]] = await Promise.all([
    oft.quoteSend(sendParam, false, {
      from: getDestinationWallet(parameters),
    }),
    oft.quoteOFT(sendParam),
  ]);

  return {
    gasFee,
    quantityDeliveredInAssetUnits: receipt.amountReceivedLD,
  };
}

async function estimateDepositViaForwarderFees(
  parameters:
    | AddManagedAccountParameters
    | DepositToManagedAccountParameters
    | DepositToWalletParameters,
  providers: {
    ethereum: ethers.Provider;
    sourceChain: ethers.Provider;
  },
  sandbox: boolean,
): Promise<{
  gasFee: bigint;
  quantityDeliveredInAssetUnits: bigint;
}> {
  const { sendParam, sourceConfig } =
    await getDepositViaForwarderSendParamAndSourceConfig(
      parameters,
      providers,
      sandbox,
    );

  const ioft = IOFT__factory.connect(
    sourceConfig.layerzeroOFTAddress,
    providers.sourceChain,
  );
  const [{ nativeFee: gasFee }, [, , receipt]] = await Promise.all([
    ioft.quoteSend(sendParam, false, {
      from: getDestinationWallet(parameters),
    }),
    ioft.quoteOFT(sendParam),
  ]);

  // Once we obtain the quantity delivered after slippage to Ethereum, calculate
  // the quantity subsequently delivered to Katana after any additional slippage
  const { quantityDeliveredInAssetUnits } =
    await estimateDepositFromEthereumFees(
      { ...parameters, quantityInAssetUnits: receipt.amountReceivedLD },
      providers,
      sandbox,
    );

  return {
    gasFee,
    quantityDeliveredInAssetUnits,
  };
}

async function getDepositFromEthereumSendParamAndSourceConfig(
  parameters:
    | AddManagedAccountParameters
    | DepositToManagedAccountParameters
    | DepositToWalletParameters,
  sandbox: boolean,
) {
  const { sourceConfig, destinationConfig } = getSourceAndDestinationConfigs(
    BridgeTarget.STARGATE_ETHEREUM,
    BridgeTarget.KATANA_KATANA,
    sandbox,
  );

  const exchangeLayerZeroAdapterAddress =
    await loadExchangeLayerZeroAddressFromApiIfNeeded(
      parameters.exchangeLayerZeroAdapterAddress,
    );

  const { Options } = await import('@layerzerolabs/lz-v2-utilities');
  const extraOptions = Options.newOptions()
    .addExecutorComposeOption(
      0,
      (
        parameters.bridgePayloadType ===
          DepositBridgeAdapterPayloadType.addManagedAccount
      ) ?
        BridgeConfig.settings.addManagedAccountComposeGasLimit
      : BridgeConfig.settings.depositComposeGasLimit,
      0,
    )
    .toBytes();

  const sendParam = {
    dstEid: destinationConfig.layerZeroEndpointId, // Destination endpoint ID
    to: ethers.zeroPadValue(exchangeLayerZeroAdapterAddress, 32), // Recipient address
    amountLD: parameters.quantityInAssetUnits, // Amount to send in local decimals
    minAmountLD: multiplyPips(
      parameters.quantityInAssetUnits,
      parameters.minimumForwardQuantityMultiplierInPips,
    ), // Minimum amount to send in local decimals
    extraOptions,
    composeMsg: encodeDepositBridgeAdapterPayload(sourceConfig, parameters), // Additional options supplied by the caller to be used in the LayerZero message
    oftCmd: '0x', // The OFT command to be executed, unused in default OFT implementations
  };

  return {
    sendParam,
    sourceConfig:
      sourceConfig as (typeof BridgeConfig.mainnet)['stargate.ethereum'],
  };
}

async function getDepositViaForwarderSendParamAndSourceConfig(
  parameters:
    | AddManagedAccountParameters
    | DepositToManagedAccountParameters
    | DepositToWalletParameters,
  providers: {
    ethereum: ethers.Provider;
  },
  sandbox: boolean,
) {
  const { sourceConfig, destinationConfig: ethereumConfig } =
    getSourceAndDestinationConfigs(
      parameters.sourceBridgeTarget,
      BridgeTarget.STARGATE_ETHEREUM,
      sandbox,
    );

  const { gasFee: ethereumGasFee } = await estimateDepositFromEthereumFees(
    parameters,
    providers,
    sandbox,
  );
  // Add 20% buffer for safety
  const additionalNativeDrop = new BigNumber(ethereumGasFee.toString())
    .times(new BigNumber(1.2))
    .toFixed(0);

  const stargateBridgeForwarderContractAddress =
    await loadStargateBridgeForwarderContractAddressFromApiIfNeeded(
      parameters.stargateBridgeForwarderContractAddress,
    );

  // FIXME CJS dynamic import
  const { Options } = await import('@layerzerolabs/lz-v2-utilities');
  const extraOptions = Options.newOptions()
    // Native drop is specified in ETH wei
    .addExecutorComposeOption(
      0,
      BridgeConfig.settings.stargateBridgeForwarderGasLimit,
      additionalNativeDrop,
    )
    .toHex();

  const sendParam = {
    dstEid: ethereumConfig.layerZeroEndpointId, // Destination endpoint ID
    to: ethers.zeroPadValue(stargateBridgeForwarderContractAddress, 32), // Recipient address
    amountLD: parameters.quantityInAssetUnits, // Amount to send in local decimals
    minAmountLD: multiplyPips(
      parameters.quantityInAssetUnits,
      parameters.minimumForwardQuantityMultiplierInPips,
    ), // Minimum amount to send in local decimals
    extraOptions,
    composeMsg: ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint8', 'tuple(address, bytes)'],
      [
        0, //  ComposeMessageType.DepositToKatana
        [
          getDestinationWallet(parameters),
          encodeDepositBridgeAdapterPayload(sourceConfig, parameters),
        ],
      ],
    ),
    oftCmd: '0x', // The OFT command to be executed, unused in default OFT implementations
  };

  return { sendParam, sourceConfig };
}

function getSourceAndDestinationConfigs(
  sourceTarget: BridgeTarget,
  destinationTarget: BridgeTarget,
  sandbox: boolean,
) {
  const sourceConfig = getBridgeTargetConfig(sourceTarget, sandbox);
  const destinationConfig = getBridgeTargetConfig(destinationTarget, sandbox);

  return { sourceConfig, destinationConfig };
}
