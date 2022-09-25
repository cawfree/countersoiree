import {ethers} from 'ethers';

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