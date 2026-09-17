import {
  BridgeConfig,
  BridgeConfigByLayerZeroEndpointId,
} from '#bridge/config';
import { loadExchangeResponseFromApiIfNeeded } from '#client/rest/public';

import type { BridgeTarget } from '#types/enums/request';

export const BridgeMainnetLayerZeroEndpointIds = Object.values(
  BridgeConfigByLayerZeroEndpointId.mainnet,
).map((value) => {
  return value.layerZeroEndpointId;
});

export type BridgeLayerZeroEndpointIdsMainnet =
  (typeof BridgeMainnetLayerZeroEndpointIds)[number];

export function isBridgeMainnetLayerZeroEndpointId(
  layerZeroEndpointId: number,
): layerZeroEndpointId is BridgeLayerZeroEndpointIdsMainnet {
  return BridgeMainnetLayerZeroEndpointIds.includes(
    layerZeroEndpointId as BridgeLayerZeroEndpointIdsMainnet,
  );
}

export const BridgeTestnetLayerZeroEndpointIds = Object.values(
  BridgeConfigByLayerZeroEndpointId.testnet,
).map((value) => {
  return value.layerZeroEndpointId;
});

export type BridgeLayerZeroEndpointIdsTestnet =
  (typeof BridgeTestnetLayerZeroEndpointIds)[number];

export function isBridgeTestnetLayerZeroEndpointId(
  layerZeroEndpointId: number,
): layerZeroEndpointId is BridgeLayerZeroEndpointIdsTestnet {
  return BridgeTestnetLayerZeroEndpointIds.includes(
    layerZeroEndpointId as BridgeLayerZeroEndpointIdsTestnet,
  );
}

/**
 * Get a bridge config with strict typing to allow narrowing on the
 * `config.supported` boolean
 *
 * @example
 * ```typescript
 * const config = getBridgeTargetConfig(BridgeTarget.STARGATE_ARBITRUM, true);
 * ```
 */
export function getBridgeTargetConfig<
  T extends BridgeTarget,
  S extends true | false,
>(bridgeTarget: T, sandbox: S) {
  const targetConfig =
    sandbox ?
      BridgeConfig.testnet[bridgeTarget as keyof typeof BridgeConfig.testnet]
    : BridgeConfig.mainnet[bridgeTarget];
  if (!targetConfig) {
    throw new Error(
      `Unsupported bridge target ${bridgeTarget} ${sandbox ? 'testnet' : 'mainnet'}`,
    );
  }

  return targetConfig;
}

export function bridgeTargetForLayerZeroEndpointId(
  layerZeroEndpointId: number,
  sandbox: boolean,
) {
  if (sandbox && isBridgeTestnetLayerZeroEndpointId(layerZeroEndpointId)) {
    return BridgeConfigByLayerZeroEndpointId.testnet[layerZeroEndpointId]
      .target;
  }
  if (!sandbox && isBridgeMainnetLayerZeroEndpointId(layerZeroEndpointId)) {
    return BridgeConfigByLayerZeroEndpointId.mainnet[layerZeroEndpointId]
      .target;
  }

  return null;
}

export async function loadExchangeLayerZeroAddressFromApiIfNeeded(
  exchangeLayerZeroAdapterAddress?: string,
): Promise<string> {
  if (exchangeLayerZeroAdapterAddress) {
    return exchangeLayerZeroAdapterAddress;
  }

  const [exchangeResponse] = await loadExchangeResponseFromApiIfNeeded();
  return exchangeResponse.bridgeAdapters
    .stargateBridgeAdapterV1KatanaContractAddress;
}

export async function loadExchangeLocalDepositAddressFromApiIfNeeded(
  exchangeLocalDepositAdapterAddress?: string,
): Promise<string> {
  if (exchangeLocalDepositAdapterAddress) {
    return exchangeLocalDepositAdapterAddress;
  }

  const [exchangeResponse] = await loadExchangeResponseFromApiIfNeeded();
  return exchangeResponse.bridgeAdapters
    .localDepositAdapterV1KatanaContractAddress;
}

export async function loadStargateBridgeForwarderContractAddressFromApiIfNeeded(
  stargateBridgeForwarderContractAddress?: string,
): Promise<string> {
  if (stargateBridgeForwarderContractAddress) {
    return stargateBridgeForwarderContractAddress;
  }

  const [exchangeResponse] = await loadExchangeResponseFromApiIfNeeded();
  return exchangeResponse.bridgeAdapters
    .stargateBridgeForwarderV1EthereumContractAddress;
}
