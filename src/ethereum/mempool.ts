import {ethers} from 'ethers';

export const watchPendingTransactions = ({
  provider,
  onPendingTransaction,
}: {
  readonly provider: ethers.providers.WebSocketProvider;
  readonly onPendingTransaction: (
    transactionResponse: ethers.providers.TransactionResponse
  ) => void;
}) => new Promise<void>(
  () => provider.on(
    'pending',
    transactionHash => provider
      .getTransaction(transactionHash)
      .then((transactionResponse: ethers.providers.TransactionResponse | null) =>
        !!transactionResponse
        && onPendingTransaction(transactionResponse)
      ),
  ),
);