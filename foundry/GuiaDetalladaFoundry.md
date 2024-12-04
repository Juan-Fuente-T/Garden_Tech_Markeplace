### Also see Foundry Book (https://book.getfoundry.sh/), Foundry cheatsheet (https://github.com/dabit3/foundry-cheatsheet), and this video tutorial (https://www.youtube.com/watch?v=uelA2U9TbgM)

### Things that we'll be covering

- Testing & assertions
- Fuzzing
- Logging
- Running a local node
- Deploying a contract to the local node
- Calling contracts from the CLI
- Installing and using libraries
- Configuring remappings
- Mocking users

In this workshop you'll learn how to build, test, and deploy smart contracts with Solidity using Foundry (https://github.com/foundry-rs/foundry). We'll start with an overview of the various CLIs and libraries that make up Foundry, what they do, and how to install them.

We'll then spin up a new project, walk through the file structure, and create an example smart contract. From there we'll create and run tests for the contract. Next, we'll run a local test Ethereum network, deploy the contract to the network, and use cast to call end execute transactions to the test network.

We'll then deploy the to Optimism to show how to deploy to a live network. Finally, we'll create an ERC721 contract and learn how to mock users to test out various functions like minting a token, transferring a token, and burning a token.

By the end of this workshop, you should have a good understanding of how Foundry works and how to use it to build, test, and deploy smart contracts.
Prerequisites

To use Foundry, you must have Rust installed on your machine.
Foundry Overview

Paradigm's description of Foundry is that Foundry is a portable, fast and modular toolkit for Ethereum application development.

It fits into the stack the same way that Hardhat, Truffle, and Dapp Tools do.

##### The main differences / selling points of Foundry are:

- It allows you to write your tests and scripts in Solidity instead of JavaScript.

- They make a great case about why writing tests in Solidity VS JavaScript is better, and they are spot on with most of their points.

- There is just a lot less boilerplate and a lot less mental overhead. Once you write a few tests in Solidity you feel the difference.

- It's fast.

- Foundry is written in Rust and it is fast. They've documented a few benchmarks here, but it's hard to do it justice until you use it (especially after using an alternative).

- Fuzzing - Fast fuzz testing with shrinking of inputs & printing of counter-examples

- Flexible debug logging - dappTools-style, using DsTest's emitted logs, or Hardhat-style, using the console.sol contract

