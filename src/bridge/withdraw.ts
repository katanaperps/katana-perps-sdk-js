import { ethers } from 'ethers';

import { assetUnitsToDecimal, decimalToPip } from '#pipmath';

import { ExchangeLayerZeroAdapter_v1__factory } from '#typechain-types/factories/ExchangeLayerZeroAdapter_v1__factory';
import { KatanaPerpsStargateForwarder_v1__factory } from '#typechain-types/factories/KatanaPerpsStargateForwarder_v1__factory';
import { BridgeTarget } from '#types/enums/request';

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
    ethereum: ethers.Provider;
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

  const exchangeBridgeAdapter = ExchangeLayerZeroAdapter_v1__factory.connect(
    parameters.exchangeLayerZeroAdapterAddress,
    providers.katana,
  );

  const [
    estimatedWithdrawQuantityInAssetUnits,
    minimumWithdrawQuantityInAssetUnits,
    poolDecimals,
  ] = await exchangeBridgeAdapter.estimateWithdrawQuantityInAssetUnits(
    // Funds must always be withdrawn to Ethereum first regardless of final target
    decimalToPip(parameters.quantityInDecimal),
  );
  let estimatedWithdrawQuantityInDecimal = assetUnitsToDecimal(
    estimatedWithdrawQuantityInAssetUnits,
    Number(poolDecimals),
  );
  let minimumWithdrawQuantityInDecimal = assetUnitsToDecimal(
    minimumWithdrawQuantityInAssetUnits,
    Number(poolDecimals),
  );

  const target = bridgeTargetForLayerZeroEndpointId(targetEndpointId, sandbox);
  if (!target || !getBridgeTargetConfig(target, sandbox)) {
    throw new Error(`Unsupported Layerzero Endpoint ID ${targetEndpointId}`);
  }

  // If the final target is not Ethereum, a bridge tx is needed via the forwarder
  if (target !== BridgeTarget.STARGATE_ETHEREUM) {
    const stargateForwarder = KatanaPerpsStargateForwarder_v1__factory.connect(
      parameters.stargateForwarderAddress,
      providers.ethereum,
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

  const willSucceed =
    BigInt(estimatedWithdrawQuantityInAssetUnits) >=
    BigInt(minimumWithdrawQuantityInAssetUnits);

  return {
    estimatedWithdrawQuantityInDecimal,
    minimumWithdrawQuantityInDecimal,
    willSucceed,
  };
}
