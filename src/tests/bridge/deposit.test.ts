import * as chai from 'chai';
import { ethers } from 'ethers';

import {
  decodeDepositBridgeAdapterPayload,
  decodeDepositBridgeAdapterPayloadType,
  DepositBridgeAdapterPayloadType,
  depositBridgeAdapterPayloadLengths,
  encodeDepositBridgeAdapterPayload,
  encodeFixedIncomeVaultConfigurationFields,
  encodeProfitShareVaultConfigurationFields,
} from '#bridge/deposit';
import { getBridgeTargetConfig } from '#bridge/utils';
import {
  FixedIncomeVaultProvider_v1__factory,
  ProfitShareVaultProvider_v1__factory,
} from '#typechain-types/index';
import { BridgeTarget } from '#types/enums/request';

const { expect } = chai;

const managerWallet = ethers.getAddress(`0x${'11'.repeat(20)}`);
const depositorWallet = ethers.getAddress(`0x${'22'.repeat(20)}`);
const managedAccountProviderAddress = ethers.getAddress(`0x${'33'.repeat(20)}`);

const sourceConfig = getBridgeTargetConfig(BridgeTarget.KATANA_KATANA, false);

function byteLength(hex: string): number {
  return (hex.length - 2) / 2;
}

/**
 * Decodes an encoded configuration payload using the provider contract's own
 * VaultConfigurationFields struct definition, which is what the contract's
 * addManagedAccount and initiateManagedAccountUpgrade functions abi.decode
 */
function decodeWithContractStruct(
  factory:
    | typeof FixedIncomeVaultProvider_v1__factory
    | typeof ProfitShareVaultProvider_v1__factory,
  encoded: string,
) {
  const fragment = factory
    .createInterface()
    .getFunction('vaultConfigurationUpgradesByManagerWallet');
  const structParam = fragment?.outputs.find(
    (output) => output.name === 'newVaultConfigurationFields',
  );
  if (!structParam) {
    throw new Error('VaultConfigurationFields struct not found in ABI');
  }
  return ethers.AbiCoder.defaultAbiCoder().decode([structParam], encoded)[0];
}

describe('encodeFixedIncomeVaultConfigurationFields', () => {
  const fields = {
    managerWallet,
    effectiveTimestampInS: 1_700_000_000,
    interestMultiplierInPips: 10_000_000n,
    maximumNetDepositsInPips: 100_000_000_000_000n,
    maximumTotalOwedQuantityAvailableForExitWithdrawalMultiplierNeededToInitiateExitInPips:
      150_000_000n,
    minimumTotalOwedQuantityAvailableForExitWithdrawalMultiplierToAllowManagerWalletWithdrawalInPips:
      110_000_000n,
    minimumUnappliedWithdrawalAgeInSNeededToInitiateExit: 3_600,
    withdrawalLimitPercentForDepositorsInPips: 20_000_000n,
    withdrawalLimitPercentForVaultInPips: 5_000_000n,
  };

  it('should encode fields in the order of the contract struct', () => {
    const decoded = decodeWithContractStruct(
      FixedIncomeVaultProvider_v1__factory,
      encodeFixedIncomeVaultConfigurationFields(fields),
    );

    expect(decoded.managerWallet).to.equal(managerWallet);
    expect(decoded.effectiveTimestampInS).to.equal(
      BigInt(fields.effectiveTimestampInS),
    );
    expect(decoded.interestMultiplier).to.equal(
      fields.interestMultiplierInPips,
    );
    expect(decoded.maximumNetDeposits).to.equal(
      fields.maximumNetDepositsInPips,
    );
    expect(
      decoded.maximumTotalOwedQuantityAvailableMultiplierToInitiateExit,
    ).to.equal(
      fields.maximumTotalOwedQuantityAvailableForExitWithdrawalMultiplierNeededToInitiateExitInPips,
    );
    expect(
      decoded.minimumTotalOwedQuantityAvailableMultiplierToAllowManagerWalletWithdrawal,
    ).to.equal(
      fields.minimumTotalOwedQuantityAvailableForExitWithdrawalMultiplierToAllowManagerWalletWithdrawalInPips,
    );
    expect(
      decoded.minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,
    ).to.equal(
      BigInt(fields.minimumUnappliedWithdrawalAgeInSNeededToInitiateExit),
    );
    expect(decoded.withdrawalLimitPercentForDepositors).to.equal(
      fields.withdrawalLimitPercentForDepositorsInPips,
    );
    expect(decoded.withdrawalLimitPercentForVault).to.equal(
      fields.withdrawalLimitPercentForVaultInPips,
    );
  });
});

