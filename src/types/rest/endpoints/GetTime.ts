/**
 * `/v1/time`
 *
 * @see [API Documentation](https://api-docs-v1-perps.katana.network/#get-time)
 *
 * @category KatanaPerps - Get Time
 */
export interface RestResponseGetTime {
  /**
   * Current server time in `UTC`
   */
  serverTime: number;
}
