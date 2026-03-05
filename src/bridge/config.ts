import { BridgeTarget } from '#types/enums/request';

export const BridgeTargetsArray = Object.values(BridgeTarget);

/**
 * TODO_IKON - These configs need to be completed in some areas and should be confirmed as valid
 *
 * @see [evmChainId](https://gist.github.com/melwong/c30eb1e21eda17549996a609c35dafb3#file-list-of-chain-ids-for-metamask-csv)
 *
 * @category Stargate
 */
export const BridgeConfig = {
  settings: {
    addManagedAccountComposeGasLimit: 650_000,
    depositComposeGasLimit: 350_000,
    depositSourceChainGasLimit: 450_000,
    stargateBridgeForwarderGasLimit: 1_200_000,
    localBridgeTarget: BridgeTarget.KATANA_KATANA,
  },
  mainnet: {
    [BridgeTarget.KATANA_KATANA]: {
      target: BridgeTarget.KATANA_KATANA,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=katana
      evmChainId: 747474,
      layerZeroEndpointId: 30375,
      // OFTAdapter https://github.com/agglayer/vault-bridge/tree/ab1c49f1ba3a8632657856e4be6a6b351043ed69/broadcast#mainnet
      layerzeroOFTAddress: '0x807275727Dd3E640c5F2b5DE7d1eC72B4Dd293C0',
      // vbUSDC
      tokenDecimals: 6,
      usdcAddress: '0x203A662b0BD271A6ed5a60EdFbd04bFce608FD36',
    },
    [BridgeTarget.STARGATE_ARBITRUM]: {
      target: BridgeTarget.STARGATE_ARBITRUM,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=arbitrum
      evmChainId: 42161,
      layerZeroEndpointId: 30110,
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/mainnet-contracts#arbitrum
      layerzeroOFTAddress: '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#arbitrum
      tokenDecimals: 6,
      usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    },
    [BridgeTarget.STARGATE_AURORA]: {
      target: BridgeTarget.STARGATE_AURORA,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=aurora
      evmChainId: 1313161554,
      layerZeroEndpointId: 30211,
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/mainnet-contracts#aurora
      layerzeroOFTAddress: '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#aurora
      tokenDecimals: 6,
      usdcAddress: '0x368EBb46ACa6b8D0787C96B2b20bD3CC3F2c45F7',
    },
    [BridgeTarget.STARGATE_AVALANCHE]: {
      target: BridgeTarget.STARGATE_AVALANCHE,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=avalanche
      evmChainId: 43114,
      layerZeroEndpointId: 30106,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#avalanche
      layerzeroOFTAddress: '0x5634c4a5FEd09819E3c46D86A965Dd9447d86e47',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#avalanche
      tokenDecimals: 6,
      usdcAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    },
    [BridgeTarget.STARGATE_BASE]: {
      target: BridgeTarget.STARGATE_BASE,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=base
      evmChainId: 8453,
      layerZeroEndpointId: 30184,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#base
      layerzeroOFTAddress: '0x27a16dc786820B16E5c9028b75B99F6f604b5d26',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#base
      tokenDecimals: 6,
      usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
    [BridgeTarget.STARGATE_BERACHAIN]: {
      target: BridgeTarget.STARGATE_BERACHAIN,
      evmChainId: 80094,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#bera
      layerZeroEndpointId: 30362,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#berachain
      layerzeroOFTAddress: '0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#bera
      tokenDecimals: 6,
      usdcAddress: '0x549943e04f40284185054145c6E4e9568C1D3241',
    },
    [BridgeTarget.STARGATE_ETHEREUM]: {
      target: BridgeTarget.STARGATE_ETHEREUM,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=ethereum
      evmChainId: 1,
      layerZeroEndpointId: 30101,
      // vbUSDC OFTAdapter https://github.com/agglayer/vault-bridge/tree/main/broadcast#mainnet
      layerzeroOFTAddress: '0xb5bADA33542a05395d504a25885e02503A957Bb3',
      layerZeroVaultComposerSyncAddress:
        '0x8A35897fda9E024d2aC20a937193e099679eC477',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#ethereum
      tokenDecimals: 6,
      usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    [BridgeTarget.STARGATE_OPTIMISM]: {
      target: BridgeTarget.STARGATE_OPTIMISM,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=optimism
      evmChainId: 10,
      layerZeroEndpointId: 30111,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#optimism
      layerzeroOFTAddress: '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#optimism
      tokenDecimals: 6,
      usdcAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    },
    [BridgeTarget.STARGATE_RARI]: {
      target: BridgeTarget.STARGATE_RARI,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=rarible
      evmChainId: 1380012617,
      layerZeroEndpointId: 30235,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#rari
      layerzeroOFTAddress: '0x875bee36739e7Ce6b60E056451c556a88c59b086',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#rari-chain
      tokenDecimals: 6,
      usdcAddress: '0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6',
    },
    [BridgeTarget.STARGATE_SCROLL]: {
      target: BridgeTarget.STARGATE_SCROLL,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=scroll
      evmChainId: 534352,
      layerZeroEndpointId: 30214,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#scroll
      layerzeroOFTAddress: '0x3Fc69CC4A842838bCDC9499178740226062b14E4',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#scroll
      tokenDecimals: 6,
      usdcAddress: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
    },
    [BridgeTarget.STARGATE_TAIKO]: {
      target: BridgeTarget.STARGATE_TAIKO,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=taiko
      evmChainId: 167000,
      layerZeroEndpointId: 30290,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#taiko
      layerzeroOFTAddress: '0x77C71633C34C3784ede189d74223122422492a0f',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#taiko
      tokenDecimals: 6,
      usdcAddress: '0x19e26B0638bf63aa9fa4d14c6baF8D52eBE86C5C',
    },
  } as const,
  testnet: {
    [BridgeTarget.KATANA_KATANA]: {
      target: BridgeTarget.KATANA_KATANA,
      evmChainId: 737373,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/testnet-contracts#bokuto-testnet
      layerZeroEndpointId: 40448,
      // No OFT currently supported on Bokuto testnet
      layerzeroOFTAddress: '0x3aCAAf60502791D199a5a5F0B173D78229eBFe32',
      tokenDecimals: 6,
      // vbUSDC
      usdcAddress: '0xc2a4C310F2512A17Ac0047cf871aCAed3E62bB4B',
    },
    [BridgeTarget.STARGATE_ARBITRUM]: {
      target: BridgeTarget.STARGATE_ARBITRUM,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=arbitrum-sepolia
      evmChainId: 421614,
      layerZeroEndpointId: 40231,
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/testnet-contracts#arbitrum-sepolia-testnet
      layerzeroOFTAddress: '0x543BdA7c6cA4384FE90B1F5929bb851F52888983',
      tokenDecimals: 6,
      usdcAddress: '0x3253a335E7bFfB4790Aa4C25C4250d206E9b9773',
    },
    [BridgeTarget.STARGATE_ETHEREUM]: {
      target: BridgeTarget.STARGATE_ETHEREUM,
      // https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=sepolia
      evmChainId: 11155111,
      layerZeroEndpointId: 40161,
      // No OFT currently supported on Sepolia testnet
      layerzeroOFTAddress: '0x0000000000000000000000000000000000000000',
      layerZeroVaultComposerSync: '0x0000000000000000000000000000000000000000',
      tokenDecimals: 6,
      usdcAddress: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
    },
  } as const,
} as const;

export const BridgeConfigByLayerZeroEndpointId = {
  mainnet: {
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_ARBITRUM].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_ARBITRUM],
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_AURORA].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_AURORA],
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_AVALANCHE].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_AVALANCHE],
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_BASE].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_BASE],
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_BERACHAIN].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_BERACHAIN],
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_ETHEREUM].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_ETHEREUM],
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_OPTIMISM].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_OPTIMISM],
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_RARI].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_RARI],
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_SCROLL].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_SCROLL],
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_TAIKO].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_TAIKO],
  },
  testnet: {
    [BridgeConfig.testnet[BridgeTarget.STARGATE_ARBITRUM].layerZeroEndpointId]:
      BridgeConfig.testnet[BridgeTarget.STARGATE_ARBITRUM],
    [BridgeConfig.mainnet[BridgeTarget.STARGATE_ETHEREUM].layerZeroEndpointId]:
      BridgeConfig.mainnet[BridgeTarget.STARGATE_ETHEREUM],
  },
};

/**
 * A type guard that checks if the given value is a valid {@link BridgeTarget} value.
 *
 * - This will not validate that the value is a {@link BridgeTarget} as that is  a subset of
 *   {@link BridgeTarget}, use {@link isValidBridgeTarget} for that.
 *
 * @internal
 */

export function isValidBridgeTarget(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is BridgeTarget {
  return value && BridgeTargetsArray.includes(value as BridgeTarget);
}
