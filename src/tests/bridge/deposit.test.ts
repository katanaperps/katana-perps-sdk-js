import * as chai from 'chai';
import { ethers } from 'ethers';

import {
  createPrivateKeyTypedDataSigner,
  getFixedIncomeVaultConfigurationSignatureTypedData,
  getProfitShareVaultConfigurationSignatureTypedData,
} from '#signatures';

import {
  decodeDepositBridgeAdapterPayload,
  decodeDepositBridgeAdapterPayloadType,
  decodeFixedIncomeVaultConfigurationFields,
  decodeProfitShareVaultConfigurationFields,
  DepositBridgeAdapterPayloadType,
  depositBridgeAdapterPayloadLengths,
  encodeDepositBridgeAdapterPayload,
  encodeFixedIncomeVaultAddManagedAccountPayload,
  encodeFixedIncomeVaultConfigurationFields,
  encodeProfitShareVaultAddManagedAccountPayload,
  encodeProfitShareVaultConfigurationFields,
  signAndEncodeFixedIncomeVaultAddManagedAccountPayload,
  signAndEncodeProfitShareVaultAddManagedAccountPayload,
} from '#bridge/deposit';
import { getBridgeTargetConfig } from '#bridge/utils';
import * as testHelpers from '#tests/testHelpers';
import {
  FixedIncomeVaultProvider_v1__factory,
  ProfitShareVaultProvider_v1__factory,
} from '#typechain-types/index';
import { BridgeTarget } from '#types/enums/request';

const { expect } = chai;

const managerWallet = ethers.getAddress(`0x${'11'.repeat(20)}`);
const depositorWallet = ethers.getAddress(`0x${'22'.repeat(20)}`);
const managedAccountProviderAddress = ethers.getAddress(`0x${'33'.repeat(20)}`);
const chainId = 31337;
const managerWalletSignature = `0x${'ab'.repeat(65)}`;

const sourceConfig = getBridgeTargetConfig(BridgeTarget.KATANA_KATANA, false);

const fixedIncomeVaultFields = {
  managerWallet,
  effectiveTimestampInS: 1_700_000_000,
  interestMultiplierInPips: 10_000_000n,
  maximumNetDepositsInPips: 100_000_000_000_000n,
  maximumTotalOwedQuantityAvailableForExitWithdrawalMultiplierNeededToInitiateExitInPips:
    150_000_000n,
  minimumTotalOwedQuantityAvailableForExitWithdrawalMultiplierToAllowManagerWalletWithdrawalInPips:
    110_000_000n,
  minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit: 3_600,
  withdrawalLimitPercentForDepositorsInPips: 20_000_000n,
  withdrawalLimitPercentForVaultInPips: 5_000_000n,
};

const profitShareVaultFields = {
  managerWallet,
  carryFeeMultiplierInPips: 10_000_000n,
  managementFeeMultiplierInPips: 2_000_000n,
  maximumNetDepositsInPips: 100_000_000_000_000n,
  minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit: 3_600,
  withdrawalLimitPercentForDepositorsInPips: 20_000_000n,
  withdrawalLimitPercentForVaultInPips: 5_000_000n,
};

function byteLength(hex: string): number {
  return (hex.length - 2) / 2;
}

/**
 * Decodes an encoded configuration payload as the provider contract's
 * initiateManagedAccountUpgrade does
 */
function decodeWithContractStruct(
  factory:
    | typeof FixedIncomeVaultProvider_v1__factory
    | typeof ProfitShareVaultProvider_v1__factory,
  encoded: string,
) {
  return ethers.AbiCoder.defaultAbiCoder().decode(
    [testHelpers.getVaultConfigurationFieldsParamType(factory)],
    encoded,
  )[0];
}

/**
 * Decodes an add managed account payload as the provider contract's
 * addManagedAccount does, into the configuration and the signature
 */
