export type EtherscanNetwork =
  | 'mainnet'
  | 'morden'
  | 'ropsten'
  | 'rinkeby'
  | 'arbitrum'
  | 'arbitrum_rinkeby'

export type EtherscanProps = {
  readonly etherscanKey: string;
  readonly network: EtherscanNetwork;
};