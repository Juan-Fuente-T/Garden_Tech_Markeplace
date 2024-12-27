// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
// import {Test, console, console2} from "forge-std/src/Test.sol";
import {Test, console, console2} from "forge-std/Test.sol";
import {Proxy1967GardenTechMarketplace} from "../src/Proxy1967GardenTechMarketplace.sol";
import {GardenTechMarketplace} from "../src/GardenTechMarketplace.sol";
import {IGardenTechMarketplace} from "../src/IGardenTechMarketplace.sol";

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

    event ChangeNFTPrice(uint256 tokenId, uint256 price);

    event ExecuteSale(address buyer, uint256 tokenId);

    event Upgraded(address indexed implementation);

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
        assertEq(
            IGardenTechMarketplace(payable(address(proxy))).owner(),
            address(this)
        );
        vm.expectRevert(abi.encodeWithSignature("InvalidInitialization()"));
        IGardenTechMarketplace(payable(address(proxy))).initialize(
            "GardenTechMarketplace"
        );
    }

    function testUpgradeToAndCall() public {
        // Verifica el nombre inicial
        assertEq(
            IGardenTechMarketplace(payable(address(proxy))).marketplaceName(),
            "GardenTechMarketplace"
        );
        // Inicializa gardenTechV2
        gardenTechV2.initialize("GardenTechMarketplaceV2");

        vm.expectEmit();
        emit Upgraded(address(gardenTechV2));
        IGardenTechMarketplace(payable(address(proxy))).upgradeToAndCall(
            address(gardenTechV2),
            ""
        );
        vm.startPrank(alice);
        vm.expectRevert("Only the contract's owner can call this method");
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

    ////////////////////////////////////////////////////////////////
    ///                 testOnERC721Received                     ///
    ////////////////////////////////////////////////////////////////

    function testOnERC721Received() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        startHoax(alice);
        uint256 tokenId = IGardenTechMarketplace(payable(address(proxy)))
            .createToken{value: listPrice}(
            "https://example.com/metadata.json",
            1 ether
        );
        vm.stopPrank();

        startHoax(bob);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: 1 ether + listPrice
        }(1, true);
        IGardenTechMarketplace.ListedToken
            memory listedToken = IGardenTechMarketplace(payable(address(proxy)))
                .getListedTokenForId(1);
        assertEq(listedToken.owner, bob);
        assertEq(
            IGardenTechMarketplace(payable(address(proxy))).ownerOf(tokenId),
            bob
        );

        IGardenTechMarketplace(payable(address(proxy))).safeTransferFrom(
            bob,
            payable(address(proxy)),
            tokenId
        );
        IGardenTechMarketplace(payable(address(proxy))).ownerOf(tokenId);
        assertEq(
            IGardenTechMarketplace(payable(address(proxy))).ownerOf(tokenId),
            payable(address(proxy))
        );
        // IGardenTechMarketplace(payable(address(proxy))).onERC721Received.selector;
        // assertEq(IGardenTechMarketplace(payable(address(proxy))).onERC721Received(address(0), address(0), 1, ""), expected);
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

        uint256 _listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        console.log("_listPrice", _listPrice);

        uint256 initialTokenId = IGardenTechMarketplace(payable(address(proxy)))
            .getCurrentToken(); // Obtén el contador inicial
        console.log("initialTokenId", initialTokenId);

        startHoax(alice); // Simula una llamada desde una direccion específica
        vm.expectEmit();
        // Llamamos a la funcion y verificamos los cambios esperados
        emit TokenListedSuccess(1, address(proxy), alice, 1 ether, true);
        uint256 newTokenId = IGardenTechMarketplace(payable(address(proxy)))
            .createToken{value: _listPrice}(tokenURI, 1 ether);

        // Comprueba que el tokenId se ha incrementado correctamente
        assertEq(newTokenId, initialTokenId + 1);

        // Verifica que el propietario del token es la direccion que llamó
        address tokenOwner = IGardenTechMarketplace(payable(address(proxy)))
            .owner();
        assertEq(tokenOwner, address(this));

        IGardenTechMarketplace.ListedToken
            memory listedToken = IGardenTechMarketplace(payable(address(proxy)))
                .getListedTokenForId(newTokenId);
        //         (
        //     uint256 tokenId,
        //     uint256 listedPrice,
        //     address owner,
        //     address seller,
        //     bool currentlyListed
        // ) = IGardenTechMarketplace(payable(address(proxy))).getListedTokenForId(newTokenId);
        assertEq(listedToken.tokenId, newTokenId, "TokenId no coincide");
        assertEq(listedToken.price, 1 ether, "El precio no coincide");
        assertEq(listedToken.seller, alice, "El vendedor no coincide");
        assertEq(
            listedToken.owner,
            address(proxy),
            "El propietario no coincide"
        );
        assertEq(
            listedToken.currentlyListed,
            true,
            "El token no se encuentra en la lista"
        );
    }

    ////////////////////////////////////////////////////////////////
    ///                   testCreateTokenFail                    ///
    ////////////////////////////////////////////////////////////////
    function testCreateTokenFail() public {
        // Inicializamos los valores
        string memory tokenURI = "https://example.com/metadata.json";

        uint256 _listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();

        uint256 initialTokenId = IGardenTechMarketplace(payable(address(proxy)))
            .getCurrentToken(); // Obtén el contador inicial
        assertEq(initialTokenId, 0, "El contador de tokens no es 0");

        startHoax(alice);
        // uint256 newT = IGardenTechMarketplace(payable(address(proxy))).createToken{value: listPrice}(tokenURI, 1 ether);
        // Llamamos a la funcion con datos erroneos y verificamos que falle
        vm.expectRevert(abi.encodeWithSignature("IsNotListPrice()"));
        uint256 newTokenId = IGardenTechMarketplace(payable(address(proxy)))
            .createToken{value: 0.001 ether}(tokenURI, 1 ether);

        vm.expectRevert(abi.encodeWithSignature("InsufficientPrice()"));
        uint256 newTokenId_2 = IGardenTechMarketplace(payable(address(proxy)))
            .createToken{value: _listPrice}(tokenURI, 0);

        vm.expectRevert(abi.encodeWithSignature("InvalidTokenURI()"));
        uint256 newTokenId_3 = IGardenTechMarketplace(payable(address(proxy)))
            .createToken{value: _listPrice}("", 1);
        vm.stopPrank();

        vm.startPrank(address(0));
        vm.expectRevert(
            abi.encodeWithSignature("ThisAddressCantCreateTokens()")
        );
        uint256 newTokenId_4 = IGardenTechMarketplace(payable(address(proxy)))
            .createToken{value: _listPrice}(tokenURI, 1);
        vm.stopPrank();

        startHoax(address(proxy));
        vm.expectRevert(
            abi.encodeWithSignature("ThisAddressCantCreateTokens()")
        );
        uint256 newTokenId_5 = IGardenTechMarketplace(payable(address(proxy)))
            .createToken{value: _listPrice}(tokenURI, 1);
        assertEq(newTokenId_5, 0);

        // Comprueba que el tokenId se ha incrementado correctamente
        uint256 laterTokenId = IGardenTechMarketplace(payable(address(proxy)))
            .getCurrentToken(); // Obtén el contador inicial
        assertEq(laterTokenId, 0, "El contador de tokens no es 0");
    }

    ////////////////////////////////////////////////////////////////
    ///                      testExecuteSale                    ///
    ////////////////////////////////////////////////////////////////

    function testExecuteSale() public {
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.startPrank(alice);

        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        uint256 aliceBalanceBefore = alice.balance;
        uint256 bobBalanceBefore = bob.balance;
        uint256 contractBalanceBefore = address(proxy).balance;
        // Alice lista el NFT
        assertEq(contractBalanceBefore, 0);

        IGardenTechMarketplace(payable(address(proxy))).createToken{
            value: listPrice
        }("https://example.com/metadata.json", 1 ether);
        IGardenTechMarketplace(payable(address(proxy))).createToken{
            value: listPrice
        }("https://example.com/metadata.json", 2 ether);
        IGardenTechMarketplace.ListedToken
            memory listedToken_1 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getListedTokenForId(1);
        assertEq(listedToken_1.owner, address(proxy));
        assertEq(listedToken_1.seller, address(alice));
        assertEq(address(proxy).balance, contractBalanceBefore + listPrice * 2);
        assertEq(alice.balance, aliceBalanceBefore - listPrice * 2);
        aliceBalanceBefore = alice.balance;
        vm.stopPrank();

        // Bob compra el NFT
        vm.startPrank(bob);
        vm.expectEmit();
        emit ExecuteSale(bob, 1);
        // console.log("Este es el puto balance que tiene el contrato1", address(proxy).balance);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: 1 ether + listPrice
        }(1, true);
        IGardenTechMarketplace.ListedToken
            memory listedToken_2 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getListedTokenForId(1);
        assertEq(listedToken_2.owner, bob);
        assertEq(listedToken_2.seller, bob);
        assertEq(listedToken_2.currentlyListed, true);
        assertEq(bob.balance, bobBalanceBefore - (1 ether + listPrice));
        bobBalanceBefore = bob.balance;
        assertEq(alice.balance, aliceBalanceBefore + 1 ether);
        aliceBalanceBefore = alice.balance;
        assertEq(address(proxy).balance, contractBalanceBefore + listPrice * 3);
        contractBalanceBefore = address(proxy).balance;

        vm.expectEmit();
        emit ExecuteSale(bob, 2);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: 2 ether + listPrice
        }(2, true);
        IGardenTechMarketplace.ListedToken
            memory listedToken_3 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getListedTokenForId(2);
        assertEq(listedToken_3.owner, bob);
        assertEq(listedToken_3.seller, bob);
        assertEq(listedToken_3.currentlyListed, true);
        assertEq(bob.balance, bobBalanceBefore - (2 ether + listPrice));
        bobBalanceBefore = bob.balance;
        assertEq(alice.balance, aliceBalanceBefore + 2 ether);
        aliceBalanceBefore = alice.balance;
        // assertEq(IGardenTechMarketplace(payable(address(proxy))).owner().balance, IGardenTechMarketplace(payable(address(proxy))).owner().balance + listPrice * 2);

        vm.stopPrank();
        vm.startPrank(carol);
        vm.deal(carol, 3 ether);
        assertEq(address(carol).balance, 3 ether);
        vm.expectEmit();
        emit ExecuteSale(carol, 2);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: 2 ether
        }(2, false);
        assertEq(address(carol).balance, 1 ether);
        IGardenTechMarketplace.ListedToken
            memory listedToken_4 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getListedTokenForId(2);
        assertEq(listedToken_4.owner, carol);
        assertEq(listedToken_4.seller, carol);
        assertEq(listedToken_4.currentlyListed, false);
        assertEq(bob.balance, bobBalanceBefore + 2 ether);
    }

    ////////////////////////////////////////////////////////////////
    ///                      testExecuteSaleFail                   ///
    ////////////////////////////////////////////////////////////////

    function testExecuteSaleFail() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        // Alice lista el NFT
        startHoax(alice);
        IGardenTechMarketplace(payable(address(proxy))).createToken{
            value: listPrice
        }("https://example.com/metadata.json", 1 ether);
        IGardenTechMarketplace.ListedToken
            memory listedToken_1 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getListedTokenForId(1);
        assertEq(listedToken_1.owner, address(proxy));
        assertEq(listedToken_1.seller, address(alice));
        vm.stopPrank();

        // Bob compra el NFT

        startHoax(bob);
        vm.expectRevert(abi.encodeWithSignature("InsufficientPrice()"));
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: 0.5 ether
        }(1, false);
        vm.expectRevert(abi.encodeWithSignature("InsufficientValue()"));
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: 1.005 ether
        }(1, true);
        vm.expectRevert(abi.encodeWithSignature("NotListed()"));
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: 1 ether
        }(9, false);
        vm.stopPrank();
        startHoax(address(0x0));
        vm.expectRevert(abi.encodeWithSignature("ThisAddressCantBuy()"));
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: 1 ether
        }(1, false);
        startHoax(address(proxy));
        vm.expectRevert(abi.encodeWithSignature("ThisAddressCantBuy()"));
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: 1 ether
        }(1, false);

        vm.stopPrank();
    }

    ////////////////////////////////////////////////////////////////
    ///                   testChangeNFTPrice                     ///
    ////////////////////////////////////////////////////////////////
    function testChangeNFTPrice() public {
        uint256 price = 1 ether;
        uint256 newPrice = 2 ether;
        uint256 secondNewPrice = 3 ether;
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        // Alice lista el NFT
        startHoax(alice);
        IGardenTechMarketplace(payable(address(proxy))).createToken{
            value: listPrice
        }("https://example.com/metadata.json", price);
        IGardenTechMarketplace.ListedToken
            memory listedToken = IGardenTechMarketplace(payable(address(proxy)))
                .getListedTokenForId(1);
        assertEq(listedToken.owner, address(proxy));
        assertEq(listedToken.seller, address(alice));
        assertEq(listedToken.price, price);
        vm.stopPrank();

        // Bob compra el NFT
        startHoax(bob);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: price + listPrice
        }(1, true);
        vm.expectEmit();
        emit ChangeNFTPrice(1, newPrice);
        uint256 laterPrice = IGardenTechMarketplace(payable(address(proxy)))
            .changeNFTPrice(1, newPrice);
        IGardenTechMarketplace.ListedToken
            memory listedToken_2 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getListedTokenForId(1);
        assertEq(laterPrice, newPrice);
        assertEq(listedToken_2.owner, address(bob));
        assertEq(listedToken_2.seller, address(bob));
        assertEq(listedToken_2.price, newPrice);

        // Carol compra el NFT
        startHoax(carol);
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: newPrice + listPrice
        }(1, true);
        vm.expectEmit();
        emit ChangeNFTPrice(1, secondNewPrice);
        IGardenTechMarketplace(payable(address(proxy))).changeNFTPrice(
            1,
            secondNewPrice
        );
        IGardenTechMarketplace.ListedToken
            memory listedToken_3 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getListedTokenForId(1);
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
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        // Alice lista el NFT
        startHoax(alice);
        IGardenTechMarketplace(payable(address(proxy))).createToken{
            value: listPrice
        }("https://example.com/metadata.json", price);
        IGardenTechMarketplace.ListedToken
            memory listedToken = IGardenTechMarketplace(payable(address(proxy)))
                .getListedTokenForId(1);
        assertEq(listedToken.owner, address(proxy));
        assertEq(listedToken.seller, address(alice));
        assertEq(listedToken.price, price);
        vm.stopPrank();

        vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
        IGardenTechMarketplace(payable(address(proxy))).changeNFTPrice(
            1,
            newPrice
        );
        startHoax(bob);
        // Bob compra el NFT
        IGardenTechMarketplace(payable(address(proxy))).executeSale{
            value: price + listPrice
        }(1, true);
        vm.expectRevert(abi.encodeWithSignature("NotListed()"));
        IGardenTechMarketplace(payable(address(proxy))).changeNFTPrice(
            2,
            newPrice
        );
        vm.expectRevert(abi.encodeWithSignature("InsufficientPrice()"));
        IGardenTechMarketplace(payable(address(proxy))).changeNFTPrice(1, 0);
        IGardenTechMarketplace.ListedToken
            memory listedToken_2 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getListedTokenForId(1);
        assertEq(listedToken_2.owner, address(bob));
        assertEq(listedToken_2.seller, address(bob));
        assertEq(listedToken_2.price, price);
    }

    ////////////////////////////////////////////////////////////////
    ///                     testGetAllNFTs                       ///
    ////////////////////////////////////////////////////////////////

    function testGetAllNFTs() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        uint256 start = 0;
        uint256 limit = 5;
        // Lista múltiples NFTs para probar la paginacion
        startHoax(alice);
        for (uint256 i = 1; i <= 10; i++) {
            // IGardenTechMarketplace(payable(address(proxy))).createToken{value: 10000000000000000}("https://example.com/metadata.json", 1 ether);
            uint256 price = i * 1 ether;
            uint256 tokenId = IGardenTechMarketplace(payable(address(proxy)))
                .createToken{value: listPrice}(
                "https://example.com/metadata.json",
                price
            );
        }
        // IGardenTechMarketplace.ListedToken[] memory _listedTokens = gardenTech.getAllNFTs(start, limit);
        IGardenTechMarketplace.ListedToken[]
            memory listedTokens = IGardenTechMarketplace(
                payable(address(proxy))
            ).getAllNFTs(start, limit);
        // console.log("listedTokens.length", listedTokens.length);
        // assertEq(listedTokens.length, limit);
        for (uint256 i = 0; i < listedTokens.length; i++) {
            // console.log("listedTokens.length", listedTokens[i].price);
            // console.log("listedTokens[i].tokenId", listedTokens[i].tokenId);
            assertEq(listedTokens[i].tokenId, start + i + 1);
        }
        vm.expectRevert(abi.encodeWithSignature("InvalidStartOrLimit()"));
        IGardenTechMarketplace.ListedToken[]
            memory listedTokens2 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getAllNFTs(12, 99);

        vm.expectRevert(abi.encodeWithSignature("InvalidStartOrLimit()"));
        IGardenTechMarketplace.ListedToken[]
            memory listedTokens3 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getAllNFTs(0, 0);
        vm.expectRevert(abi.encodeWithSignature("InvalidStartOrLimit()"));
        IGardenTechMarketplace.ListedToken[]
            memory listedTokens4 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getAllNFTs(3, 0);
    }

    ////////////////////////////////////////////////////////////////
    ///                     testGetMyNFTs                        ///
    ////////////////////////////////////////////////////////////////

    function testGetMyNFTs() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        // Lista múltiples NFTs para probar la paginacion
        startHoax(alice);
        for (uint256 i = 0; i < 10; i++) {
            uint256 tokenId = IGardenTechMarketplace(payable(address(proxy)))
                .createToken{value: listPrice}(
                "https://example.com/metadata.json",
                1 ether
            );
        }

        IGardenTechMarketplace.ListedToken[]
            memory listedTokens = IGardenTechMarketplace(
                payable(address(proxy))
            ).getMyNFTs();
        console.log("listedTokens.length", listedTokens.length);
        for (uint256 i = 0; i < 10; i++) {
            console.log("listedTokens[i].tokenId", listedTokens[i].tokenId);
            console2.log("i", i);
            assertEq(listedTokens[i].tokenId, i + 1);
        }
        vm.stopPrank();
        startHoax(bob);
        IGardenTechMarketplace.ListedToken[]
            memory listedTokens2 = IGardenTechMarketplace(
                payable(address(proxy))
            ).getMyNFTs();
        assertEq(listedTokens2.length, 0, "Bob no debe tener NFTs");
        console.log("listedTokens2.length", listedTokens2.length);
    }

    ////////////////////////////////////////////////////////////////
    ///                   test Helper Funtions                   ///
    ////////////////////////////////////////////////////////////////
    function testUpdateListPrice() public {
        uint256 newPrice = 0.02 ether;

        // Call updateListPrice as the owner
        IGardenTechMarketplace(payable(address(proxy))).updateListPrice(
            newPrice
        );

        // Verify the list price was updated
        uint256 updatedPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        assertEq(
            updatedPrice,
            newPrice,
            "List price should be updated to new price"
        );
        vm.startPrank(alice);
        vm.expectRevert("Only the contract's owner can call this method");
        IGardenTechMarketplace(payable(address(proxy))).updateListPrice(
            1 ether
        );
    }

    function testUpdateListPriceFail() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        uint256 newPrice = 0.02 ether;

        // Attempt to call updateListPrice as a non-owner
        startHoax(alice);
        vm.expectRevert("Only the contract's owner can call this method");
        IGardenTechMarketplace(payable(address(proxy))).updateListPrice(
            newPrice
        );
        assertEq(
            IGardenTechMarketplace(payable(address(proxy))).getListPrice(),
            listPrice,
            "List price should be the original price"
        );
    }

    function testGetLatestIdToListedToken() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        startHoax(alice);
        uint256 tokenId = IGardenTechMarketplace(payable(address(proxy)))
            .createToken{value: listPrice}(
            "https://example.com/metadata.json",
            1 ether
        );
        IGardenTechMarketplace.ListedToken
            memory listedToken = IGardenTechMarketplace(payable(address(proxy)))
                .getLatestIdToListedToken();
        assertEq(listedToken.tokenId, 1);
        assertEq(listedToken.owner, address(address(proxy)));
        assertEq(listedToken.seller, address(alice));
        assertEq(listedToken.currentlyListed, true);
    }

    function testGetCurrentToken() public {
        uint256 listPrice = IGardenTechMarketplace(payable(address(proxy)))
            .getListPrice();
        startHoax(alice);
        uint256 tokenId = IGardenTechMarketplace(payable(address(proxy)))
            .createToken{value: listPrice}(
            "https://example.com/metadata.json",
            1 ether
        );
        uint256 listedToken = IGardenTechMarketplace(payable(address(proxy)))
            .getCurrentToken();
        assertEq(listedToken, 1);
        assertEq(listedToken, tokenId);
    }
}
