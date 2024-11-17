     // SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "../lib/forge-std/src/Script.sol";
import "../src/GardenTechMarketplace.sol";

//es necesario agregar el RPC_URl y la ETHERSCAN_API_KEY AL foundry.toml

//contract Proxy1967UUPSScript is Script {
contract GardenTechMarketplaceScript is Script {
    function setUp() public {}

    function run() external {
     uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        GardenTechMarketplace gardenTechMarketplace = new GardenTechMarketplace();
        console2.log("implementation address: ", address(gardenTechMarketplace));
        vm.stopBroadcast();
    }
}