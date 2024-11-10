// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGardenTechMarketplace {
    struct ListedToken {
        uint256 tokenId;
        uint256 price;
        address payable owner;
        address payable seller;
        bool currentlyListed;
    }
  // Eventos que se emiten al listar un NFT con éxito
    event TokenListedSuccess(
        uint256 tokenId,
        address indexed marketplace,
        address indexed seller,
        uint256 price,
        bool currentlyListed
    );
    
    //Funciones ralacionadas con el Proxy
    function upgradeToAndCall(address, bytes calldata) external payable;
    function proxiableUUID() external view returns (bytes32);

    // Funciones para incializar el Marketplace
    function initialize(string calldata _marketplaceName) external;

    //Funciones para obtener el nombre del Marketplace
    function marketplaceName() external view returns (string memory);
    function owner() external view returns (address);

    // Funciones para obtener el precio de listado y el último token listado
    function getListPrice() external view returns (uint256);
    function getLatestIdToListedToken() external view returns (ListedToken memory);
    function getListedTokenForId(uint256 tokenId) external view returns (ListedToken memory);
    function getCurrentToken() external view returns (uint256);

    // Funciones para obtener los NFTs listados
    function getAllNFTs() external view returns (ListedToken[] memory);
    function getMyNFTs() external view returns (ListedToken[] memory);

    //Funcion para actualizar el precio de listado
    function updateListPrice(uint256 _listPrice) external payable;

    // Función para crear un token listado
    function createToken(string memory tokenURI,uint256 price) external payable returns (uint256);

    // Función para ejecutar la venta de un NFT
    function executeSale(uint256 tokenId) external payable;

    // Función para recibir tokens ERC721
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
    
    // Funciones Fallback y receive para manejar ETH
    receive() external payable;
    fallback() external payable;
}