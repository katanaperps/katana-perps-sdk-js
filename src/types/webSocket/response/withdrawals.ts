import type { MessageEventType } from '#types/enums/index';
import type { KatanaPerpsWithdrawal } from '#types/rest/endpoints/GetWithdrawals';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';

/**
 * When the `withdrawals` subscription provides an update
 *
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Withdrawals
 */
export interface KatanaPerpsWithdrawalEvent
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.withdrawals;
  /**
   * @inheritDoc KatanaPerpsWithdrawalEventData
   *
   * @see type {@link KatanaPerpsWithdrawalEventData}
   */
  data: KatanaPerpsWithdrawalEventData;
}

/**
 * - Includes most properties from the REST API's {@link KatanaPerpsWithdrawal} type.
 * - Additionally includes the
 *    {@link KatanaPerpsWithdrawalEventData.wallet wallet},
 *    {@link KatanaPerpsWithdrawalEventData.time time},
 *    and {@link KatanaPerpsWithdrawalEventData.quoteBalance quoteBalance} properties.
 *
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Withdrawals
 */
export interface KatanaPerpsWithdrawalEventData
  extends Pick<
    KatanaPerpsWithdrawal,
    'withdrawalId' | 'quantity' | 'asset' | 'gas'
  > {
  /**
   * Wallet address
   */
  wallet: string;
  /**
   * Quote token balance after the withdrawal
   */
  quoteBalance: string;
  /**
   * Timestamp of debiting the withdrawn frond from the exchange
   */
  time: number;
}

export interface WebSocketResponseSubscriptionMessageShortWithdrawals
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.withdrawals;
  data: WebSocketResponseWithdrawalsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseWithdrawalsShort {
  /**
   * @see inflated {@link KatanaPerpsWithdrawalEventData.wallet}
   */
  w: KatanaPerpsWithdrawalEventData['wallet'];
  /**
   * @see inflated {@link KatanaPerpsWithdrawalEventData.withdrawalId}
   */
  i: KatanaPerpsWithdrawalEventData['withdrawalId'];
  /**
   * @see inflated {@link KatanaPerpsWithdrawalEventData.asset}
   */
  a: KatanaPerpsWithdrawalEventData['asset'];
  /**
   * @see inflated {@link KatanaPerpsWithdrawalEventData.quantity}
   */
  q: KatanaPerpsWithdrawalEventData['quantity'];
  /**
   * @see inflated {@link KatanaPerpsWithdrawalEventData.quoteBalance}
   */
  qb: KatanaPerpsWithdrawalEventData['quoteBalance'];
  /**
   * @see inflated {@link KatanaPerpsWithdrawalEventData.gas}
   */
  g: KatanaPerpsWithdrawalEventData['gas'];
  /**
   * @see inflated {@link KatanaPerpsWithdrawalEventData.time}
   */
  t: KatanaPerpsWithdrawalEventData['time'];
}
