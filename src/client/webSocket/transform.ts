import { UnreachableCaseError } from '#utils';

import { FillType, MessageEventType } from '#types/enums/response';

import type * as katanaPerps from '#types/index';
import type { AnyObj } from '#types/utils';

function removeUndefinedFromObj<O extends AnyObj>(obj: O): O {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as O;
}

const transformTickersMessage = (
  short: katanaPerps.WebSocketResponseTickerShort,
): katanaPerps.KatanaPerpsTickerEventData =>
  removeUndefinedFromObj({
    market: short.m,
    time: short.t,
    open: short.o,
    high: short.h,
    low: short.l,
    close: short.c,
    closeQuantity: short.Q,
    baseVolume: short.v,
    quoteVolume: short.q,
    percentChange: short.P,
    trades: short.n,
    ask: short.a,
    bid: short.b,
    markPrice: short.mp,
    indexPrice: short.ip,
    indexPrice24h: short.id,
    indexPricePercentChange: short.iP,
    lastFundingRate: short.lf,
    currentFundingRate: short.nf,
    nextFundingTime: short.ft,
    openInterest: short.oi,
    sequence: short.u,
  });

const transformTradesMessage = (
  short: katanaPerps.WebSocketResponseTradeShort,
): katanaPerps.KatanaPerpsTradeEventData =>
  removeUndefinedFromObj({
    market: short.m,
    fillId: short.i,
    price: short.p,
    quantity: short.q,
    quoteQuantity: short.Q,
    time: short.t,
    makerSide: short.s,
    sequence: short.u,
  });

const transformLiquidationsMessage = (
  short: katanaPerps.WebSocketResponseLiquidationsShort,
): katanaPerps.KatanaPerpsLiquidationEventData =>
  removeUndefinedFromObj({
    market: short.m,
    fillId: short.i,
    price: short.p,
    quantity: short.q,
    quoteQuantity: short.Q,
    time: short.t,
    liquidationSide: short.s,
  });

const transformCandlesMessage = (
  short: katanaPerps.WebSocketResponseCandleShort,
): katanaPerps.KatanaPerpsCandleEventData =>
  removeUndefinedFromObj({
    market: short.m,
    time: short.t,
    interval: short.i,
    start: short.s,
    end: short.e,
    open: short.o,
    high: short.h,
    low: short.l,
    close: short.c,
    baseVolume: short.v,
    quoteVolume: short.q,
    trades: short.n,
    sequence: short.u,
  });

const transformL1orderbookMessage = (
  short: katanaPerps.WebSocketResponseL1OrderBookShort,
): katanaPerps.KatanaPerpsOrderBookLevel1EventData =>
  removeUndefinedFromObj({
    market: short.m,
    time: short.t,
    bidPrice: short.b,
    bidQuantity: short.B,
    askPrice: short.a,
    askQuantity: short.A,
    lastPrice: short.lp,
    markPrice: short.mp,
    indexPrice: short.ip,
  });

const transformL2orderbookMessage = (
  short: katanaPerps.WebSocketResponseL2OrderBookShort,
): katanaPerps.KatanaPerpsOrderBookLevel2EventData =>
  removeUndefinedFromObj({
    market: short.m,
    time: short.t,
    sequence: short.u,
    ...(short.b && { bids: short.b }),
    ...(short.a && { asks: short.a }),
    lastPrice: short.lp,
    markPrice: short.mp,
    indexPrice: short.ip,
  });

function transformOrderFill(
  short: katanaPerps.WebSocketResponseOrderFillShort,
) {
  return removeUndefinedFromObj({
    type: short.y,
    fillId: short.i,
    price: short.p,
    quantity: short.q,
    quoteQuantity: short.Q,
    realizedPnL: short.rn,
    time: short.t,
    ...(isWebSocketResponseOrderFillShortGeneral(short) ?
      {
        makerSide: short.s,
        sequence: short.u,
      }
    : {}),
    fee: short.f,
    ...(isWebSocketResponseOrderFillShortGeneral(short) ?
      {
        liquidity: short.l,
      }
    : {}),
    action: short.a,
    position: short.P,
    txId: short.T,
    txStatus: short.S,
  });
}

