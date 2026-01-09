import type { MessageEventType } from '#types/enums/index';
import type { KatanaPerpsFundingPayment } from '#types/rest/endpoints/GetFundingPayments';
import type { Expand } from '#types/utils';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `fundingPayments` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KatanaPerpsSubscriptionEventBase
 *
 * @category WebSocket - Message Types
 * @category KatanaPerps - Get Funding Payments
 *
 * @see data {@link KatanaPerpsFundingPaymentEventData}
 */
export interface KatanaPerpsFundingPaymentEvent
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.fundingPayments;
  /**
   * - Includes all {@link KatanaPerpsFundingPayment} properties as well as a `wallet` property.
   *
   * @see type {@link KatanaPerpsFundingPaymentEventData}
   */
  data: Expand<KatanaPerpsFundingPaymentEventData>;
}

/**
 * WebSocket position messages are identical to the REST API response
 * except they also include the `wallet` property.
 *
 * @see parent  {@link KatanaPerpsFundingPaymentEvent}
 *
 * @category WebSocket - Message Types
 */
export interface KatanaPerpsFundingPaymentEventData
  extends KatanaPerpsFundingPayment {
  /**
   * Wallet address
   */
  wallet: string;
}

export interface WebSocketResponseSubscriptionMessageShortFundingPayments
  extends KatanaPerpsSubscriptionEventBase {
  type: typeof MessageEventType.fundingPayments;
  data: WebSocketResponseFundingPaymentsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseFundingPaymentsShort {
  /**
   * @see inflated {@link KatanaPerpsFundingPaymentEventData.wallet}
   */
  w: KatanaPerpsFundingPaymentEventData['wallet'];
  /**
   * @see inflated {@link KatanaPerpsFundingPaymentEventData.market}
   */
  m: KatanaPerpsFundingPaymentEventData['market'];
  /**
   * @see inflated {@link KatanaPerpsFundingPaymentEventData.paymentQuantity}
   */
  Q: KatanaPerpsFundingPaymentEventData['paymentQuantity'];
  /**
   * @see inflated {@link KatanaPerpsFundingPaymentEventData.positionQuantity}
   */
  q: KatanaPerpsFundingPaymentEventData['positionQuantity'];
  /**
   * @see inflated {@link KatanaPerpsFundingPaymentEventData.fundingRate}
   */
  f: KatanaPerpsFundingPaymentEventData['fundingRate'];
  /**
   * @see inflated {@link KatanaPerpsFundingPaymentEventData.indexPrice}
   */
  ip: KatanaPerpsFundingPaymentEventData['indexPrice'];
  /**
   * @see inflated {@link KatanaPerpsFundingPaymentEventData.time}
   */
  t: KatanaPerpsFundingPaymentEventData['time'];
}
