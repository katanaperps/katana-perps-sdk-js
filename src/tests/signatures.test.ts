import * as chai from 'chai';
import { ethers } from 'ethers';

import {
  getFixedIncomeVaultConfigurationSignatureTypedData,
  getProfitShareVaultConfigurationSignatureTypedData,
} from '#signatures';

import * as testHelpers from '#tests/testHelpers';
import {
  FixedIncomeVaultProvider_v1__factory,
  ProfitShareVaultProvider_v1__factory,
} from '#typechain-types/index';

const { expect } = chai;

const managerWallet = ethers.getAddress(`0x${'11'.repeat(20)}`);
const managedAccountProviderAddress = ethers.getAddress(`0x${'33'.repeat(20)}`);
const chainId = 31337;

function getContractStructMembers(
  factory:
    | typeof FixedIncomeVaultProvider_v1__factory
    | typeof ProfitShareVaultProvider_v1__factory,
) {
  return testHelpers
    .getVaultConfigurationFieldsParamType(factory)
    .components?.map(({ type, name }) => `${type} ${name}`);
}

describe('getFixedIncomeVaultConfigurationSignatureTypedData', () => {
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
  const [domain, types, value] =
    getFixedIncomeVaultConfigurationSignatureTypedData(
      fields,
      managedAccountProviderAddress,
      chainId,
      false,
    );

  it('should encode the type string the provider contract hashes', () => {
    expect(
      ethers.TypedDataEncoder.from(types).encodeType(
        'FixedIncomeVaultConfiguration',
      ),
    ).to.equal(
      'FixedIncomeVaultConfiguration(address managerWallet,uint64 effectiveTimestampInS,uint64 interestMultiplier,uint64 maximumNetDeposits,uint64 maximumTotalOwedQuantityAvailableMultiplierToInitiateExit,uint64 minimumTotalOwedQuantityAvailableMultiplierToAllowManagerWalletWithdrawal,uint64 minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,uint64 withdrawalLimitPercentForDepositors,uint64 withdrawalLimitPercentForVault)',
    );
  });

  it('should list the members of the contract struct in declaration order', () => {
    expect(
      types.FixedIncomeVaultConfiguration.map(
        ({ type, name }) => `${type} ${name}`,
      ),
    ).to.deep.equal(
      getContractStructMembers(FixedIncomeVaultProvider_v1__factory),
    );
  });

  it('should map each configuration field to its struct member', () => {
    expect(value).to.deep.equal({
      managerWallet,
      effectiveTimestampInS: fields.effectiveTimestampInS,
      interestMultiplier: fields.interestMultiplierInPips,
      maximumNetDeposits: fields.maximumNetDepositsInPips,
      maximumTotalOwedQuantityAvailableMultiplierToInitiateExit:
        fields.maximumTotalOwedQuantityAvailableForExitWithdrawalMultiplierNeededToInitiateExitInPips,
      minimumTotalOwedQuantityAvailableMultiplierToAllowManagerWalletWithdrawal:
        fields.minimumTotalOwedQuantityAvailableForExitWithdrawalMultiplierToAllowManagerWalletWithdrawalInPips,
      minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit:
        fields.minimumUnappliedWithdrawalAgeInSNeededToInitiateExit,
      withdrawalLimitPercentForDepositors:
        fields.withdrawalLimitPercentForDepositorsInPips,
      withdrawalLimitPercentForVault:
        fields.withdrawalLimitPercentForVaultInPips,
    });
  });

  it("should use the provider's domain, with the sandbox version in sandbox", () => {
    expect(domain).to.deep.equal({
      name: 'KatanaPerpsFixedIncomeVault',
      version: '1.0.0',
      chainId,
      verifyingContract: managedAccountProviderAddress,
    });
    expect(
      getFixedIncomeVaultConfigurationSignatureTypedData(
        fields,
        managedAccountProviderAddress,
        chainId,
        true,
      )[0].version,
    ).to.equal('1.0.0-sandbox');
  });
});

describe('getProfitShareVaultConfigurationSignatureTypedData', () => {
  const fields = {
    managerWallet,
    carryFeeMultiplierInPips: 10_000_000n,
    managementFeeMultiplierInPips: 2_000_000n,
    maximumNetDepositsInPips: 100_000_000_000_000n,
    minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit: 3_600,
    withdrawalLimitPercentForDepositorsInPips: 20_000_000n,
    withdrawalLimitPercentForVaultInPips: 5_000_000n,
  };
  const [domain, types, value] =
    getProfitShareVaultConfigurationSignatureTypedData(
      fields,
      managedAccountProviderAddress,
      chainId,
      false,
    );

  it('should encode the type string the provider contract hashes', () => {
    expect(
      ethers.TypedDataEncoder.from(types).encodeType(
        'ProfitShareVaultConfiguration',
      ),
    ).to.equal(
      'ProfitShareVaultConfiguration(address managerWallet,uint64 carryFeeMultiplier,uint64 managementFeeMultiplier,uint64 maximumNetDeposits,uint64 minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,uint64 withdrawalLimitPercentForDepositors,uint64 withdrawalLimitPercentForVault)',
    );
  });

  it('should list the members of the contract struct in declaration order', () => {
    expect(
      types.ProfitShareVaultConfiguration.map(
        ({ type, name }) => `${type} ${name}`,
      ),
    ).to.deep.equal(
      getContractStructMembers(ProfitShareVaultProvider_v1__factory),
    );
  });

  it('should map each configuration field to its struct member', () => {
    expect(value).to.deep.equal({
      managerWallet,
      carryFeeMultiplier: fields.carryFeeMultiplierInPips,
      managementFeeMultiplier: fields.managementFeeMultiplierInPips,
      maximumNetDeposits: fields.maximumNetDepositsInPips,
      minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit:
        fields.minimumUnappliedDepositOrWithdrawalAgeInSToInitiateExit,
      withdrawalLimitPercentForDepositors:
        fields.withdrawalLimitPercentForDepositorsInPips,
      withdrawalLimitPercentForVault:
        fields.withdrawalLimitPercentForVaultInPips,
    });
  });

  it("should use the provider's domain, with the sandbox version in sandbox", () => {
    expect(domain).to.deep.equal({
      name: 'KatanaPerpsProfitShareVault',
      version: '1.0.0',
      chainId,
      verifyingContract: managedAccountProviderAddress,
    });
    expect(
      getProfitShareVaultConfigurationSignatureTypedData(
        fields,
        managedAccountProviderAddress,
        chainId,
        true,
      )[0].version,
    ).to.equal('1.0.0-sandbox');
  });
});
