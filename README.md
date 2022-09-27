# countersoiree 💃
🧪 A [__GraphQL__](https://www.apollographql.com/) interface to the [__Ethereum__](https://ethereum.org) mempool.

The goal of this project is to enable developers to easily declare expressive filters that search for specific unmined, pending transactions.

There are a number of interesting applications that would be enabled via thorough inspection of the mempool, including but not limited to: profit searching, alerts generation, passive analysis, and active responses to pending transactions through higher-gas overrides.

> ⚠️ Fren, this project is still in development. Feel free to poke around, but don't get too attached.

## 🍝 build from sauce

To build this project, just [__clone__](https://rogerdudler.github.io/git-guide/) the repository, install dependencies and configure your environment variables for this project.

Since [`countersoiree`](https://github.com/cawfree/countersoiree) depends on using the ABI to parse input queries, it depends on [__etherscan__](https://etherscan.io) as a centralization vector to source smart contract interface definitions dynamically. To avoid single points of failure, a goal of this project is to enable the developer to manually supply contract ABI, or specify alternative providers.

```shell
git clone https://github.com/cawfree/countersoiree
cd countersoiree
yarn
echo "ETHERSCAN_KEY=\"YOUR_ETHERSCAN_KEY\"" >> .env
yarn test
```

## ✍️ usage

[`countersoiree`](https://github.com/cawfree/countersoiree) projects pending transactions in the Ethereum mempool, interpreted via a [`ethers.providers.TransactionResponse`](https://docs.ethers.io/v5/api/providers/types/), onto a corresponding [__GraphQL Schema__](./schema.graphql). In turn, this permits any pending transactions polled using [`ethers`](https://ethers.io/) into a queryable interface.

#### 1. Basic Example

We can pick fields of interest from the `pendingTransaction` collection, which uniquely identifies a single transaction from the mempool.

In practice, the contents of the mempool are accumulated asynchronously via WebSockets; therefore the `pendingTransaction` interface can be used as a boolean filter against a single transaction scalar:

```graphql
{
  pendingTransaction {
    to
    from
    hash
    maxFeePerGas
    maxPriorityFeePerGas
  }
}
```

#### 2. Using Filters

We can filter `pendingTransaction`s using query parameters. In the example below, we can pass a `string` scalar to the `"to"` property of the entity to ensure only match on a specific target address.

Here, we specify that we only want to read the `data` field on pending transactions which target [__Seaport v1.1__](https://etherscan.io/address/0x00000000006c3852cbef3e08e8df289169ede581).

```graphql
query SeaportTransactions {
  pendingTransaction(
    to: "0x00000000006c3852cbEf3e08E8dF289169EdE581"
  ) {
    data
  }
}
```

So it's a little useful to be able to watch transactions at a specific contract address (at this point we are a glorified [__event listener__](https://docs.ethers.io/v5/api/providers/provider/#Provider--events)), but it'd be even better to only watch for specific function calls on the smart contract.

In the following example, we specify that we only want to match on pending transactions where the data property targets the `external` `fulfillBasicOrder` function:

```graphql
query SeaportFulfillBasicOrderTransactions {
  pendingTransaction(
    to: "0x00000000006c3852cbEf3e08E8dF289169EdE581"
    data: {
      interface: "function fulfillBasicOrder(tuple(address considerationToken, uint256 considerationIdentifier, uint256 considerationAmount, address offerer, address zone, address offerToken, uint256 offerIdentifier, uint256 offerAmount, uint8 basicOrderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 offererConduitKey, bytes32 fulfillerConduitKey, uint256 totalOriginalAdditionalRecipients, tuple(uint256 amount, address recipient)[] additionalRecipients, bytes signature) parameters) payable returns (bool fulfilled)"
    }
  ) {
    data
  }
}
```

In this instance, implementors must take care to specify the function signature correctly.

## ✌️ license
[__MIT__](./LICENSE)
