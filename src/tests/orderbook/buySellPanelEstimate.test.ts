import * as chai from 'chai';

import { decimalToPip, multiplyPips, oneInPips } from '#pipmath';

import * as orderbook from '#orderbook/index';
import * as testHelpers from '#tests/testHelpers';
import { OrderSide, TimeInForce } from '#types/enums/request';

import type {
  BuySellPanelEstimateArgs,
  BuySellPanelOrder,
} from '#orderbook/index';
import type { OrderBookLevelL2 } from '#types/orderBook';
import type { KatanaPerpsPosition } from '#types/rest/endpoints/index';

const { expect } = chai;

/**
 * Default market: ETH-USD, index price 100, 10x leverage (IMF 0.1), MMF 0.05,
 * a flat 0.1% taker fee, no incremental IMF, and no execution price limits.
 */
const defaultMarket: BuySellPanelEstimateArgs['market'] = {
  market: 'ETH-USD',
  indexPrice: '100.00000000',
  maximumPositionSize: '1000000.00000000',
  initialMarginFraction: '0.10000000',
  maintenanceMarginFraction: '0.05000000',
  basePositionSize: '1000000.00000000',
  incrementalPositionSize: '1.00000000',
  incrementalInitialMarginFraction: '0.01000000',
  marketOrderExecutionPriceLimit: '0.00000000',
  limitOrderExecutionPriceLimit: '0.00000000',
};

/**
 * Default wallet: 1,000 quote balance, no positions, no held collateral.
 */
const defaultWallet: BuySellPanelEstimateArgs['wallet'] = {
  equity: '1000.00000000',
  heldCollateral: '0.00000000',
  quoteBalance: '1000.00000000',
  marginRatio: '0.00000000',
  makerFeeRate: '0.00000000',
  takerFeeRate: '0.00100000',
  positions: [],
};

const level = (
  price: string,
  size: string,
  numOrders = 1,
): OrderBookLevelL2 => ({
  price: decimalToPip(price),
  size: decimalToPip(size),
  numOrders,
  type: 'limit',
});

const position = (
  overrides: Partial<KatanaPerpsPosition> & Pick<KatanaPerpsPosition, 'market'>,
): KatanaPerpsPosition => ({
  quantity: '0.00000000',
  maximumQuantity: '0.00000000',
  entryPrice: '0.00000000',
  exitPrice: '0.00000000',
  markPrice: '0.00000000',
  indexPrice: '0.00000000',
  liquidationPrice: '0.00000000',
  value: '0.00000000',
  realizedPnL: '0.00000000',
  unrealizedPnL: '0.00000000',
  marginRequirement: '0.00000000',
  leverage: '0.00000000',
  totalFunding: '0.00000000',
  totalOpen: '0.00000000',
  totalClose: '0.00000000',
  adlQuintile: 0,
  openedByFillId: '',
  lastFillId: '',
  time: 0,
  ...overrides,
});

/** A 5-unit long ETH-USD position at index price 100, 10x leverage (margin 50). */
const longEthPosition = position({
  market: 'ETH-USD',
  quantity: '5.00000000',
  indexPrice: '100.00000000',
  marginRequirement: '50.00000000',
});

/** A wallet holding {@link longEthPosition} (equity 100, free collateral 50). */
const longEthWallet: BuySellPanelEstimateArgs['wallet'] = {
  ...defaultWallet,
  quoteBalance: '-400.00000000',
  equity: '100.00000000',
  marginRatio: '0.25000000',
  positions: [longEthPosition],
};

const runEstimate = (
  args: Partial<Omit<BuySellPanelEstimateArgs, 'order'>> & {
    order: BuySellPanelOrder;
  },
): orderbook.BuySellPanelEstimate =>
  orderbook.calculateBuySellPanelEstimate({
    market: defaultMarket,
    wallet: defaultWallet,
    orderBook: { asks: [], bids: [] },
    ...args,
  });

