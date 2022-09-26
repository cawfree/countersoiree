import axios from 'axios';
import {ethers} from 'ethers';

import {EtherscanNetwork, EtherscanProps} from '../@types';

const ABI_FUNCTION_PREFIX = 'function ';

export const maybeInterfaceToFunctionIdentifier = ({
  interfaceString: maybeInterfaceString,
}: {
  readonly interfaceString: string;
}) => {
  const interfaceString = maybeInterfaceString.startsWith(ABI_FUNCTION_PREFIX)
    ? maybeInterfaceString.substring(ABI_FUNCTION_PREFIX.length)
    : maybeInterfaceString;

  return interfaceString.substring(0, interfaceString.indexOf('('));
};

export const getMaybeFunctionForMaybeInterface = ({
  abi,
  maybeInterface,
}: {
  readonly abi: ethers.utils.Interface;
  readonly maybeInterface: string | null | undefined;
}) => {
  const full = abi.format(ethers.utils.FormatTypes.full);
  const minimal = abi.format(ethers.utils.FormatTypes.minimal);

  if (typeof maybeInterface !== 'string' || !maybeInterface.length)
    return false;

  if (!full.includes(maybeInterface) && !minimal.includes(maybeInterface))
    return false;

  return abi.getFunction(
    // TODO: What about variadic arguments?
    maybeInterfaceToFunctionIdentifier({
      interfaceString: maybeInterface,
    })
  );
};

export const getEtherscanApiUrl = ({
  network = 'mainnet',
}: {
  readonly network?: EtherscanNetwork;
}) => {
  if (network === 'mainnet')
    return 'https://api.etherscan.io/api';

  return `http://api-${network}.etherscan.io/api`;
};

export const getEtherscanApiAbiUrl = ({
  network,
  contractAddress,
  etherscanKey,
}: EtherscanProps & {
  readonly network: EtherscanNetwork;
  readonly contractAddress: string;
}) => `${
  getEtherscanApiUrl({network})
}?module=contract&action=getabi&address=${
  contractAddress
}&format=raw&apikey=${
  etherscanKey
}`;

export const fetchAbi = async ({
  network,
  etherscanKey,
  contractAddress,
}: EtherscanProps & {
  readonly contractAddress: string;
}): Promise<ethers.utils.Interface> => {
  const {data} = await axios.get(getEtherscanApiAbiUrl({
    network,
    contractAddress,
    etherscanKey,
  }));

  return new ethers.utils.Interface(data);
};
