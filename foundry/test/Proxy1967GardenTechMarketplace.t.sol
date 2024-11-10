// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
// import {Test, console, console2} from "forge-std/src/Test.sol";
import {Test, console, console2} from "../lib/forge-std/src/Test.sol";
import { Proxy1967GardenTechMarketplace } from "../src/Proxy1967GardenTechMarketplace.sol";
import { GardenTechMarketplace } from "../src/GardenTechMarketplace.sol";
import { IGardenTechMarketplace } from "../src/IGardenTechMarketplace.sol";
import { NFTMarketplace } from "../src/NFTMarketplace.sol";
contract Proxy1967GardenTechMarketplaceTest is Test {
    // struct ListedToken {
    //     uint256 tokenId;
    //     uint256 price;
    //     address payable owner;
    //     address payable seller;
    //     bool currentlyListed;
    // }

     //_tokenIds variable has the most recent minted tokenId
    uint128 private _tokenIds;
    //Keeps track of the number of items sold on the marketplace
    uint128 private _itemsSold;
    //owner is the contract address that created the smart contract
    address payable owner;
    //The fee charged by the marketplace to be allowed to list an NFT
    uint256 listPrice = 0.01 ether;
    //The name of  the NFT Marketplace 
    string public marketplaceName; 
    address alice;
    address bob;
    address carol;

    uint256 sepoliaFork;
    string SEPOLIA_RPC_URL = vm.envString("SEPOLIA_RPC_URL");
    Proxy1967GardenTechMarketplace public proxy;
    GardenTechMarketplace public gardenTech;
    NFTMarketplace public nftMarketplace;
    // GardenTechMarketplace public gardenTechV2;

    event TokenListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );
   
    // error CallFailed();

    ////////////////////////////////////////////////////////////////
    ///                         SETUP                            ///
    ////////////////////////////////////////////////////////////////

    function setUp() public {
        vm.createSelectFork(SEPOLIA_RPC_URL);
        assertEq(vm.activeFork(), sepoliaFork);
        gardenTech = new GardenTechMarketplace();
        // gardenTechV2 = new GardenTechMarketplace();
        nftMarketplace = new NFTMarketplace();

        proxy = new Proxy1967GardenTechMarketplace(
            address(gardenTech),
            abi.encodeWithSignature(
                "initialize(string)",
                "GardenTechMarketplace"
            )
        );

        alice = makeAddr("alice");
        bob = makeAddr("bob");
    }

    ////////////////////////////////////////////////////////////////
    ///                   test Miscelanea                    ///
    ////////////////////////////////////////////////////////////////

    function testInitialize() public {
        // IGardenTechMarketplace(payable(address(proxy))).initialize("GardenTechMarketplace");
        assertEq(
            IGardenTechMarketplace(payable(address(proxy))).marketplaceName(),
            "GardenTechMarketplace"
        );
        assertEq(IGardenTechMarketplace(payable(address(proxy))).owner(), address(this));
        vm.expectRevert(abi.encodeWithSignature("InvalidInitialization()"));
        IGardenTechMarketplace(payable(address(proxy))).initialize(
            "GardenTechMarketplace"
        );
    }

    function testUpgradeToAndCall() public {
          assertEq(
        IGardenTechMarketplace(payable(address(proxy))).marketplaceName(),
        "GardenTechMarketplace"
    );
        IGardenTechMarketplace(payable(address(proxy))).upgradeToAndCall(
            address(nftMarketplace),
            ""
        );
    
    // Comprobar que el owner sigue siendo el mismo
    assertEq(IGardenTechMarketplace(payable(address(proxy))).owner(), address(this));

    assertNotEq(
        IGardenTechMarketplace(payable(address(proxy))).marketplaceName(),
        "NFTMarketplace"
    );
    assertEq(
        IGardenTechMarketplace(payable(address(proxy))).marketplaceName(),
        "GardenTechMarketplace"
    );
   
   vm.startPrank(alice);
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    IGardenTechMarketplace(payable(address(proxy))).upgradeToAndCall(
            address(gardenTech),
            ""
        ); 
    }

    function testReceive() public {
        (bool success, ) = address(proxy).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(proxy).balance, 1 ether);
    }

    function testFallback() public {
        (bool success, ) = address(proxy).call{value: 1 ether}(
            abi.encodeWithSignature("fallBackTest()")
        );
        assertTrue(success);
        assertEq(address(proxy).balance, 1 ether);
    }

    // function testOnERC721Received() public {
    //     startHoax(alice);
    //     assertEq(nft.ownerOf(1), alice);
    //     nft.approve(address(proxy), 1);
    //     nft.safeTransferFrom(alice, address(proxy), 1);
    //     assertEq(nft.ownerOf(1), (address(proxy)));
    // }
    ////////////////////////////////////////////////////////////////
    ///                   testCreateSaleOffer                    ///
    ////////////////////////////////////////////////////////////////

    function testCreateSellOffer() public {
        startHoax(alice, 1 ether);

        /////////////SELL OFFER 0//////////////
    //     nft.approve(address(proxy), 1);
    //     assertEq(nft.getApproved(1), address(proxy));
    //     vm.expectEmit();
    //     emit NewSellOffer(
    //         alice,
    //         address(nft),
    //         1,
    //         0.001 ether,
    //         block.timestamp + 1800,
    //         0
    //     );
    //     IMarketplaceBlockcoder(address(proxy)).createSellOffer(
    //         address(nft),
    //         1,
    //         0.001 ether,
    //         block.timestamp + 1800
    //     );
    //     assertEq(
    //         IMarketplaceBlockcoder(address(proxy)).sellOfferIdCounter(),
    //         1,
    //         "No se ha creado la Offer"
    //     );
    //     assertEq(nft.ownerOf(1), address(proxy));
    //     assertEq(
    //         IMarketplaceBlockcoder(address(proxy)).sellOfferIdCounter(),
    //         1
    //     );
    //     (
    //         nftAddress,
    //         offerer,
    //         tokenId,
    //         price,
    //         ,
    //         isEnded
    //     ) = IMarketplaceBlockcoder(address(proxy)).getSellOffer(0);
    //     assertEq(nftAddress, address(nft));
    //     assertEq(offerer, alice);
    //     assertEq(tokenId, 1);
    //     assertEq(price, 0.001 ether);
    //     assertEq(isEnded, false);

    }
}