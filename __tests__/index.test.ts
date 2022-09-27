import 'jest';

import * as fs from 'fs';
import * as path from 'path';

import {ethers} from 'ethers';
import {gql} from 'graphql-tag';

import {
  exec,
  fetchAbi,
  getMaybeFunctionForMaybeInterface,
  getEtherscanApiUrl,
  maybeInterfaceToFunctionIdentifier,
  PendingTransaction,
} from '../src';

const {ETHERSCAN_KEY: etherscanKey} = process.env as Readonly<{
  ETHERSCAN_KEY: string;
}>;

const OPENSEA_SEAPORT_V_1_1_ADDRESS_CREATE2 = '0x00000000006c3852cbEf3e08E8dF289169EdE581';
const OPENSEA_SEAPORT_V_1_1_FULFILL_BASIC_ORDER = /* ethers */
  'function fulfillBasicOrder(tuple(address,uint256,uint256,address,address,address,uint256,uint256,uint8,uint256,uint256,bytes32,uint256,bytes32,bytes32,uint256,tuple(uint256,address)[],bytes)) payable returns (bool)';

jest.setTimeout(30 * 1000);

function loadFixture<T = unknown>({path: p}: {
  readonly path: string;
}) {
  return JSON.parse(fs.readFileSync(path.resolve('__fixtures__', `${p}.json`), 'utf-8')) as T;
}

const loadSeaportv1_1 = () => new ethers.utils.Interface(
  loadFixture({path: 'Seaport_v1_1'}),
);

const loadEthereum_Seaport_5secs = () => loadFixture<readonly PendingTransaction[]>({
  path: 'Ethereum_Seaport_5secs',
});

describe('countersoiree', () => {
  it('fixtures', () => {
    expect(loadSeaportv1_1()).toBeTruthy();
    expect(loadEthereum_Seaport_5secs()).toBeTruthy();
  });

  it('seaport_v11::abi', () => {

    [undefined, '', null]
      .forEach(maybeInterface => expect(
        getMaybeFunctionForMaybeInterface({
          abi: loadSeaportv1_1(),
          maybeInterface,
        }),
      ).toBe(false),
    );

    expect(
      maybeInterfaceToFunctionIdentifier({
        interfaceString: OPENSEA_SEAPORT_V_1_1_FULFILL_BASIC_ORDER,
      })
    ).toBe('fulfillBasicOrder');

    expect(
      getMaybeFunctionForMaybeInterface({
        abi: loadSeaportv1_1(),
        maybeInterface: OPENSEA_SEAPORT_V_1_1_FULFILL_BASIC_ORDER,
      }),
    ).toMatchSnapshot();
  });

  it('etherscan', async () => {
      expect({
        default: getEtherscanApiUrl({}),
        mainnet: getEtherscanApiUrl({network: 'mainnet'}),
        arbitrum: getEtherscanApiUrl({network: 'arbitrum'}),
        arbitrum_rinkeby: getEtherscanApiUrl({network: 'arbitrum_rinkeby'}),
      }).toMatchSnapshot();

      const etherscanAbi = await fetchAbi({
        network: 'mainnet',
        etherscanKey,
        contractAddress: OPENSEA_SEAPORT_V_1_1_ADDRESS_CREATE2,
      });

      expect(etherscanAbi).toMatchSnapshot();
  });

  it('Ethereum_Seaport_5secs:hash', () => {
    const query = gql`
      {
        pendingTransaction {
          hash
        }
      }
    `;

    expect(
      loadEthereum_Seaport_5secs()
        .map(pendingTransaction => exec({
          abi: loadSeaportv1_1(),
          query,
          pendingTransaction,
        })),
    ).toMatchSnapshot();
  });

  it('Ethereum_Seaport_5secs:hash,data,from,to', () => {
    const query = gql`
      {
        pendingTransaction {
          hash
          data
          from
          to
        }
      }
    `;

    expect(
      loadEthereum_Seaport_5secs()
        .map(pendingTransaction => exec({
          abi: loadSeaportv1_1(),
          query,
          pendingTransaction,
        })),
    ).toMatchSnapshot();
  });

  it('Ethereum_Seaport_5secs:where#to_empty', () => {
    const query = gql`
      query MyQuery {
        pendingTransaction(
          to: ""
        ) {
          hash
        }
      }
    `;

    expect(
      loadEthereum_Seaport_5secs()
        .map(pendingTransaction => exec({
          abi: loadSeaportv1_1(),
          query,
          pendingTransaction,
        })),
    ).toMatchSnapshot();
  });
  it('Ethereum_Seaport_5secs:where#to_seaport', () => {
    const query = gql`
      query MyQuery {
        pendingTransaction(
          to: "${OPENSEA_SEAPORT_V_1_1_ADDRESS_CREATE2}"
        ) {
          hash
        }
      }
    `;

    expect(
      loadEthereum_Seaport_5secs()
        .map(pendingTransaction => exec({
          abi: loadSeaportv1_1(),
          query,
          pendingTransaction,
        })),
    ).toMatchSnapshot();
  });
});
