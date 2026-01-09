import type { MessageEventType } from '#types/enums/index';
import type { KatanaPerpsDeposit } from '#types/rest/endpoints/GetDeposits';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `deposits` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KatanaPerpsSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Deposits
 *
 * @see data {@link KatanaPerpsDepositEventData}
 */
export interface KatanaPerpsDepositEvent
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.deposits;
  /**
   * @inheritDoc KatanaPerpsDepositEventData
   *
   * @see type {@link KatanaPerpsDepositEventData}
   */
  data: KatanaPerpsDepositEventData;
}

/**
 * `deposits` events provide a specialized `data` property which is similar to {@link KatanaPerpsDeposit} with the following changes:
 *
 * - `depositId`, `quantity`, `asset`, and `time` are provided from the {@link KatanaPerpsDeposit} interface.
 * - WebSocket `deposits` events include additional exclusive properties:
 *   - {@link KatanaPerpsDepositEventData.wallet wallet}, {@link KatanaPerpsDepositEventData.quoteBalance quoteBalance}
 *
 * @see parent {@link KatanaPerpsDepositEvent}
 *
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Deposits
 */
export interface KatanaPerpsDepositEventData
  extends Pick<
    KatanaPerpsDeposit,
    'depositId' | 'quantity' | 'asset' | 'time'
  > {
  /**
   * Wallet address associated with the deposit message.
   */
  wallet: string;
  /**
   * Quote token balance after the deposit
   */
  quoteBalance: string;
}

export interface WebSocketResponseSubscriptionMessageShortDeposits
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.deposits;
  data: WebSocketResponseDepositsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseDepositsShort {
  /**
   * @see inflated {@link KatanaPerpsDepositEventData.wallet}
   */
  w: KatanaPerpsDepositEventData['wallet'];
  /**
   * @see inflated {@link KatanaPerpsDepositEventData.depositId}
   */
  i: KatanaPerpsDepositEventData['depositId'];
  /**
   * @see inflated {@link KatanaPerpsDepositEventData.asset}
   */
  a: KatanaPerpsDepositEventData['asset'];
  /**
   * @see inflated {@link KatanaPerpsDepositEventData.quantity}
   */
  q: KatanaPerpsDepositEventData['quantity'];
  /**
   * @see inflated {@link KatanaPerpsDepositEventData.quoteBalance}
   */
  qb: KatanaPerpsDepositEventData['quoteBalance'];
  /**
   * @see inflated {@link KatanaPerpsDepositEventData.time}
   */
  t: KatanaPerpsDepositEventData['time'];
}