describe('orderbook/buySellPanelEstimate', () => {
  describe('calculateBuySellPanelEstimate', () => {
    it('estimates a market buy that crosses multiple levels (base quantity)', () => {
      const estimate = runEstimate({
        orderBook: {
          asks: [level('100', '10'), level('101', '10')],
          bids: [],
        },
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('15') },
      });

      // 10 @ 100 + 5 @ 101 = 1,505 quote
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('15'),
      );
      testHelpers.assertBigintsEqual(
        estimate.tradeQuoteQuantity,
        decimalToPip('1505'),
      );
      testHelpers.assertBigintsEqual(
        estimate.makerBaseQuantity,
        decimalToPip('0'),
      );
      expect(estimate.selfTradeEncountered).to.equal(false);
      expect(estimate.freeCollateralExceeded).to.equal(false);
      expect(estimate.maximumPositionSizeExceeded).to.equal(false);
    });

    it('computes cost as the change in available collateral (margin + fees)', () => {
      const estimate = runEstimate({
        orderBook: { asks: [level('100', '100')], bids: [] },
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('5') },
      });

      // Notional 500, IMF 0.1 => margin 50; taker fee 500 * 0.1% = 0.5
      testHelpers.assertBigintsEqual(estimate.cost, decimalToPip('50.5'));
      testHelpers.assertBigintsEqual(
        estimate.tradeQuoteQuantity,
        decimalToPip('500'),
      );
    });

    it('charges the taker gas fee per matched maker order', () => {
      const estimate = runEstimate({
        // A single level of 5 made up of 2 maker orders
        orderBook: { asks: [level('100', '5', 2)], bids: [] },
        takerTradeGasFee: decimalToPip('0.1'),
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('5') },
      });
      // Margin 50 + taker trade fee 0.5 + gas 0.1 * 2 orders = 50.7
      testHelpers.assertBigintsEqual(estimate.cost, decimalToPip('50.7'));
    });

    it('caps the taker trade fee at 5% of the fill quote', () => {
      const estimate = runEstimate({
        wallet: { ...defaultWallet, takerFeeRate: '0.10000000' }, // 10%, above the cap
        orderBook: { asks: [level('100', '100')], bids: [] },
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('5') },
      });
      // Notional 500: margin 50 + taker fee capped at 5% of 500 = 25 (not 50) => 75
      testHelpers.assertBigintsEqual(estimate.cost, decimalToPip('75'));
    });

    it('gives the trade fee priority over the gas fee within the 5% cap', () => {
      const estimate = runEstimate({
        wallet: { ...defaultWallet, takerFeeRate: '0.05000000' }, // exactly 5%
        takerTradeGasFee: decimalToPip('5'), // would apply, but no budget remains
        orderBook: { asks: [level('100', '100')], bids: [] },
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('5') },
      });
      // Trade fee consumes the whole 5% (25 of 500), so the gas fee is coerced to 0 => 75
      testHelpers.assertBigintsEqual(estimate.cost, decimalToPip('75'));
    });

    it('supports quote-denominated quantities', () => {
      const estimate = runEstimate({
        orderBook: { asks: [level('100', '100')], bids: [] },
        order: { side: OrderSide.buy, quoteQuantity: decimalToPip('500') },
      });
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('5'),
      );
      testHelpers.assertBigintsEqual(
        estimate.tradeQuoteQuantity,
        decimalToPip('500'),
      );
    });

    it('rests the unfilled remainder of a crossing limit order (gtc)', () => {
      const estimate = runEstimate({
        orderBook: { asks: [level('100', '4')], bids: [] },
        order: {
          side: OrderSide.buy,
          baseQuantity: decimalToPip('10'),
          limitPrice: decimalToPip('100'),
          timeInForce: TimeInForce.gtc,
        },
      });
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('4'),
      );
      // 6 remaining rests on the books
      testHelpers.assertBigintsEqual(
        estimate.makerBaseQuantity,
        decimalToPip('6'),
      );
    });

    it('cancels the remainder of an ioc limit order', () => {
      const estimate = runEstimate({
        orderBook: { asks: [level('100', '4')], bids: [] },
        order: {
          side: OrderSide.buy,
          baseQuantity: decimalToPip('10'),
          limitPrice: decimalToPip('100'),
          timeInForce: TimeInForce.ioc,
        },
      });
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('4'),
      );
      testHelpers.assertBigintsEqual(
        estimate.makerBaseQuantity,
        decimalToPip('0'),
      );
    });

    it('flags a post-only (gtx) order that would cross the spread', () => {
      const estimate = runEstimate({
        orderBook: { asks: [level('100', '10')], bids: [] },
        order: {
          side: OrderSide.buy,
          baseQuantity: decimalToPip('5'),
          limitPrice: decimalToPip('100'),
          timeInForce: TimeInForce.gtx,
        },
      });
      expect(estimate.postOnlyWouldCross).to.equal(true);
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('0'),
      );
    });

    it('rests a non-crossing post-only (gtx) order in full', () => {
      const estimate = runEstimate({
        orderBook: { asks: [level('100', '10')], bids: [] },
        order: {
          side: OrderSide.buy,
          baseQuantity: decimalToPip('5'),
          limitPrice: decimalToPip('90'),
          timeInForce: TimeInForce.gtx,
        },
      });
      expect(estimate.postOnlyWouldCross).to.equal(false);
      testHelpers.assertBigintsEqual(
        estimate.makerBaseQuantity,
        decimalToPip('5'),
      );
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('0'),
      );
    });

    it('flags a fill-or-kill order that cannot be fully filled', () => {
      const estimate = runEstimate({
        orderBook: { asks: [level('100', '4')], bids: [] },
        order: {
          side: OrderSide.buy,
          baseQuantity: decimalToPip('10'),
          limitPrice: decimalToPip('100'),
          timeInForce: TimeInForce.fok,
        },
      });
      expect(estimate.fillOrKillWouldNotExecute).to.equal(true);
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('0'),
      );
    });

    it('detects self-trades and frees the matched order’s held collateral', () => {
      // The book’s ask at 100 (size 10) includes the wallet’s own 3-unit sell.
      const estimate = runEstimate({
        wallet: { ...defaultWallet, heldCollateral: '30.00000000' },
        orderBook: { asks: [level('100', '10')], bids: [] },
        walletsStandingOrders: [
          {
            market: 'ETH-USD',
            side: OrderSide.sell,
            price: '100.00000000',
            originalQuantity: '3.00000000',
            executedQuantity: '0.00000000',
            status: 'open',
          },
        ],
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('5') },
      });

      expect(estimate.selfTradeEncountered).to.equal(true);
      // Only the 2 units not belonging to the wallet are actually traded
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('2'),
      );
      testHelpers.assertBigintsEqual(
        estimate.tradeQuoteQuantity,
        decimalToPip('200'),
      );
      // Freeing the 30 held by the canceled own order more than offsets the new
      // position’s margin (20) and fee (0.2): collateral increases.
      testHelpers.assertBigintsEqual(estimate.cost, decimalToPip('-9.8'));
    });

    it('flags an order that exceeds free collateral', () => {
      const estimate = runEstimate({
        wallet: {
          ...defaultWallet,
          equity: '60.00000000',
          quoteBalance: '60.00000000',
        },
        orderBook: { asks: [level('100', '1000')], bids: [] },
        // Notional 50,000 => margin 5,000, far above 60 of equity
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('500') },
      });
      expect(estimate.freeCollateralExceeded).to.equal(true);
    });

    it('flags a resting order that exceeds available collateral', () => {
      const estimate = runEstimate({
        wallet: {
          ...defaultWallet,
          equity: '100.00000000',
          quoteBalance: '100.00000000',
        },
        orderBook: { asks: [level('100', '10')], bids: [] },
        order: {
          side: OrderSide.buy,
          // 30 @ 50 => 1,500 quote, margin 150 > 100 available
          baseQuantity: decimalToPip('30'),
          limitPrice: decimalToPip('50'),
          timeInForce: TimeInForce.gtc,
        },
      });
      expect(estimate.availableCollateralExceeded).to.equal(true);
      expect(estimate.freeCollateralExceeded).to.equal(false);
      testHelpers.assertBigintsEqual(
        estimate.makerBaseQuantity,
        decimalToPip('30'),
      );
      // 30 @ 50 => 1,500 notional, held 150; available was 100, so the cost is
      // allowed to exceed available collateral (150, not clamped to 100).
      testHelpers.assertBigintsEqual(estimate.cost, decimalToPip('150'));
    });

    it('flags available collateral when a partially-crossing limit order rests an unaffordable remainder', () => {
      const estimate = runEstimate({
        wallet: {
          ...defaultWallet,
          equity: '100.00000000',
          quoteBalance: '100.00000000',
        },
        // Only 2 of liquidity at the limit price; the rest rests on the books.
        orderBook: { asks: [level('100', '2')], bids: [] },
        order: {
          side: OrderSide.buy,
          baseQuantity: decimalToPip('100'),
          limitPrice: decimalToPip('100'),
          timeInForce: TimeInForce.gtc,
        },
      });
      // 2 fills (affordable), 98 rests => held 98 * 100 * 0.1 = 980 > ~80 free
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('2'),
      );
      testHelpers.assertBigintsEqual(
        estimate.makerBaseQuantity,
        decimalToPip('98'),
      );
      expect(estimate.freeCollateralExceeded).to.equal(false);
      expect(estimate.availableCollateralExceeded).to.equal(true);
    });

    it('flags an order that exceeds the maximum position size', () => {
      const estimate = runEstimate({
        market: { ...defaultMarket, maximumPositionSize: '4.00000000' },
        orderBook: { asks: [level('100', '100')], bids: [] },
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('5') },
      });
      expect(estimate.maximumPositionSizeExceeded).to.equal(true);
    });

    it('flags a market order that exceeds the execution price limit', () => {
      const estimate = runEstimate({
        market: {
          ...defaultMarket,
          marketOrderExecutionPriceLimit: '0.00500000', // 0.5%
        },
        orderBook: {
          asks: [level('100', '10'), level('101', '10')],
          bids: [level('99', '10')],
        },
        // baseline = (100 + 99) / 2 = 99.5; max execution price = 100.0
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('15') },
      });
      expect(estimate.executionPriceLimitExceeded).to.equal(true);
      // Only the 10 available at 100 (within the limit) are filled
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('10'),
      );
    });

    it('flags a limit order whose price is outside the allowed range', () => {
      const estimate = runEstimate({
        market: {
          ...defaultMarket,
          limitOrderExecutionPriceLimit: '0.05000000', // 5%
        },
        orderBook: {
          asks: [level('100', '10')],
          bids: [level('100', '10')],
        },
        order: {
          side: OrderSide.buy,
          baseQuantity: decimalToPip('5'),
          limitPrice: decimalToPip('200'), // far above baseline 100
        },
      });
      expect(estimate.executionPriceLimitExceeded).to.equal(true);
    });

    it('computes the account-wide liquidation price for a new long', () => {
      const estimate = runEstimate({
        wallet: {
          ...defaultWallet,
          equity: '60.00000000',
          quoteBalance: '60.00000000',
        },
        orderBook: { asks: [level('100', '100')], bids: [] },
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('5') },
      });
      // quoteBalanceAfter = 60 - 500 - 0.5 = -440.5; long 5 @ MMF 0.05:
      //   -440.5 + 5P = 0.25P => P = 440.5 / 4.75 = 92.73684210
      testHelpers.assertBigintsEqual(
        estimate.liquidationPrice ?? BigInt(-1),
        decimalToPip('92.73684210'),
      );
    });

    it('returns a null liquidation price when the position is fully closed', () => {
      const estimate = runEstimate({
        wallet: {
          ...defaultWallet,
          quoteBalance: '-400.00000000',
          equity: '100.00000000',
          marginRatio: '0.25000000',
          positions: [longEthPosition],
        },
        orderBook: { bids: [level('100', '10')], asks: [] },
        order: {
          side: OrderSide.sell,
          baseQuantity: decimalToPip('5'),
          reduceOnly: true,
        },
      });
      expect(estimate.liquidationPrice).to.equal(null);
      // Closing the long frees its 50 of margin (less the 0.5 fee)
      testHelpers.assertBigintsEqual(estimate.cost, decimalToPip('-49.5'));
    });

    it('clamps a reduce-only order to the position size', () => {
      const estimate = runEstimate({
        wallet: {
          ...defaultWallet,
          quoteBalance: '-400.00000000',
          equity: '100.00000000',
          marginRatio: '0.25000000',
          positions: [longEthPosition],
        },
        orderBook: { bids: [level('100', '100')], asks: [] },
        order: {
          side: OrderSide.sell,
          baseQuantity: decimalToPip('10'),
          reduceOnly: true,
        },
      });
      // Only 5 (the position size) can be reduced
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('5'),
      );
    });

    it('flags a reduce-only order that would not reduce the position', () => {
      const estimate = runEstimate({
        wallet: {
          ...defaultWallet,
          quoteBalance: '-400.00000000',
          equity: '100.00000000',
          marginRatio: '0.25000000',
          positions: [longEthPosition],
        },
        orderBook: { asks: [level('100', '100')], bids: [] },
        // A buy does not reduce an existing long
        order: {
          side: OrderSide.buy,
          baseQuantity: decimalToPip('5'),
          reduceOnly: true,
        },
      });
      expect(estimate.reduceOnlyWouldNotReducePosition).to.equal(true);
    });

    it('flags a reduce-only order placed with no open position', () => {
      const estimate = runEstimate({
        orderBook: { bids: [level('100', '10')], asks: [] },
        order: {
          side: OrderSide.sell,
          baseQuantity: decimalToPip('5'),
          reduceOnly: true,
        },
      });
      expect(estimate.reduceOnlyNoOpenPosition).to.equal(true);
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('0'),
      );
      testHelpers.assertBigintsEqual(
        estimate.makerBaseQuantity,
        decimalToPip('0'),
      );
    });

    it('rests a reduce-only limit order up to the open position size', () => {
      const estimate = runEstimate({
        wallet: longEthWallet,
        orderBook: { asks: [], bids: [] },
        order: {
          side: OrderSide.sell,
          baseQuantity: decimalToPip('3'),
          limitPrice: decimalToPip('110'), // above the market: does not cross
          reduceOnly: true,
          timeInForce: TimeInForce.gtc,
        },
      });
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('0'),
      );
      // The reducing portion (<= position size of 5) rests on the books
      testHelpers.assertBigintsEqual(
        estimate.makerBaseQuantity,
        decimalToPip('3'),
      );
      expect(estimate.reduceOnlyOpenPositionSizeExceeded).to.equal(false);
    });

    it('flags a reduce-only limit order whose resting quantity exceeds the open position size', () => {
      const estimate = runEstimate({
        wallet: longEthWallet,
        orderBook: { asks: [], bids: [] },
        order: {
          side: OrderSide.sell,
          baseQuantity: decimalToPip('8'), // exceeds the position of 5
          limitPrice: decimalToPip('110'),
          reduceOnly: true,
          timeInForce: TimeInForce.gtc,
        },
      });
      // The order is still reported as resting, but flagged as not fully reducing
      testHelpers.assertBigintsEqual(
        estimate.makerBaseQuantity,
        decimalToPip('8'),
      );
      expect(estimate.reduceOnlyOpenPositionSizeExceeded).to.equal(true);
    });

    it('fills a reduce-only market order up to the full position size regardless of same-side standing orders', () => {
      const estimate = runEstimate({
        wallet: longEthWallet,
        orderBook: { bids: [level('100', '100')], asks: [] },
        walletsStandingOrders: [
          {
            market: 'ETH-USD',
            side: OrderSide.sell, // same side as the reduce-only sell
            price: '100.00000000',
            originalQuantity: '3.00000000',
            executedQuantity: '0.00000000',
            status: 'open',
          },
        ],
        order: {
          side: OrderSide.sell,
          baseQuantity: decimalToPip('10'),
          reduceOnly: true,
        },
      });
      // The standing sell does not cap the market reduce-only fill: the full
      // position of 5 is reduced
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('5'),
      );
    });

    it('does not flag maximum position size for a crossing limit order on account of standing orders', () => {
      const estimate = runEstimate({
        market: { ...defaultMarket, maximumPositionSize: '10.00000000' },
        wallet: {
          ...defaultWallet,
          equity: '100000.00000000',
          quoteBalance: '100000.00000000',
        },
        orderBook: { asks: [level('100', '3')], bids: [] },
        walletsStandingOrders: [
          {
            market: 'ETH-USD',
            side: OrderSide.buy,
            price: '90.00000000',
            originalQuantity: '8.00000000',
            executedQuantity: '0.00000000',
            status: 'open',
          },
        ],
        order: {
          side: OrderSide.buy,
          baseQuantity: decimalToPip('6'), // <= MPS of 10
          limitPrice: decimalToPip('100'),
          timeInForce: TimeInForce.gtc,
        },
      });
      // Order qty 6 <= MPS 10; the 8 standing buy is excluded from the check
      // for a crossing order (it would get canceled after the incoming order
      // is executed)
      expect(estimate.maximumPositionSizeExceeded).to.equal(false);
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('3'),
      );
      testHelpers.assertBigintsEqual(
        estimate.makerBaseQuantity,
        decimalToPip('3'),
      );
    });

    it('flags maximum position size for a market order whose requested quantity exceeds it despite thin liquidity', () => {
      const estimate = runEstimate({
        market: { ...defaultMarket, maximumPositionSize: '4.00000000' },
        orderBook: { asks: [level('100', '2')], bids: [] },
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('5') },
      });
      expect(estimate.maximumPositionSizeExceeded).to.equal(true);
      // Only the 2 of available liquidity is fillable
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('2'),
      );
    });

    it('excludes untriggered stop orders (status active) from self-trade detection', () => {
      const estimate = runEstimate({
        orderBook: { asks: [level('100', '10')], bids: [] },
        walletsStandingOrders: [
          {
            market: 'ETH-USD',
            side: OrderSide.sell,
            price: '100.00000000',
            originalQuantity: '3.00000000',
            executedQuantity: '0.00000000',
            status: 'active', // untriggered stop order
          },
        ],
        order: { side: OrderSide.buy, baseQuantity: decimalToPip('5') },
      });
      // The untriggered stop order is ignored: no self-trade, full 5 is traded
      expect(estimate.selfTradeEncountered).to.equal(false);
      testHelpers.assertBigintsEqual(
        estimate.tradeBaseQuantity,
        decimalToPip('5'),
      );
    });

    it('resolves the available-collateral slider so that a ratio of 1 consumes all of it', () => {
      const ratio = oneInPips; // 100%
      const estimate = runEstimate({
        orderBook: { asks: [level('100', '1000')], bids: [] },
        order: {
          side: OrderSide.buy,
          availableCollateralRatio: ratio,
        },
      });
      // available collateral = 1,000; cost should approach but not exceed it
      const target = multiplyPips(decimalToPip('1000'), ratio);
      expect(estimate.cost <= target).to.equal(true);
      expect(target - estimate.cost <= decimalToPip('1')).to.equal(true);
      // The quantity is bound by collateral (margin 10/unit + fee), ~99 base —
      // NOT the full 1,000 of available book liquidity, and it stays feasible.
      expect(estimate.tradeBaseQuantity < decimalToPip('150')).to.equal(true);
      expect(estimate.tradeBaseQuantity > decimalToPip('90')).to.equal(true);
      expect(estimate.freeCollateralExceeded).to.equal(false);
    });

    it('does not gulp all crossable liquidity for a 100% slider on a limit order', () => {
      const estimate = runEstimate({
        orderBook: { asks: [level('100', '1000')], bids: [] },
        order: {
          side: OrderSide.buy,
          limitPrice: decimalToPip('100'),
          timeInForce: TimeInForce.gtc,
          availableCollateralRatio: oneInPips,
        },
      });
      // Collateral-bound (~99), not the 1,000 of liquidity up to the limit price.
      expect(estimate.tradeBaseQuantity < decimalToPip('150')).to.equal(true);
      expect(estimate.tradeBaseQuantity > decimalToPip('90')).to.equal(true);
      expect(estimate.freeCollateralExceeded).to.equal(false);
    });

    it('applies an initial margin fraction override (higher margin, higher cost)', () => {
      const baseArgs = {
        orderBook: { asks: [level('100', '100')], bids: [] },
        order: {
          side: OrderSide.buy,
          baseQuantity: decimalToPip('5'),
        } satisfies BuySellPanelOrder,
      };
      const withoutOverride = runEstimate(baseArgs);
      const withOverride = runEstimate({
        ...baseArgs,
        walletInitialMarginFractionOverrides: [
          {
            wallet: '0xwallet',
            market: 'ETH-USD',
            initialMarginFractionOverride: '0.20000000', // 20% vs 10%
          },
        ],
      });
      // Margin doubles from 50 to 100, raising the cost by ~50
      testHelpers.assertBigintsEqual(
        withOverride.cost - withoutOverride.cost,
        decimalToPip('50'),
      );
    });

    it('requires exactly one quantity input', () => {
      expect(() =>
        orderbook.calculateBuySellPanelEstimate({
          market: defaultMarket,
          wallet: defaultWallet,
          orderBook: { asks: [], bids: [] },
          // @ts-expect-error intentionally providing two quantity inputs
          order: {
            side: OrderSide.buy,
            baseQuantity: decimalToPip('1'),
            quoteQuantity: decimalToPip('1'),
          },
        }),
      ).to.throw();
    });
  });
});
