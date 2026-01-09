import type { MessageEventType } from '#types/enums/index';
import type { KatanaPerpsSubscriptionEventBase } from '#types/webSocket/base';
import type {
  KatanaPerpsWebClientEventDataReloadBanners,
  KatanaPerpsWebClientEventDataExchangeStatus,
  KatanaPerpsWebClientEventDataTxSettled,
} from './events/index.js';

export type KatanaPerpsWebClientEventData =
  | KatanaPerpsWebClientEventDataReloadBanners
  | KatanaPerpsWebClientEventDataExchangeStatus
  | KatanaPerpsWebClientEventDataTxSettled;

export interface KatanaPerpsWebClientEvent
  extends KatanaPerpsSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  readonly type: typeof MessageEventType.webclient;
  readonly data: KatanaPerpsWebClientEventData;
}

export type WebSocketResponseSubscriptionMessageShortWebClient =
  KatanaPerpsWebClientEvent;
