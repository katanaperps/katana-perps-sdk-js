import type {
  WebClientEvent,
  WebClientEventExchangeStatusAction,
} from '#types/enums/index';
import type { AnyObj } from '#types/utils';
import type { KatanaPerpsWebClientEventDataBase } from '../base.js';

interface KatanaPerpsWebClientEventDataExchangeStatusBase
  extends KatanaPerpsWebClientEventDataBase {
  readonly event: typeof WebClientEvent.exchange_status_updated;
  /**
   * @see enum {@link WebClientEventExchangeStatusAction}
   */
  readonly action: WebClientEventExchangeStatusAction;
  readonly payload?: AnyObj;
}

export interface KatanaPerpsWebClientEventDataExchangeStatusExchange
  extends KatanaPerpsWebClientEventDataExchangeStatusBase {
  readonly action: typeof WebClientEventExchangeStatusAction.controls_exchange;
  readonly wallet?: undefined;
  readonly payload?: undefined;
}

export interface KatanaPerpsWebClientEventDataExchangeStatusMarket
  extends KatanaPerpsWebClientEventDataExchangeStatusBase {
  readonly action: typeof WebClientEventExchangeStatusAction.controls_market;
  readonly wallet?: undefined;
  readonly payload: {
    market: string;
  };
}

export interface KatanaPerpsWebClientEventDataExchangeStatusWallet
  extends KatanaPerpsWebClientEventDataExchangeStatusBase {
  readonly action: typeof WebClientEventExchangeStatusAction.controls_wallet;
  readonly wallet: string;
  readonly payload?: undefined;
}

export type KatanaPerpsWebClientEventDataExchangeStatus =
  | KatanaPerpsWebClientEventDataExchangeStatusExchange
  | KatanaPerpsWebClientEventDataExchangeStatusMarket
  | KatanaPerpsWebClientEventDataExchangeStatusWallet;
