// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import { Test, console, console2 } from "../lib/forge-std/src/Test.sol";
import { NFTMarketplace } from "../src/NFTMarketplace.sol";

contract NFTMarketplaceTest is Test {
    struct ListedToken {
        uint256 tokenId;
        uint256 price;
        address payable owner;
        address payable seller;
        bool currentlyListed;
    }


    NFTMarketplace marketplace;
    address alice;
    address bob;

    function setUp() public {
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        vm.startPrank(bob);
        marketplace = new NFTMarketplace();
        vm.stopPrank();
        startHoax(alice, 1 ether);
    }

    function testCreateToken() public {
        // Crear un nuevo token
        (bool create, ) = address(marketplace).call{
            value: 0.01 ether}(
                abi.encodeWithSignature(
                    "createToken(string, uint256)", 
                    "https://ipfs.io/ipfs/QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ", 
                    0.02 ether
                    ));

        //(bool create, ) = payable(address(marketplace)).call{value: 0.01 ether}(abi.encodeWithSignature("createToken(string, uint256)", "https://ipfs.io/ipfs/", 0.02 ether));
        // Verificar que el token se ha creado correctamente
        console.logAddress(address(marketplace));
        console.log(marketplace.getListedTokenForId(0).owner);
        console.log(marketplace.getListedTokenForId(1).price);
        assertEq(create, true);
        uint256 price = marketplace.getListPrice();
        console.log("price", price);
     
        assertEq(marketplace.ownerOf(1), address(this));
        assertEq(marketplace.getListedTokenForId(1).price, price);

        assertEq(alice, marketplace.getListedTokenForId(0).seller);
        assertEq(address(marketplace), marketplace.getListedTokenForId(0).owner);
        assertEq(0.02 ether, marketplace.getListedTokenForId(0).price);
        assertEq(true, marketplace.getListedTokenForId(0).currentlyListed);
    }

    function testUpdateListPrice() public {
        // Actualizar el precio de listado
        marketplace.updateListPrice(0.02 ether);

        // Verificar que el precio de listado se ha actualizado correctamente
        assertEq(marketplace.getListPrice(), 0.02 ether);
    }

    function testGetLatestIdToListedToken() public {
        // Obtener información sobre el token más reciente
        //ListedToken memory latestToken = marketplace.getLatestIdToListedToken();

        // Verificar que la información del token es correcta
        //assertTrue(latestToken.tokenId > 0);
        //assertTrue(latestToken.price > 0);
    }

    function testGetListedTokenForId() public {
        // Crear un nuevo token
        uint256 tokenId = marketplace.createToken("https://ipfs.io/ipfs/", 1 ether);

        // Obtener información sobre el token recién creado
        //ListedToken memory tokenInfo = marketplace.getListedTokenForId(tokenId);

        // Verificar que la información del token es correcta
        //assertTrue(tokenInfo.tokenId == tokenId);
        //assertTrue(tokenInfo.price == 1 ether);
    }

    function testGetAllNFTs() public {
        // Crear varios tokens
        for (uint256 i = 0; i < 5; i++) {
            marketplace.createToken("https://ipfs.io/ipfs/", 1 ether);
        }

        // Obtener la lista de todos los tokens
        //ListedToken[] memory allTokens = marketplace.getAllNFTs();

        // Verificar que la cantidad de tokens obtenidos es correcta
        //assertEq(allTokens.length, 5);
    }

    // Puedes agregar más pruebas para otras funciones según tus necesidades

}