- Fast CI with the Foundry GitHub action (https://github.com/foundry-rs/foundry-toolchain).

- Cast (https://github.com/foundry-rs/foundry/tree/master/cast) - Cast is Foundry's command-line tool for performing Ethereum RPC calls. You can make smart contract calls, send transactions, or retrieve any type of chain data - all from your command-line!

## Foundry

- Foundry is made up of 3 CLI tools - Forge, Cast, and Anvil (https://github.com/foundry-rs/foundry/tree/master/anvil).

- Forge is the Ethereum development and testing framework.

- Cast is a CLI that allows you to interact with EVM smart contracts, send transactions, and read data from the network.

- Anvil is a local Ethereum node, similar to Ganache or Hardhat node.

Building & testing a smart contract with Foundry
Prerequisites

- To install Foundry, you must first have Rust installed on your machine.

VS Code Solidity configuration

- If you're using VS Code, consider setting up the following Solidity configurations so that your text editor knows where to find the dependencies and your Solidity code by setting:

  Package Default Dependencies Contracts Directory as src
  Package Default Dependencies Directory as lib
  !["Imagen detalle de foundry"](./foundry1.png) CORREGIR-CORREGIR-CORREGIR-CORREGIR-CORREGIR-CORREGIR-CORREGIR-CORREGIR-CORREGIR-

- Solidity configuration

##### Let's build

    If you have any issues with the installation instructions, you can see more detailed instructions here.

##### To get started, we'll install the latest release:

curl -L https://foundry.paradigm.xyz | bash

##### This will download foundryup. Then install Foundry by running:

foundryup

##### Next, in an empty directory, we can use the init command to initialize a new project:

forge init

The forge CLI will create a few files and folders, including lib, src, script, and test.

The lib directory contains forge-std, a collection of helpful contracts for use with forge and foundry.

The src directory contains a barebones smart contract.

The test directory contains an example test.

The script directory contains an example script.

##### Let's create a basic smart contract to test out. Rename Counter.sol to HelloWorld.sol and update it with the following:

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract HelloWorld {
string private greeting;
uint public version = 0;

constructor (string memory \_greeting) {
greeting = \_greeting;
}

function greet() public view returns(string memory) {
return greeting;
}

function updateGreeting(string memory \_greeting) public {
version += 1;
greeting = \_greeting;
}
}

##### Next, let's update the name of test/Counter.t.sol to test/HelloWorld.t.sol and add the following code:

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import 'src/HelloWorld.sol';

contract HelloWorldTest is Test {
HelloWorld hello;
function setUp() public {
hello = new HelloWorld("Foundry is fast!");
}

    function test1() public {
        assertEq(
            hello.greet(),
            "Foundry is fast!"
        );
    }

    function test2() public {
        assertEq(hello.version(), 0);
        hello.updateGreeting("Hello World");
        assertEq(hello.version(), 1);
        assertEq(
            hello.greet(),
            "Hello World"
        );
    }

}

##### Next, we can run a build and compile the ABIs:

forge build

This should create an out directory containing the ABIs for both the main contract as well as the test.

### Tests

Forge comes built in with some really great testing features like assertions and gas cost snapshots.

In our test we've asserted equality using the assertEq utility.

##### To run the test, we can run:

forge test

##### When the test is run, we'll see output for not only the success of the test, but also the gas cost:

forge test output

!["Imagen detalle de foundry"](./forge-test.png) CORREGIR-CORREGIR-CORREGIR-CORREGIR-CORREGIR-CORREGIR-CORREGIR-CORREGIR-CORREGIR-

##### There are also utilities for:

truthiness - assertTrue

decimal equality - assertEqDecimal

greater than, less than - assertGt, assertGe, assertLt, assertLe`

You can view most of the assertions here (https://book.getfoundry.sh/reference/ds-test#asserting).

### Fuzzing

Foundry also supports fuzzing (https://en.wikipedia.org/wiki/Fuzzing).

This allows us to define function parameter types and the testing framework will populate these values at runtime.

If it does find an input that causes the test to fail, it will return it so you can create a regression test.

For instance, we can update the test2 function to receive a function argument, and use the value in our test without ever having to define what it is:

function test2(string memory \_greeting) public {
assertEq(hello.version(), 0);
hello.updateGreeting(\_greeting);
assertEq(hello.version(), 1);
assertEq(
hello.greet(),
\_greeting
);
}

Now when we run the test, Foundry will automatically populate the \_greeting variable when the test is run.

### Logging

Foundry also supports logging.

##### To log out the greeting, we can use log, log_string, or log_named_string:

function test2() public {
assertEq(hello.version(), 0);
hello.updateGreeting("Hello World");
assertEq(hello.version(), 1);
string memory value = hello.greet();
emit log(value);
assertEq(
hello.greet(),
"Hello World"
);
}

##### To print the logs, we need to run the test script with the -vv flag:

forge test -vv

#####To learn more about logs and traces, check out the documentation here (https://book.getfoundry.sh/forge/tests?highlight=-vv#logs-and-traces).

To view all of the supported logging methods, check out the documentation here (https://book.getfoundry.sh/reference/ds-test#logging).

### Anvil

##### You can start the local EVM test network at any time:

anvil

This will start a local network and spin up 10 accounts and private keys and log them out to the console. (USAR con Git bash o wsl)

##### Once the network is running, we can use forge to deploy the contract to the network.

To do so, update the name of script/Counter.s.sol to script/HelloWorld.s.sol

Next, update the script in script/HelloWorld.s.sol:

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import { HelloWorld } from 'src/HelloWorld.sol';

contract ContractScript is Script {
function setUp() public {}

    function run() public {
        vm.broadcast();
        new HelloWorld("Hello from Foundry!");
    }

}

##### Next, set the PRIVATE_KEY variable by using one of the private keys given to you by Anvil:

export PRIVATE_KEY=<your-private-key>

##### To deploy, run this script:

forge script script/HelloWorld.s.sol:ContractScript --fork-url http://localhost:8545 \
--private-key $PRIVATE_KEY --broadcast

MI PRUEBA: forge script script/SupplyChainToken.s.sol:SupplyChainTokenScript --fork-url http://localhost:8545 --private-key $PRIVATE_KEY --broadcast

MI RESPUESTA: Compiler run successful!
EIP-3855 is not supported in one or more of the RPCs used.
Unsupported Chain IDs: 31337.
Contracts deployed with a Solidity version equal or higher than 0.8.20 might not work properly.
For more information, please see https://eips.ethereum.org/EIPS/eip-3855
Script ran successfully.

== Logs ==
SupplyChainToken contract deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 2416612

Estimated amount required: 0.004833224002416612 ETH

==========================

##### anvil-hardhat

✅ [Success]Hash: 0x96d35aff1a34622634b69300f948b909d5ca0d0086f0dccb485320036a49702c
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.001859467001859467 ETH (1859467 gas \* 1.000000001 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.001859467001859467 ETH (1859467 gas \* avg 1.000000001 gwei)

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: C:/Users/Juan/Desktop/Mis_proyectos/Solidity/SupplyChain_with_accountAbstraction/foundry/broadcast\SupplyChainToken.s.sol\31337\run-latest.json

Sensitive values saved to: C:/Users/Juan/Desktop/Mis_proyectos/Solidity/SupplyChain_with_accountAbstraction/foundry/cache\SupplyChainToken.s.sol\31337\run-latest.json

##### Once the contract is deployed, the contract address will be logged out to your terminal.

Set the CONTRACT_ADDRESS variable in your terminal:

export CONTRACT_ADDRESS=<your-contract-address>

We can then use cast to interact with it.

##### For read operations, we can use cast call:

cast call $CONTRACT_ADDRESS "greet()(string)" (call para leer de la blockchain)
cast call 0x0679b3A74ebCD2edD44566c98F0E1fa16F3cfeFA "getAllNFTs(uint256, uint256)" 0 2 --rpc-url https://eth-sepolia.g.alchemy.com/v2/QF_rlvr4V0ZORimK7ysBA4mJvl0Bk47c --private-key 0xc45f85a5ec0d4bd6c655c9fc2c505c3b6576a9d81e73635f77deb457aa68f3d9

cast call 0x0679b3A74ebCD2edD44566c98F0E1fa16F3cfeFA "getMyNFTs()" --rpc-url https://eth-sepolia.g.alchemy.com/v2/QF_rlvr4V0ZORimK7ysBA4mJvl0Bk47c --private-key 0xc45f85a5ec0d4bd6c655c9fc2c505c3b6576a9d81e73635f77deb457aa68f3d9

##### To test that the greeting has been updated, run the call command again:

cast call $CONTRACT_ADDRESS "greet()(string)"
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "totalSupply()(uint256)"

##### For transactions, we can use cast send, passing in a private key and any arguments:

cast send $CONTRACT_ADDRESS "updateGreeting(string)" "My new greeting" --private-key $PRIVATE_KEY

cast send $CONTRACT_ADDRESS "mint(address,uint256,uint256)" "0x9b61b997299b35064CAf001bfeA9C778973bF436" 1 1 --private-key $PRIVATE_KEY (send para escribir en la blockchain)

Ejemplo de respuesta exitosa:

blockHash 0xd9cf8a57e660f5245502d501aa4a23255743268eb5b94951fc2acd5596b56e3a
blockNumber 4
contractAddress
cumulativeGasUsed 53057
effectiveGasPrice 693984958
from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed 53057
logs [{"address":"0xe7f1725e7734ce288f8367e1bb143e90bb3f0512","topics":["0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62","0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000009b61b997299b35064caf001bfea9c778973bf436"],"data":"0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001","blockHash":"0xd9cf8a57e660f5245502d501aa4a23255743268eb5b94951fc2acd5596b56e3a","blockNumber":"0x4","blockTimestamp":"0x66d759c1","transactionHash":"0x3b4d171b918b4e6ea044194ee2b9d7f079c10c4ae00d7a0ed1cb45df1a49f3b4","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000002000000000000000000000002000000000000000000000000000000000000000000000000000020000000000000100000800000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000001000000000002008000000000000000020000000000000000000000000000000000000000000000000800002080000000000
root 0x23b9809538f41fcafd890efa2a4d56faafc3cd5e3aa3481b88e06f4eaa7ab63c
status 1 (success)
transactionHash 0x3b4d171b918b4e6ea044194ee2b9d7f079c10c4ae00d7a0ed1cb45df1a49f3b4
transactionIndex 0
type 2
blobGasPrice 1
blobGasUsed
to 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

## Installing packages

You can install packages using the forge install command.

##### To try this out, let's install OpenZeppelin Contracts, then we'll use them to create an ERC721 token:

    You may need to add and commit any changes to your code to git in order to run the install script.

forge install OpenZeppelin/openzeppelin-contracts

##### Next, create a file named remappings.txt in the root of the project and add the following configuration:

@openzeppelin/=lib/openzeppelin-contracts/

##### This will allow us to easily import with the following syntax:

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

##### You can view all of the automatically inferred remappings for the project by running the following command:

forge remappings

## ERC721 contract

With OpenZeppelin Contracts installed, let's create a new file named ERC721.sol in the src directory and add the following code:

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DevconPanda is ERC721URIStorage {
using Counters for Counters.Counter;
Counters.Counter private \_tokenIds;

    constructor() ERC721("DevconPanda", "DCP") {}

    function mint(address user, string memory tokenURI) public returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _mint(user, newItemId);
        _setTokenURI(newItemId, tokenURI);

        _tokenIds.increment();
        return newItemId;
    }

}

##### Next, let's write the test.

In the test directory, create a new file named ERC721.t.sol and add the following code:

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import 'src/ERC721.sol';

contract ERC721Test is Test {
DevconPanda devconPanda;
address noah = address(0x1);
address sofia = address(0x2);

    function setUp() public {
      devconPanda = new DevconPanda();
    }

    function testMint() public {
      devconPanda.mint(noah, "testhash");
      address owner_of = devconPanda.ownerOf(0);
      assertEq(noah, owner_of);
    }

}

##### The testMint function will test that we have minted a token, and that the owner of that token belongs to the expected owner.

To try it out, run the test command:

forge test

As you can see, this command will run every test in the entire project.

##### If you'd like to only test a certain contract, you can run this command:

forge test --match-contract ERC721

### Mocking another user

Next let's look at the prank cheatcode.

prank sets msg.sender to the specified address for the next call. "The next call" includes static calls as well, but not calls to the cheat code address.

This will allow us to mock, or simulate, whatever user we'd like to simulate in our test.

You can also use startPrank which will set msg.sender for all subsequent calls until stopPrank is called.

Let's try using prank to transfer a token to another user.

Because we will be simulating the token owner, we should be able to transfer the token. If we were not simulating the token owner, the test should fail (feel free to give it a shot!).

##### To test this out, add the following function to the test:

function testTransfer() public {
devconPanda.mint(noah, "testhash");
vm.startPrank(noah);
devconPanda.safeTransferFrom(noah, sofia, 0);

address ownerOf = devconPanda.ownerOf(0);
assertEq(sofia, ownerOf);
}

##### Finally, let's check the balance of a user's address:

function testBalance() public {
devconPanda.mint(sofia, "testhash");
devconPanda.mint(sofia, "testhash");
devconPanda.mint(sofia, "testhash");

uint balance = devconPanda.balanceOf(sofia);
assertEq(balance, 3);
}

### Test coverage

##### You can check for test coverage by running the coverage command:

forge coverage

##### To debug in more details what has not been covered, use the debug report:

forge coverage --report debug

##### To create a coverage level report to see with Goverage Gutters: Display Coverage

forge coverage --mc Proxy1967GardenTechMarketplaceTest --report lcov

To learn more about what you can do with test coverage, check out this blog post (https://mirror.xyz/devanon.eth/RrDvKPnlD-pmpuW7hQeR5wWdVjklrpOgPCOA-PJkWFU) or run forge coverage --help

## Conclusion

To learn more, check out the Foundry Book (https://book.getfoundry.sh/), Foundry cheatsheet(https://github.com/dabit3/foundry-cheatsheet), and this video tutorial(https://www.youtube.com/watch?v=uelA2U9TbgM)

## Conectar Foundry a Remix

- Inicia Anvil. Abre tu terminal y ejecuta:

anvil

Esto iniciará un nodo local de Ethereum con Anvil y te dará la URL del RPC, que generalmente es http://127.0.0.1:8545.

- Configura Remix IDE, accede a la Sección de "Deploy & Run Transactions", en el panel izquierdo.

Esta sección te permite configurar el entorno de despliegue.

En la parte superior de la pestaña "Deploy & Run Transactions", verás un desplegable llamado "Environment".

Selecciona la opción "Custom Provider".

- Introduce la URL del RPC de Anvil

Aparecerá un cuadro de texto donde debes ingresar la URL del RPC de Anvil. Introduce http://127.0.0.1:8545 (o la URL que te haya proporcionado Anvil).

Puedes agregar también una clave privada si deseas, aunque no es necesario para la conexión.

Una vez que hayas ingresado la URL, Remix IDE se conectará a Anvil.

Ahora podrás desplegar contratos inteligentes y realizar transacciones como lo harías en una red de Ethereum, pero en tu entorno local proporcionado por Anvil.

## Conectar Foundry a la Dapp

- Configurar el proveedor de Anvil (asegúrate que Anvil está corriendo en http://localhost:8545)

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
