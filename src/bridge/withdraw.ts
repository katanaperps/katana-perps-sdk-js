import { ethers } from 'ethers';

import { assetUnitsToDecimal, decimalToPip } from '#pipmath';

import { ExchangeLayerZeroAdapter_v3__factory } from '#typechain-types/factories/ExchangeLayerZeroAdapter_v3__factory';
import { BridgeTarget } from '#types/enums/request';

import { BridgeConfig } from './config';
import {
  getBridgeTargetConfig,
  bridgeTargetForLayerZeroEndpointId,
} from './utils';

/**
 * Decoded Bridge Payload
 */
export type DecodedWithdrawalBridgeAdapterPayload = {
  layerZeroEndpointId: number;
};

/**
 * Encoded withdrawal bridge payload
 */
export type EncodedWithdrawalBridgeAdapterPayload = string;

export const withdrawalBridgeAdapterPayloadLength = 4; // uint32(4)

/**
 * Decode an ABI-encoded hex string representing bridged withdrawal parameters
 */
export function decodeWithdrawalBridgeAdapterPayload(
  payload: EncodedWithdrawalBridgeAdapterPayload,
): DecodedWithdrawalBridgeAdapterPayload {
  return {
    layerZeroEndpointId: parseInt(
      ethers.AbiCoder.defaultAbiCoder().decode(['uint32'], payload)[0],
      10,
    ),
  };
}

/**
 * ABI-encode bridged withdrawal parameters
 */
export function encodeWithdrawalBridgeAdapterPayload({
  layerZeroEndpointId,
}: DecodedWithdrawalBridgeAdapterPayload): EncodedWithdrawalBridgeAdapterPayload {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['uint32'],
    [layerZeroEndpointId],
  );
}

/**
 * Returns the encoded `bridgeAdapterPayload`
 */
export function getEncodedWithdrawalPayloadForBridgeTarget(
  bridgeTarget: BridgeTarget,
  sandbox = false,
): EncodedWithdrawalBridgeAdapterPayload {
  const targetConfig = getBridgeTargetConfig(bridgeTarget, sandbox);

  return encodeWithdrawalBridgeAdapterPayload({
    layerZeroEndpointId: targetConfig.layerZeroEndpointId,
  });
}

/**
 * Estimate the quantity of tokens delivered to the target chain via bridged withdrawal
 */
export async function estimateBridgeWithdrawQuantity(
  parameters: {
    exchangeLayerZeroAdapterAddress: string;
    stargateForwarderAddress: string;
    payload: string;
    quantityInDecimal: string;
  },

  providers: {
    berachain: ethers.Provider;
    katana: ethers.Provider;
  },
  sandbox: boolean,
): Promise<{
  estimatedWithdrawQuantityInDecimal: string;
  minimumWithdrawQuantityInDecimal: string;
  willSucceed: boolean;
}> {
  const { layerZeroEndpointId: targetEndpointId } =
    decodeWithdrawalBridgeAdapterPayload(parameters.payload);

  const exchangeBridgeAdapter = ExchangeLayerZeroAdapter_v3__factory.connect(
    parameters.exchangeLayerZeroAdapterAddress,
    providers.katana,
  );

  const [
    estimatedWithdrawQuantityInAssetUnits,
    minimumWithdrawQuantityInAssetUnits,
    poolDecimals,
  ] = await exchangeBridgeAdapter.estimateWithdrawQuantityInAssetUnits(
    // Funds must always be withdrawn to Berachain first regardless of final target
    (sandbox ? BridgeConfig.testnet : BridgeConfig.mainnet)[
      BridgeTarget.LAYERZERO_BERACHAIN
    ].layerZeroEndpointId,
    decimalToPip(parameters.quantityInDecimal),
  );
  const estimatedWithdrawQuantityInDecimal = assetUnitsToDecimal(
    estimatedWithdrawQuantityInAssetUnits,
    Number(poolDecimals),
  );
  const minimumWithdrawQuantityInDecimal = assetUnitsToDecimal(
    minimumWithdrawQuantityInAssetUnits,
    Number(poolDecimals),
  );

  const target = bridgeTargetForLayerZeroEndpointId(targetEndpointId, sandbox);
  if (!target || !getBridgeTargetConfig(target, sandbox)) {
    throw new Error(`Unsupported Layerzero Endpoint ID ${targetEndpointId}`);
  }

  /*
  // If the final target is not Berachain, an bridge tx is needed via the forwarder
  if (target !== BridgeTarget.LAYERZERO_BERACHAIN) {
    const stargateForwarder = StargateForwarder_v2__factory.connect(
      parameters.stargateForwarderAddress,
      providers.berachain,
    );

    const [
      estimatedForwardedQuantityInAssetUnits,
      minimumForwardedQuantityInAssetUnits,
      forwardedPoolDecimals,
    ] = await stargateForwarder.loadEstimatedForwardedQuantityInAssetUnits(
      targetEndpointId,
      decimalToPip(estimatedWithdrawQuantityInDecimal),
    );
    estimatedWithdrawQuantityInDecimal = assetUnitsToDecimal(
      estimatedForwardedQuantityInAssetUnits,
      Number(forwardedPoolDecimals),
    );
    minimumWithdrawQuantityInDecimal = assetUnitsToDecimal(
      minimumForwardedQuantityInAssetUnits,
      Number(forwardedPoolDecimals),
    );
  }
 */

  const willSucceed =
    BigInt(estimatedWithdrawQuantityInAssetUnits) >=
    BigInt(minimumWithdrawQuantityInAssetUnits);

  return {
    estimatedWithdrawQuantityInDecimal,
    minimumWithdrawQuantityInDecimal,
    willSucceed,
  };
}