function transformOrdersMessage(
  short: katanaPerps.WebSocketResponseOrderShort,
): katanaPerps.KatanaPerpsOrderEventData {
  if (!short.o) {
    return removeUndefinedFromObj({
      market: short.m,
      wallet: short.w,
      executionTime: short.t,
      side: short.s,
      // should only include a single fill but we map for future compat
      fills: short.F.map(transformOrderFill),
    } satisfies katanaPerps.KatanaPerpsOrderEventDataSystemFill);
  }

  return removeUndefinedFromObj({
    market: short.m,
    orderId: short.i,
    clientOrderId: short.c,
    wallet: short.w,
    executionTime: short.t,
    time: short.T,
    update: short.x,
    status: short.X,
    sequence: short.u,
    errorCode: short.ec,
    errorMessage: short.em,
    type: short.o,
    subType: short.O,
    side: short.s,
    originalQuantity: short.q,
    executedQuantity: short.z,
    cumulativeQuoteQuantity: short.Z,
    avgExecutionPrice: short.v,
    price: short.p,
    triggerPrice: short.P,
    triggerType: short.tt,
    // callbackRate: short.cr,
    conditionalOrderId: short.ci,
    reduceOnly: short.r,
    timeInForce: short.f,
    selfTradePrevention: short.V,
    delegatedKey: short.dk,
    isLiquidationAcquisitionOnly: short.la,
    ...(short.F && { fills: short.F.map(transformOrderFill) }),
  } satisfies katanaPerps.KatanaPerpsOrderEventDataGeneral);
}

const transformDepositsMessage = (
  short: katanaPerps.WebSocketResponseDepositsShort,
): katanaPerps.KatanaPerpsDepositEventData =>
  removeUndefinedFromObj({
    wallet: short.w,
    depositId: short.i,
    asset: short.a,
    quantity: short.q,
    quoteBalance: short.qb,
    time: short.t,
  });

const transformWithdrawalsMessage = (
  short: katanaPerps.WebSocketResponseWithdrawalsShort,
): katanaPerps.KatanaPerpsWithdrawalEventData =>
  removeUndefinedFromObj({
    wallet: short.w,
    withdrawalId: short.i,
    asset: short.a,
    quantity: short.q,
    gas: short.g,
    quoteBalance: short.qb,
    time: short.t,
  });

const transformPositionsMessage = (
  short: katanaPerps.WebSocketResponsePositionsShort,
): katanaPerps.KatanaPerpsPositionEventData =>
  removeUndefinedFromObj({
    wallet: short.w,
    market: short.m,
    status: short.X,
    quantity: short.q,
    maximumQuantity: short.mq,
    entryPrice: short.np,
    exitPrice: short.xp,
    realizedPnL: short.rn,
    totalFunding: short.f,
    totalOpen: short.to,
    totalClose: short.tc,
    openedByFillId: short.of,
    lastFillId: short.lf,
    quoteBalance: short.qb,
    time: short.t,
  });

const transformFundingPaymentsMessage = (
  short: katanaPerps.WebSocketResponseFundingPaymentsShort,
): katanaPerps.KatanaPerpsFundingPaymentEventData =>
  removeUndefinedFromObj({
    wallet: short.w,
    market: short.m,
    paymentQuantity: short.Q,
    positionQuantity: short.q,
    fundingRate: short.f,
    indexPrice: short.ip,
    time: short.t,
  });

export const transformWebsocketShortResponseMessage = (
  message:
    | katanaPerps.KatanaPerpsErrorEvent
    | katanaPerps.KatanaPerpsSubscriptionsListEvent
    | katanaPerps.WebSocketResponseSubscriptionMessageShort,
): katanaPerps.KatanaPerpsMessageEvent => {
  if (
    message.type === MessageEventType.error ||
    message.type === MessageEventType.subscriptions
  ) {
    return message;
  }

  const { type } = message;

  switch (type) {
    case MessageEventType.tickers:
      return { ...message, data: transformTickersMessage(message.data) };
    case MessageEventType.trades:
      return { ...message, data: transformTradesMessage(message.data) };
    case MessageEventType.liquidations:
      return { ...message, data: transformLiquidationsMessage(message.data) };
    case MessageEventType.candles:
      return { ...message, data: transformCandlesMessage(message.data) };
    case MessageEventType.l1orderbook:
      return { ...message, data: transformL1orderbookMessage(message.data) };
    case MessageEventType.l2orderbook:
      return { ...message, data: transformL2orderbookMessage(message.data) };
    case MessageEventType.orders:
      return { ...message, data: transformOrdersMessage(message.data) };
    case MessageEventType.deposits:
      return { ...message, data: transformDepositsMessage(message.data) };
    case MessageEventType.withdrawals:
      return { ...message, data: transformWithdrawalsMessage(message.data) };
    case MessageEventType.positions:
      return { ...message, data: transformPositionsMessage(message.data) };
    case MessageEventType.fundingPayments:
      return {
        ...message,
        data: transformFundingPaymentsMessage(message.data),
      };
    // due to their dynamic and internal nature, webclient events
    // are not transformed like other messages
    case MessageEventType.webclient:
      return message;
    default:
      throw new UnreachableCaseError(
        type,
        'transformWebsocketShortResponseMessage',
      );
  }
};

const isWebSocketResponseOrderFillShortGeneral = (
  short: katanaPerps.WebSocketResponseOrderFillShort,
): short is katanaPerps.WebSocketResponseOrderFillShortGeneral =>
  short.y !== FillType.closure &&
  short.y !== FillType.liquidation &&
  short.y !== FillType.deleverage;