function decodeAddManagedAccountPayload(
  factory:
    | typeof FixedIncomeVaultProvider_v1__factory
    | typeof ProfitShareVaultProvider_v1__factory,
  encoded: string,
) {
  return ethers.AbiCoder.defaultAbiCoder().decode(
    [testHelpers.getVaultConfigurationFieldsParamType(factory), 'bytes'],
    encoded,
  );
}

describe('encodeFixedIncomeVaultConfigurationFields', () => {
  it('should encode fields in the order of the contract struct', () => {
    const decoded = decodeWithContractStruct(
      FixedIncomeVaultProvider_v1__factory,
      encodeFixedIncomeVaultConfigurationFields(fixedIncomeVaultFields),
    );

    expect(decoded.managerWallet).to.equal(managerWallet);
    expect(decoded.effectiveTimestampInS).to.equal(
      BigInt(fixedIncomeVaultFields.effectiveTimestampInS),
    );
    expect(decoded.interestMultiplier).to.equal(
      fixedIncomeVaultFields.interestMultiplierInPips,
    );
    expect(decoded.maximumNetDeposits).to.equal(
      fixedIncomeVaultFields.maximumNetDepositsInPips,
    );
    expect(
      decoded.maximumTotalOwedQuantityAvailableMultiplierToInitiateExit,
    ).to.equal(
      fixedIncomeVaultFields.maximumTotalOwedQuantityAvailableForExitWithdrawalMultiplierNeededToInitiateExitInPips,
    );
    expect(
      decoded.minimumTotalOwedQuantityAvailableMultiplierToAllowManagerWalletWithdrawal,
    ).to.equal(
      fixedIncomeVaultFields.minimumTotalOwedQuantityAvailableForExitWithdrawalMultiplierToAllowManagerWalletWithdrawalInPips,
    );
    expect(
      decoded.minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,
    ).to.equal(
      BigInt(
        fixedIncomeVaultFields.minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,
      ),
    );
    expect(decoded.withdrawalLimitPercentForDepositors).to.equal(
      fixedIncomeVaultFields.withdrawalLimitPercentForDepositorsInPips,
    );
    expect(decoded.withdrawalLimitPercentForVault).to.equal(
      fixedIncomeVaultFields.withdrawalLimitPercentForVaultInPips,
    );
  });
});

describe('encodeProfitShareVaultConfigurationFields', () => {
  it('should encode fields in the order of the contract struct', () => {
    const decoded = decodeWithContractStruct(
      ProfitShareVaultProvider_v1__factory,
      encodeProfitShareVaultConfigurationFields(profitShareVaultFields),
    );

    expect(decoded.managerWallet).to.equal(managerWallet);
    expect(decoded.carryFeeMultiplier).to.equal(
      profitShareVaultFields.carryFeeMultiplierInPips,
    );
    expect(decoded.managementFeeMultiplier).to.equal(
      profitShareVaultFields.managementFeeMultiplierInPips,
    );
    expect(decoded.maximumNetDeposits).to.equal(
      profitShareVaultFields.maximumNetDepositsInPips,
    );
    expect(
      decoded.minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,
    ).to.equal(
      BigInt(
        profitShareVaultFields.minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,
      ),
    );
    expect(decoded.withdrawalLimitPercentForDepositors).to.equal(
      profitShareVaultFields.withdrawalLimitPercentForDepositorsInPips,
    );
    expect(decoded.withdrawalLimitPercentForVault).to.equal(
      profitShareVaultFields.withdrawalLimitPercentForVaultInPips,
    );
  });

  it('should not produce a payload decodable as the fixed income vault struct', () => {
    const encoded = encodeProfitShareVaultConfigurationFields(
      profitShareVaultFields,
    );

    expect(() =>
      decodeWithContractStruct(FixedIncomeVaultProvider_v1__factory, encoded),
    ).to.throw();
  });
});

