// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "../lib/forge-std/src/Script.sol";
import "../src/GardenTechMarketplace.sol";
import "../src/Proxy1967GardenTechMarketplace.sol";

//es necesario agregar el RPC_URl y la ETHERSCAN_API_KEY AL foundry.toml

//contract Proxy1967UUPSScript is Script {
contract MyScript is Script {
    function setUp() public {}

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        //vm.broadcast();
        GardenTechMarketplace gardenTechMarketplace = new GardenTechMarketplace();
        Proxy1967GardenTechMarketplace proxy = new Proxy1967GardenTechMarketplace(
            address(gardenTechMarketplace),
            abi.encodeWithSignature("initialize()")
        );
        console.log("proxy address: ", address(proxy));
        vm.stopBroadcast();
    }
}