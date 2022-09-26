import {ethers} from 'ethers';

import schema from '../../schema.graphql';

import {PendingTransaction} from '../@types';

export const exec = ({
  abi,
  pendingTransaction,
}: {
  readonly abi: ethers.utils.Interface;
  readonly pendingTransaction: PendingTransaction;
}) => {

};