describe('decodeFixedIncomeVaultConfigurationFields', () => {
  it("should decode the configuration carried by the provider's events", () => {
    const providerInterface =
      FixedIncomeVaultProvider_v1__factory.createInterface();
    const configuration = ethers.AbiCoder.defaultAbiCoder().encode(
      [
        testHelpers.getVaultConfigurationFieldsParamType(
          FixedIncomeVaultProvider_v1__factory,
        ),
      ],
      [
        {
          managerWallet,
          effectiveTimestampInS: fixedIncomeVaultFields.effectiveTimestampInS,
          interestMultiplier: fixedIncomeVaultFields.interestMultiplierInPips,
          maximumNetDeposits: fixedIncomeVaultFields.maximumNetDepositsInPips,
          maximumTotalOwedQuantityAvailableMultiplierToInitiateExit:
            fixedIncomeVaultFields.maximumTotalOwedQuantityAvailableForExitWithdrawalMultiplierNeededToInitiateExitInPips,
          minimumTotalOwedQuantityAvailableMultiplierToAllowManagerWalletWithdrawal:
            fixedIncomeVaultFields.minimumTotalOwedQuantityAvailableForExitWithdrawalMultiplierToAllowManagerWalletWithdrawalInPips,
          minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit:
            fixedIncomeVaultFields.minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,
          withdrawalLimitPercentForDepositors:
            fixedIncomeVaultFields.withdrawalLimitPercentForDepositorsInPips,
          withdrawalLimitPercentForVault:
            fixedIncomeVaultFields.withdrawalLimitPercentForVaultInPips,
        },
      ],
    );
    const { data, topics } = providerInterface.encodeEventLog(
      'ManagedAccountUpgradeFinalized',
      [managerWallet, configuration],
    );
    const event = providerInterface.decodeEventLog(
      'ManagedAccountUpgradeFinalized',
      data,
      topics,
    );

    expect(
      decodeFixedIncomeVaultConfigurationFields(event.configuration),
    ).to.deep.equal(fixedIncomeVaultFields);
  });

  it('should round-trip the encoded configuration', () => {
    expect(
      decodeFixedIncomeVaultConfigurationFields(
        encodeFixedIncomeVaultConfigurationFields(fixedIncomeVaultFields),
      ),
    ).to.deep.equal(fixedIncomeVaultFields);
  });
});

describe('decodeProfitShareVaultConfigurationFields', () => {
  it("should decode the configuration carried by the provider's events", () => {
    const providerInterface =
      ProfitShareVaultProvider_v1__factory.createInterface();
    const configuration = ethers.AbiCoder.defaultAbiCoder().encode(
      [
        testHelpers.getVaultConfigurationFieldsParamType(
          ProfitShareVaultProvider_v1__factory,
        ),
      ],
      [
        {
          managerWallet,
          carryFeeMultiplier: profitShareVaultFields.carryFeeMultiplierInPips,
          managementFeeMultiplier:
            profitShareVaultFields.managementFeeMultiplierInPips,
          maximumNetDeposits: profitShareVaultFields.maximumNetDepositsInPips,
          minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit:
            profitShareVaultFields.minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,
          withdrawalLimitPercentForDepositors:
            profitShareVaultFields.withdrawalLimitPercentForDepositorsInPips,
          withdrawalLimitPercentForVault:
            profitShareVaultFields.withdrawalLimitPercentForVaultInPips,
        },
      ],
    );
    const { data, topics } = providerInterface.encodeEventLog(
      'ManagedAccountAdded',
      [managerWallet, configuration],
    );
    const event = providerInterface.decodeEventLog(
      'ManagedAccountAdded',
      data,
      topics,
    );

    expect(
      decodeProfitShareVaultConfigurationFields(event.configuration),
    ).to.deep.equal(profitShareVaultFields);
  });

  it('should round-trip the encoded configuration', () => {
    expect(
      decodeProfitShareVaultConfigurationFields(
        encodeProfitShareVaultConfigurationFields(profitShareVaultFields),
      ),
    ).to.deep.equal(profitShareVaultFields);
  });
});

