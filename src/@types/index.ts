import {ethers} from 'ethers';

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

export type PendingTransaction = ethers.providers.TransactionResponse;

export type TransactionDescriptionResult = ethers.utils.TransactionDescription['args'];

export type EthersFunctionParameters = readonly ethers.utils.ParamType[];
//export type FunctionFragmentInputs = ethers.utils.FunctionFragment['inputs'];