describe('encodeProfitShareVaultConfigurationFields', () => {
  const fields = {
    managerWallet,
    carryFeeMultiplierInPips: 10_000_000n,
    managementFeeMultiplierInPips: 2_000_000n,
    maximumNetDepositsInPips: 100_000_000_000_000n,
    minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit: 3_600,
    withdrawalLimitPercentForDepositorsInPips: 20_000_000n,
    withdrawalLimitPercentForVaultInPips: 5_000_000n,
  };

  it('should encode fields in the order of the contract struct', () => {
    const decoded = decodeWithContractStruct(
      ProfitShareVaultProvider_v1__factory,
      encodeProfitShareVaultConfigurationFields(fields),
    );

    expect(decoded.managerWallet).to.equal(managerWallet);
    expect(decoded.carryFeeMultiplier).to.equal(
      fields.carryFeeMultiplierInPips,
    );
    expect(decoded.managementFeeMultiplier).to.equal(
      fields.managementFeeMultiplierInPips,
    );
    expect(decoded.maximumNetDeposits).to.equal(
      fields.maximumNetDepositsInPips,
    );
    expect(
      decoded.minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,
    ).to.equal(
      BigInt(fields.minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit),
    );
    expect(decoded.withdrawalLimitPercentForDepositors).to.equal(
      fields.withdrawalLimitPercentForDepositorsInPips,
    );
    expect(decoded.withdrawalLimitPercentForVault).to.equal(
      fields.withdrawalLimitPercentForVaultInPips,
    );
  });

  it('should not produce a payload decodable as the fixed income vault struct', () => {
    const encoded = encodeProfitShareVaultConfigurationFields(fields);

    expect(() =>
      decodeWithContractStruct(FixedIncomeVaultProvider_v1__factory, encoded),
    ).to.throw();
  });
});

describe('encodeDepositBridgeAdapterPayload', () => {
  const addManagedAccountPayload = encodeProfitShareVaultConfigurationFields({
    managerWallet,
    carryFeeMultiplierInPips: 10_000_000n,
    managementFeeMultiplierInPips: 2_000_000n,
    maximumNetDepositsInPips: 100_000_000_000_000n,
    minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit: 3_600,
    withdrawalLimitPercentForDepositorsInPips: 20_000_000n,
    withdrawalLimitPercentForVaultInPips: 5_000_000n,
  });

  it('should round-trip an addManagedAccount payload', () => {
    const encoded = encodeDepositBridgeAdapterPayload(sourceConfig, {
      bridgePayloadType: DepositBridgeAdapterPayloadType.addManagedAccount,
      managedAccountProviderAddress,
      managerWallet,
      addManagedAccountPayload,
    });

    expect(decodeDepositBridgeAdapterPayloadType(encoded)).to.equal(
      DepositBridgeAdapterPayloadType.addManagedAccount,
    );
    expect(decodeDepositBridgeAdapterPayload(encoded)).to.include({
      bridgePayloadType: DepositBridgeAdapterPayloadType.addManagedAccount,
      sourceEndpointId: BigInt(sourceConfig.layerZeroEndpointId),
      managedAccountProvider: managedAccountProviderAddress,
      managerWallet,
      addManagedAccountPayload,
      depositPayload: '0x',
    });
  });

  it('should round-trip a depositToManagedAccount payload of the expected length', () => {
    const encoded = encodeDepositBridgeAdapterPayload(sourceConfig, {
      bridgePayloadType:
        DepositBridgeAdapterPayloadType.depositToManagedAccount,
      depositorWallet,
      managedAccountProviderAddress,
      managerWallet,
    });

    expect(byteLength(encoded)).to.equal(
      depositBridgeAdapterPayloadLengths[
        DepositBridgeAdapterPayloadType.depositToManagedAccount
      ],
    );
    expect(decodeDepositBridgeAdapterPayloadType(encoded)).to.equal(
      DepositBridgeAdapterPayloadType.depositToManagedAccount,
    );
    expect(decodeDepositBridgeAdapterPayload(encoded)).to.include({
      bridgePayloadType:
        DepositBridgeAdapterPayloadType.depositToManagedAccount,
      sourceEndpointId: BigInt(sourceConfig.layerZeroEndpointId),
      depositorWallet,
      managedAccountProvider: managedAccountProviderAddress,
      managerWallet,
      depositPayload: '0x',
    });
  });

  it('should round-trip a depositToWallet payload of the expected length', () => {
    const encoded = encodeDepositBridgeAdapterPayload(sourceConfig, {
      bridgePayloadType: DepositBridgeAdapterPayloadType.depositToWallet,
      depositorWallet,
    });

    expect(byteLength(encoded)).to.equal(
      depositBridgeAdapterPayloadLengths[
        DepositBridgeAdapterPayloadType.depositToWallet
      ],
    );
    expect(decodeDepositBridgeAdapterPayloadType(encoded)).to.equal(
      DepositBridgeAdapterPayloadType.depositToWallet,
    );
    expect(decodeDepositBridgeAdapterPayload(encoded)).to.include({
      bridgePayloadType: DepositBridgeAdapterPayloadType.depositToWallet,
      sourceEndpointId: BigInt(sourceConfig.layerZeroEndpointId),
      depositorWallet,
    });
  });

  it('should decode an unknown payload type as undefined', () => {
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(['uint8'], [7]);

    expect(decodeDepositBridgeAdapterPayload(encoded)).to.equal(undefined);
  });
});
