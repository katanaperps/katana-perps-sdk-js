import type { BridgeTarget } from '@katanaperps/katana-perps-sdk-ma/types';

/**
 * Estimated gas fees by bridge and target chain
 *
 * @see docs [API Documentation](https://api-docs-v1-perps.katana.network/#get-gas-fees)
 * @see response {@link RestResponseGetGasFees}
 *
 * @category KatanaPerps - Get Gas Fees
 * @category KatanaPerps Interfaces
 */
export interface KatanaPerpsGasFees {
  withdrawal: {
    [K in BridgeTarget]?: string;
  };
}

/**
 * @see docs [API Documentation](https://api-docs-v1-perps.katana.network/#get-gas-fees)
 * @see type {@link KatanaPerpsGasFees}
 *
 * @category KatanaPerps - Get Gas Fees
 */
export type RestResponseGetGasFees = KatanaPerpsGasFees;
