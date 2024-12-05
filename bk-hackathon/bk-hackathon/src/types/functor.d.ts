declare module '../utils/functor' {
  export function createSmartAccount(
    walletAddress: string,
    allowedAddresses: string[],
  ): Promise<string>

  export function createSessionKey(smartAccountAddress: string): Promise<string>
}
