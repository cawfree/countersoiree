import 'dotenv/config';

import * as fs from 'fs';
import * as path from 'path';

import {ethers} from 'ethers';
import {gql} from 'graphql-tag';

import {exec, watchPendingTransactions} from '../src';

const abi = new ethers.utils.Interface(
  JSON.parse(fs.readFileSync(path.resolve('__fixtures__', 'Seaport_v1_1.json'), 'utf-8')),
);

const {
  OFFERER_ADDRESS: maybeOffererAddress,
  // i.e. wss://:YOUR-PROJECT-SECRET@mainnet.infura.io/ws/v3/YOUR-PROJECT-ID
  WSS_PROVIDER_URI: maybeWssProviderUri,
} = process.env as Partial<Readonly<{
  OFFERER_ADDRESS: string;
  WSS_PROVIDER_URI: string;
}>>;

if (typeof maybeOffererAddress !== 'string' || !maybeOffererAddress.length)
  throw new Error(`Expected non-empty string OFFERER_ADDRESS, encountered "${
    String(maybeOffererAddress)
  }".`);

if (typeof maybeWssProviderUri !== 'string' || !maybeWssProviderUri.length)
  throw new Error(`Expected non-empty string WSS_PROVIDER_URI, encountered "${String(
    maybeWssProviderUri
  )}".`);

void (async () => {
  try {
    const offererAddress = ethers.utils.getAddress(maybeOffererAddress);

    const provider: ethers.providers.WebSocketProvider =
      new ethers.providers.WebSocketProvider(maybeWssProviderUri);

    const query = gql`
      query MyQuery {
        pendingTransaction(
          data: {
            interface: "function fulfillBasicOrder(tuple(address considerationToken, uint256 considerationIdentifier, uint256 considerationAmount, address offerer, address zone, address offerToken, uint256 offerIdentifier, uint256 offerAmount, uint8 basicOrderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 offererConduitKey, bytes32 fulfillerConduitKey, uint256 totalOriginalAdditionalRecipients, tuple(uint256 amount, address recipient)[] additionalRecipients, bytes signature) parameters) payable returns (bool fulfilled)"
            parameters: {
              offererAddress: "${offererAddress}"
            }
          }
        ) {
          data
        }
      }
    `;

    await watchPendingTransactions({
      provider,
      onPendingTransaction: (pendingTransaction: ethers.providers.TransactionResponse) => {
        // HACK: for now manually filter for only Seaport transactions since we're missing the
        //       ability to automatically cache.
        if (pendingTransaction.to !== '0x00000000006c3852cbEf3e08E8dF289169EdE581')
          return;

        const {pendingTransaction: maybeResult} = exec({
          abi,
          pendingTransaction,
          query,
        });

        if (!maybeResult) return;
        console.log(maybeResult);
      },
    });

  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
})();