describe('encodeFixedIncomeVaultAddManagedAccountPayload', () => {
  it('should encode the configuration as the upgrade payload does, followed by the signature', () => {
    const [decodedFields, decodedSignature] = decodeAddManagedAccountPayload(
      FixedIncomeVaultProvider_v1__factory,
      encodeFixedIncomeVaultAddManagedAccountPayload(
        fixedIncomeVaultFields,
        managerWalletSignature,
      ),
    );

    expect(decodedFields.toObject()).to.deep.equal(
      decodeWithContractStruct(
        FixedIncomeVaultProvider_v1__factory,
        encodeFixedIncomeVaultConfigurationFields(fixedIncomeVaultFields),
      ).toObject(),
    );
    expect(decodedSignature).to.equal(managerWalletSignature);
  });
});

describe('encodeProfitShareVaultAddManagedAccountPayload', () => {
  it('should encode the configuration as the upgrade payload does, followed by the signature', () => {
    const [decodedFields, decodedSignature] = decodeAddManagedAccountPayload(
      ProfitShareVaultProvider_v1__factory,
      encodeProfitShareVaultAddManagedAccountPayload(
        profitShareVaultFields,
        managerWalletSignature,
      ),
    );

    expect(decodedFields.toObject()).to.deep.equal(
      decodeWithContractStruct(
        ProfitShareVaultProvider_v1__factory,
        encodeProfitShareVaultConfigurationFields(profitShareVaultFields),
      ).toObject(),
    );
    expect(decodedSignature).to.equal(managerWalletSignature);
  });
});

describe('signAndEncodeFixedIncomeVaultAddManagedAccountPayload', () => {
  it("should carry the manager wallet's signature over the encoded configuration", async () => {
    const manager = ethers.Wallet.createRandom();
    const fields = {
      ...fixedIncomeVaultFields,
      managerWallet: manager.address,
    };

    const [decodedFields, signature] = decodeAddManagedAccountPayload(
      FixedIncomeVaultProvider_v1__factory,
      await signAndEncodeFixedIncomeVaultAddManagedAccountPayload(
        fields,
        managedAccountProviderAddress,
        chainId,
        false,
        createPrivateKeyTypedDataSigner(manager.privateKey),
      ),
    );
    const [domain, types] = getFixedIncomeVaultConfigurationSignatureTypedData(
      fields,
      managedAccountProviderAddress,
      chainId,
      false,
    );

    expect(
      ethers.verifyTypedData(
        domain,
        types,
        decodedFields.toObject(),
        signature,
      ),
    ).to.equal(manager.address);
  });
});

describe('signAndEncodeProfitShareVaultAddManagedAccountPayload', () => {
  it("should carry the manager wallet's signature over the encoded configuration", async () => {
    const manager = ethers.Wallet.createRandom();
    const fields = {
      ...profitShareVaultFields,
      managerWallet: manager.address,
    };

    const [decodedFields, signature] = decodeAddManagedAccountPayload(
      ProfitShareVaultProvider_v1__factory,
      await signAndEncodeProfitShareVaultAddManagedAccountPayload(
        fields,
        managedAccountProviderAddress,
        chainId,
        false,
        createPrivateKeyTypedDataSigner(manager.privateKey),
      ),
    );
    const [domain, types] = getProfitShareVaultConfigurationSignatureTypedData(
      fields,
      managedAccountProviderAddress,
      chainId,
      false,
    );

    expect(
      ethers.verifyTypedData(
        domain,
        types,
        decodedFields.toObject(),
        signature,
      ),
    ).to.equal(manager.address);
  });
});

describe('encodeDepositBridgeAdapterPayload', () => {
  const addManagedAccountPayload =
    encodeProfitShareVaultAddManagedAccountPayload(
      profitShareVaultFields,
      managerWalletSignature,
    );

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
