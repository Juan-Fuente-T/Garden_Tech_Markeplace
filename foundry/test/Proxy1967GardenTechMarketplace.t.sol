// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;
// import {Test, console, console2} from "forge-std/src/Test.sol";
import {Test, console, console2} from "forge-std/Test.sol";
import { Proxy1967GardenTechMarketplace } from "../src/Proxy1967GardenTechMarketplace.sol";
import { GardenTechMarketplace } from "../src/GardenTechMarketplace.sol";
import { IGardenTechMarketplace } from "../src/IGardenTechMarketplace.sol";
import { NFTMarketplace } from "../src/NFTMarketplace.sol";

contract Proxy1967GardenTechMarketplaceTest is Test {
    struct ListedToken {
        uint256 tokenId;
        uint256 price;
        address payable owner;
        address payable seller;
        bool currentlyListed;
    }

    //Keeps track of the number of items sold on the marketplace
    uint128 private _itemsSold;
    //owner is the contract address that created the smart contract
    address payable owner;
    //The fee charged by the marketplace to be allowed to list an NFT
    // uint256 listPrice = 0.01 ether;
    //The name of  the NFT Marketplace 
    string public marketplaceName; 
    address alice;
    address bob;
    address carol;

    uint256 sepoliaFork;
    string SEPOLIA_RPC_URL = vm.envString("SEPOLIA_RPC_URL");
    Proxy1967GardenTechMarketplace public proxy;
    GardenTechMarketplace public gardenTech;
    // NFTMarketplace public nftMarketplace;
    GardenTechMarketplace public gardenTechV2;

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
        sepoliaFork = vm.createSelectFork(SEPOLIA_RPC_URL);
        assertEq(vm.activeFork(), sepoliaFork);
        gardenTech = new GardenTechMarketplace();
        gardenTechV2 = new GardenTechMarketplace();
        // nftMarketplace = new NFTMarketplace();

        proxy = new Proxy1967GardenTechMarketplace(
            address(gardenTech),
            abi.encodeWithSignature(
                "initialize(string)",
                "GardenTechMarketplace"
            )
        );

        alice = makeAddr("alice");
        bob = makeAddr("bob");
        carol = makeAddr("carol");

        // uint128 listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
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
    gardenTechV2.initialize("GardenTechMarketplaceV2");
    console.log("gardenTechV2.marketplaceName()", gardenTechV2.marketplaceName());
    console.log("gardenTechV2.marketplaceName()XXXXXXXXXXXXXXXXXXXXXXX", IGardenTechMarketplace(payable(address(gardenTechV2))).marketplaceName());
    assertEq(IGardenTechMarketplace(payable(address(gardenTechV2))).marketplaceName(), "GardenTechMarketplaceV2");

    IGardenTechMarketplace(payable(address(proxy))).upgradeToAndCall(
            address(gardenTechV2),
            ""
        );
//         address implementation = IGardenTechMarketplace(payable(address(proxy))).implementation();
// console.log("Current implementation address: ", implementation);
    console.log("IGardenTechMarketplace(payable(address(proxy))).owner()",IGardenTechMarketplace(payable(address(proxy))).owner());
    // console.log("IGardenTechMarketplace(payable(address(proxy))).owner()",IGardenTechMarketplace(payable(address(proxy))).owner());
    console.log("IGardenTechMarketplace(payable(address(proxy))).marketplaceName()",IGardenTechMarketplace(payable(address(proxy))).marketplaceName());
    // Comprobar que el owner sigue siendo el mismo
    // assertEq(IGardenTechMarketplace(payable(address(proxy))).owner(), address(this));
    assert(keccak256(bytes(IGardenTechMarketplace(payable(address(proxy))).marketplaceName())) == keccak256(bytes("GardenTechMarketplaceV2")));
    assertEq(IGardenTechMarketplace(payable(address(proxy))).owner(), address(proxy));
    assertEq(IGardenTechMarketplace(payable(address(proxy))).marketplaceName(), "GardenTechMarketplaceV2");

    // assertNotEq(
    //     IGardenTechMarketplace(payable(address(proxy))).marketplaceName(),
    //     "GardenTechMarketplace"
    // );
    // assertEq(
    //     IGardenTechMarketplace(payable(address(proxy))).marketplaceName(),
    //     "GardenTechMarketplaceV2"  
    // );
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
    ///                   testCreateToken                       ///
    ////////////////////////////////////////////////////////////////
    function testCreateToken() public {
        // Inicializamos los valores
        string memory tokenURI = "https://example.com/metadata.json";

        uint256 _listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        console.log("_listPrice", _listPrice);

        uint256 initialTokenId = IGardenTechMarketplace(payable(address(proxy))).getCurrentToken(); // Obtén el contador inicial
        console.log("initialTokenId", initialTokenId);

        startHoax(alice); // Simula una llamada desde una dirección específica
        vm.expectEmit();
        // Llamamos a la función y verificamos los cambios esperados
        emit TokenListedSuccess(1, address(proxy), alice, 1 ether, true);
        uint256 newTokenId = IGardenTechMarketplace(payable(address(proxy))).createToken{value: _listPrice}(tokenURI, 1 ether);
        console.log("newTokenId", newTokenId);

        // Comprueba que el tokenId se ha incrementado correctamente
        assertEq(newTokenId, initialTokenId + 1);

        // Verifica que el propietario del token es la dirección que llamó
        // address tokenOwner = IGardenTechMarketplace(payable(address(proxy))).ownerOf(newTokenId);
        // assertEq(tokenOwner, address(proxy));

        // Verifica que la URI del token es la esperada
        // string memory actualTokenURI = IGardenTechMarketplace(payable(address(proxy))).tokenURI(newTokenId);
        // assertEq(actualTokenURI, tokenURI);
        IGardenTechMarketplace.ListedToken memory listedToken = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(newTokenId);


        //         (
        //     uint256 tokenId,
        //     uint256 listedPrice,
        //     address owner,
        //     address seller,
        //     bool currentlyListed
        // ) = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(newTokenId);
        console.log("Address gardentechmarketplace", (address(proxy)));
        assertEq(listedToken.tokenId, newTokenId, "TokenId no coincide");
        assertEq(listedToken.price, 1 ether, "El precio no coincide");
        assertEq(listedToken.seller, alice, "El vendedor no coincide");
        assertEq(listedToken.owner, address(proxy), "El propietario no coincide");
        assertEq(listedToken.currentlyListed, true, "El token no se encuentra en la lista");
    }
    ////////////////////////////////////////////////////////////////
    ///                   testCreateTokenFail                    ///
    ////////////////////////////////////////////////////////////////
    function testCreateTokenFail() public {
        // Inicializamos los valores
        string memory tokenURI = "https://example.com/metadata.json";

        uint256 _listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        console.log("_listPrice", _listPrice);

        uint256 initialTokenId = IGardenTechMarketplace(payable(address(proxy))).getCurrentToken(); // Obtén el contador inicial
        console.log("initialTokenId", initialTokenId);

        startHoax(alice); // Simula una llamada desde una dirección específica
        // Llamamos a la función con datos erroneos y verificamos que falle
        vm.expectRevert(abi.encodeWithSignature("IsNotListPrice()"));
        uint256 newTokenId = IGardenTechMarketplace(payable(address(proxy))).createToken{value: 0.001 ether}(tokenURI, 1 ether);
        
        vm.expectRevert(abi.encodeWithSignature("InsufficientPrice()"));
        uint256 newTokenId_2 = IGardenTechMarketplace(payable(address(proxy))).createToken{value: _listPrice}(tokenURI, 0);
        console.log("newTokenId", newTokenId);

        // Comprueba que el tokenId se ha incrementado correctamente
        uint256 laterTokenId = IGardenTechMarketplace(payable(address(proxy))).getCurrentToken(); // Obtén el contador inicial
        assertEq(initialTokenId, laterTokenId);
 }

    ////////////////////////////////////////////////////////////////   
    ///                      testExecuteSale                    ///
    ////////////////////////////////////////////////////////////////

    function testExecuteSale() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        // Alice lista el NFT
        startHoax(alice);
        IGardenTechMarketplace(payable(address(proxy))).createToken{value: listPrice}("https://example.com/metadata.json", 1 ether);
        IGardenTechMarketplace(payable(address(proxy))).createToken{value: listPrice}("https://example.com/metadata.json", 2 ether);
        IGardenTechMarketplace.ListedToken memory listedToken_1 = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(1);
        assertEq(listedToken_1.owner, address(proxy));
        assertEq(listedToken_1.seller, address(alice));
        vm.stopPrank();

        // Bob compra el NFT
        startHoax(bob);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{value: 1 ether + listPrice}(1, true);
        IGardenTechMarketplace.ListedToken memory listedToken_2 = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(1);
        assertEq(listedToken_2.owner, bob);
        assertEq(listedToken_2.seller, bob);
        assertEq(listedToken_2.currentlyListed, true);

        IGardenTechMarketplace(payable(address(proxy))).executeSale{value: 2 ether + listPrice}(2, true);
        IGardenTechMarketplace.ListedToken memory listedToken_3 = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(2);
        assertEq(listedToken_3.owner, bob);
        assertEq(listedToken_3.seller, bob);
        assertEq(listedToken_3.currentlyListed, true);
        assertEq(listedToken_3.price, 2 ether);

        vm.stopPrank();
        startHoax(carol);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{value: 2 ether }(2, false);
        IGardenTechMarketplace.ListedToken memory listedToken_4 = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(2);
        assertEq(listedToken_4.owner, carol);
        assertEq(listedToken_4.seller, carol);
        assertEq(listedToken_4.currentlyListed, false);
    }
    ////////////////////////////////////////////////////////////////   
    ///                      testExecuteSaleFail                   ///
    ////////////////////////////////////////////////////////////////

    function testExecuteSaleFail() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        // Alice lista el NFT
        startHoax(alice);
        IGardenTechMarketplace(payable(address(proxy))).createToken{value: listPrice}("https://example.com/metadata.json", 1 ether);
        IGardenTechMarketplace.ListedToken memory listedToken_1 = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(1);
        assertEq(listedToken_1.owner, address(proxy));
        assertEq(listedToken_1.seller, address(alice));
        vm.stopPrank();

        // Bob compra el NFT

        vm.expectRevert(abi.encodeWithSignature("InsufficientPrice()"));
        startHoax(bob);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{value: 0.5 ether}(1, false);
        vm.expectRevert(abi.encodeWithSignature("InsufficientValue()"));
        IGardenTechMarketplace(payable(address(proxy))).executeSale{value: 1 ether}(1, true);
        vm.stopPrank();
        startHoax(address(0x0));
        vm.expectRevert(abi.encodeWithSignature("ThisAddressCantBuy()"));
        IGardenTechMarketplace(payable(address(proxy))).executeSale{value: 1 ether}(1, false);
        startHoax(address(proxy));
        vm.expectRevert(abi.encodeWithSignature("ThisAddressCantBuy()"));
        IGardenTechMarketplace(payable(address(proxy))).executeSale{value: 1 ether}(1, false);
    }    

    ////////////////////////////////////////////////////////////////   
    ///                   testChangeNFTPrice                     ///
    ////////////////////////////////////////////////////////////////
    function testChangeNFTPrice() public {
        uint256 price = 1 ether;
        uint256 newPrice = 2 ether;
        uint256 secondNewPrice = 3 ether;
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        // Alice lista el NFT
        startHoax(alice);
        IGardenTechMarketplace(payable(address(proxy))).createToken{value: listPrice}("https://example.com/metadata.json", price);
        IGardenTechMarketplace.ListedToken memory listedToken = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(1);
        assertEq(listedToken.owner, address(proxy));
        assertEq(listedToken.seller, address(alice));
        assertEq(listedToken.price, price);
        vm.stopPrank();

        // Bob compra el NFT
        startHoax(bob);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{value: price + listPrice}(1, true);
        IGardenTechMarketplace(payable(address(proxy))).changeNFTPrice(1, newPrice);
        IGardenTechMarketplace.ListedToken memory listedToken_2 = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(1);
        assertEq(listedToken_2.owner, address(bob));
        assertEq(listedToken_2.seller, address(bob));
        assertEq(listedToken_2.price, newPrice);

        // Carol compra el NFT
        startHoax(carol);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{value: newPrice + listPrice}(1, true);
        IGardenTechMarketplace(payable(address(proxy))).changeNFTPrice(1, secondNewPrice);
        IGardenTechMarketplace.ListedToken memory listedToken_3 = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(1);
        assertEq(listedToken_3.owner, address(carol));
        assertEq(listedToken_3.seller, address(carol));
        assertEq(listedToken_3.price, secondNewPrice);
    }
    ////////////////////////////////////////////////////////////////   
    ///                  testChangeNFTPriceFail                  ///
    ////////////////////////////////////////////////////////////////
    function testChangeNFTPriceFail() public {
        uint256 price = 1 ether;
        uint256 newPrice = 2 ether;
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        // Alice lista el NFT
        startHoax(alice);
        IGardenTechMarketplace(payable(address(proxy))).createToken{value: listPrice}("https://example.com/metadata.json", price);
        IGardenTechMarketplace.ListedToken memory listedToken = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(1);
        assertEq(listedToken.owner, address(proxy));
        assertEq(listedToken.seller, address(alice));
        assertEq(listedToken.price, price);
        vm.stopPrank();

        // Bob compra el NFT
        vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
        IGardenTechMarketplace(payable(address(proxy))).changeNFTPrice(1, newPrice);
        startHoax(bob);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{value: price + listPrice}(1, true);
        vm.expectRevert(abi.encodeWithSignature("NotListed()"));
        IGardenTechMarketplace(payable(address(proxy))).changeNFTPrice(2, newPrice);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPrice()"));
        IGardenTechMarketplace(payable(address(proxy))).changeNFTPrice(1, 0);
        IGardenTechMarketplace.ListedToken memory listedToken_2 = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(1);
        assertEq(listedToken_2.owner, address(bob));
        assertEq(listedToken_2.seller, address(bob));
        assertEq(listedToken_2.price, price);
    }

    ////////////////////////////////////////////////////////////////   
    ///                     testGetAllNFTs                       ///
    ////////////////////////////////////////////////////////////////

    function testGetAllNFTs() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        uint256 start = 0;
        uint256 limit = 5;
        // Lista múltiples NFTs para probar la paginación
        startHoax(alice);
        for (uint256 i = 1; i <= 10; i++) {
            // IGardenTechMarketplace(payable(address(proxy))).createToken{value: 10000000000000000}("https://example.com/metadata.json", 1 ether);
            uint256 tokenId = IGardenTechMarketplace(payable(address(proxy))).createToken{value: listPrice}("https://example.com/metadata.json", 1 ether);
        }
        // IGardenTechMarketplace.ListedToken[] memory _listedTokens = gardenTech.getAllNFTs(start, limit);
        IGardenTechMarketplace.ListedToken[] memory listedTokens = IGardenTechMarketplace(payable(address(proxy)))
            .getAllNFTs(start, limit);
        console.log("listedTokens.length", listedTokens.length);
        // console.log("listedTokens.length", _listedTokens.length);
        // assertEq(listedTokens.length, limit);
        for (uint256 i = 0; i < listedTokens.length; i++) {
            console.log("listedTokens[i].tokenId", listedTokens[i].tokenId);
            console2.log("i", i);
            assertEq(listedTokens[i].tokenId, start + i + 1);
        }
    }
    ////////////////////////////////////////////////////////////////   
    ///                     testGetMyNFTs                        ///
    ////////////////////////////////////////////////////////////////

    function testGeMyNFTs() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        // Lista múltiples NFTs para probar la paginación
        startHoax(alice);
        for (uint256 i = 0; i < 10; i++) {
            uint256 tokenId = IGardenTechMarketplace(payable(address(proxy))).createToken{value: listPrice}("https://example.com/metadata.json", 1 ether);
        }
        // IGardenTechMarketplace.ListedToken[] memory _listedTokens = gardenTech.getAllNFTs(start, limit);
        IGardenTechMarketplace.ListedToken[] memory listedTokens = IGardenTechMarketplace(payable(address(proxy)))
            .getMyNFTs();
        console.log("listedTokens.length", listedTokens.length);
        for (uint256 i = 0; i < 10; i++) {
            console.log("listedTokens[i].tokenId", listedTokens[i].tokenId);
            console2.log("i", i);
            assertEq(listedTokens[i].tokenId, i + 1);
        }
    }
    ////////////////////////////////////////////////////////////////   
    ///                   test Helper Funtions                   ///
    ////////////////////////////////////////////////////////////////
    function testUpdateListPrice() public {
        uint256 newPrice = 0.02 ether;

        // Call updateListPrice as the owner
        IGardenTechMarketplace(payable(address(proxy))).updateListPrice(newPrice);

        // Verify the list price was updated
        uint256 updatedPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        assertEq(updatedPrice, newPrice, "List price should be updated to new price");
    }
    function testUpdateListPriceFail() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        uint256 newPrice = 0.02 ether;
  
        // Attempt to call updateListPrice as a non-owner
        startHoax(alice);
        vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
        IGardenTechMarketplace(payable(address(proxy))).updateListPrice(newPrice);
        assertEq(IGardenTechMarketplace(payable(address(proxy))).getListPrice(), listPrice, "List price should be the original price");
    }
    function testGetLatestIdToListedToken() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy))).getListPrice();
        startHoax(alice);
        uint256 tokenId = IGardenTechMarketplace(payable(address(proxy))).createToken{value: listPrice}("https://example.com/metadata.json", 1 ether);
        IGardenTechMarketplace.ListedToken memory listedToken = IGardenTechMarketplace(payable(address(proxy))).getLatestIdToListedToken();
        assertEq(listedToken.tokenId, 1);
        assertEq(listedToken.owner, address(address(proxy)));
        assertEq(listedToken.seller, address(alice));
        assertEq(listedToken.currentlyListed, true);
    }
}
