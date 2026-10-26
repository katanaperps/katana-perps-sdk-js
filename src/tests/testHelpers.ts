import * as chai from 'chai';

import type {
  FixedIncomeVaultProvider_v1__factory,
  ProfitShareVaultProvider_v1__factory,
} from '#typechain-types/index';
import type { ParamType } from 'ethers';

const { expect } = chai;

export const assertBigintsEqual = (
  a: unknown,
  b: unknown,
  message = '',
): void => {
  if (typeof a !== 'bigint') {
    throw new Error(`First argument: Expected bigint, got ${String(a)}`);
  }
  if (typeof b !== 'bigint') {
    throw new Error(`Second argument: Expected bigint, got ${String(b)}`);
  }
  expect(a.toString()).to.eql(
    b.toString(),
    `${message}Expected ${b.toString()}, got ${a.toString()}`,
  );
};

/**
 * The provider contract's own VaultConfigurationFields struct definition, which
 * is what its addManagedAccount and initiateManagedAccountUpgrade functions
 * abi.decode
 */
export function getVaultConfigurationFieldsParamType(
  factory:
    | typeof FixedIncomeVaultProvider_v1__factory
    | typeof ProfitShareVaultProvider_v1__factory,
): ParamType {
  const fragment = factory
    .createInterface()
    .getFunction('vaultConfigurationUpgradesByManagerWallet');
  const structParam = fragment?.outputs.find(
    (output) => output.name === 'newVaultConfigurationFields',
  );
  if (!structParam) {
    throw new Error('VaultConfigurationFields struct not found in ABI');
  }
  return structParam;
}
