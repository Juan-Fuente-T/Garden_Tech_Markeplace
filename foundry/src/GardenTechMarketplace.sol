//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

//Console functions to help debug the smart contract just like in Javascript
// import "hardhat/console.sol";

import "forge-std/Test.sol";

// import {Test, console, console2} from "forge-std/Test.sol";
//OpenZeppelin's NFT Standard Contracts. We will extend functions from this in our implementation
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
// import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


    ////////////////////////////////////////////////////////////////
    ///                 Garden Tech Marketplace                  ///
    ////////////////////////////////////////////////////////////////
/**
 * @title NFTMarketplace
 * @dev A marketplace for creating, listing, and selling NFTs.
 * This contract extends ERC721URIStorage, allowing for the creation and management of NFTs.
 */
contract GardenTechMarketplace is ERC721URIStorage, IERC721Receiver, UUPSUpgradeable, Initializable{

    ////////////////////////////////////////////////////////////////
    ///                       Variables                          ///
    ////////////////////////////////////////////////////////////////
    /**
     * @dev Structure to store information about a listed token.
     */
    struct ListedToken {
        uint256 tokenId;
        uint256 price;
        address payable owner;
        address payable seller;
        bool currentlyListed;
    }
    //_tokenIds variable has the most recent minted tokenId
    uint256 public _tokenIds;
    //Keeps track of the number of items sold on the marketplace
    uint256 private _itemsSold;
    //The fee charged by the marketplace to be allowed to list an NFT
    uint256 listPrice;
    //owner is the contract address that created the smart contract
    address payable public owner;
    //The name of  the NFT Marketplace 
    string public marketplaceName; 

    //This mapping maps tokenId to token info and is helpful when retrieving details about a tokenId
    mapping(uint256 => ListedToken) public idToListedToken;

    ////////////////////////////////////////////////////////////////
    ///                        Events                            ///
    ////////////////////////////////////////////////////////////////


    //the event emitted when a token is successfully listed
    event TokenListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );
    //the event emitted when the price of a token is changed
    event ChangeNFTPrice(
        uint256 tokenId,
        uint256 price     
    );

    //the event emitted when a token is successfully sold  
    event ExecuteSale(
        address buyer, 
        uint256 tokenId
    );

    ////////////////////////////////////////////////////////////////
    ///                          Errors                          ///
    ////////////////////////////////////////////////////////////////


    error InsufficientPrice();
    error IsNotListPrice();
    error NotOwner();
    error ThisAddressCantBuy();
    error ThisAddressCantCreateTokens();
    error InsufficientValue();
    error NotListed();
    error InvalidStartOrLimit();
    error InvalidTokenURI();

    ////////////////////////////////////////////////////////////////
    ///                       Constructor                        ///
    ////////////////////////////////////////////////////////////////

    constructor() ERC721("GardenTechMarketplace", "GTM") {
        // owner = payable(msg.sender); Realmente no se usa en el constructor
    }

    ////////////////////////////////////////////////////////////////
    ///                        Modifiers                         ///
    ////////////////////////////////////////////////////////////////

    /**
     * @dev Modifier to ensure that only the owner can execute certain functions
     */

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract's owner can call this method"
        );
        _;
    }

    ////////////////////////////////////////////////////////////////
    ///                Functions for Implementation              ///
    ////////////////////////////////////////////////////////////////
    /**
     * @dev Function to initialize the proxy.
     * @param _marketplaceName The Name of the marketplace
     * @notice With the initialize we don´t need constructor
     * @notice that is the owner of the proxy, not this implementation
     */
    function initialize(string memory _marketplaceName) external initializer {
        owner = payable(msg.sender);
        marketplaceName = _marketplaceName;
        listPrice = 0.01 ether;
    }

    /**
     * @dev Internal function to authorize the upgrade of the implementation contract.
     * @param newImplementation The address of the new implementation contract.
     * @notice You can add any authorization logic for the upgrade of the implementation.
     *         It´s limit by the modifier only to the owner.
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {
        // Posible logica de autorizacion para la actualizacion de la implementación
    }


    ////////////////////////////////////////////////////////////////
    ///                    Helper Funtions                       ///
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Updates the listing price for NFTs.
     * @dev Only the contract owner can update the listing price.
     * @param _listPrice The new listing price.
     */
    function updateListPrice(uint256 _listPrice) public payable onlyOwner() {
        listPrice = _listPrice;
    }

    /**
     * @notice Retrieves the current listing price for NFTs.
     * @return The current listing price.
     */
    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    /**
     * @notice Retrieves the latest listed token.
     * @return The latest listed token.
     */
    function getLatestIdToListedToken()
        public
        view
        returns (ListedToken memory)
    {
        uint256 currentTokenId = _tokenIds;
        return idToListedToken[currentTokenId];
    }

    /**
     * @notice Retrieves the details of a listed token by its ID.
     * @param tokenId The ID of the token.
     * @return The details of the listed token.
     */
    function getListedTokenForId(
        uint256 tokenId
    ) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    /**
     * @notice Retrieves the current token ID.
     * @return The current token ID.
     */
    function getCurrentToken() public view returns (uint256) {
        return _tokenIds;
    }

    /**
    * @notice Changes the price of an already listed NFT token.
    * @dev This function checks if the token is listed and if the sender is the owner of the token.
    * It ensures the new price is greater than zero and updates the token's price.
    * Emits a {ChangeNFTPrice} event upon successful price change.
    * @param tokenId The ID of the token whose price is to be changed.
    * @param newPrice The new price to set for the token.
    * @return The updated price of the token.
    * @custom:reverts If the token is not listed, the sender is not the owner, or the new price is zero.
    */
    function changeNFTPrice(uint256 tokenId, uint256 newPrice) public payable returns (uint256){
        //Check if the token is listed
        if (!idToListedToken[tokenId].currentlyListed) {
            revert NotListed();
        }

        //Check if the sender is the owner of the NFT
        if (msg.sender != idToListedToken[tokenId].owner) {
            revert NotOwner();
        }

        //Check if the price is greater than 0
        if (newPrice == 0) {
            revert InsufficientPrice();
        }

        //Update the price of the NFT
        idToListedToken[tokenId].price = newPrice;

        //Emit the event for successful transfer. The frontend parses this message and updates the end user
        emit ChangeNFTPrice(
            tokenId,
            newPrice    
        );
        return newPrice;
    } 

   /**
    * @notice Returns a paginated list of NFTs currently listed for sale on the marketplace.
    * @dev This function iterates over all token IDs and returns a subset of ListedToken objects
    * for tokens that are currently listed, based on the start index and limit provided.
    * @param start The starting index for pagination (0-based).
    * @param limit The maximum number of NFTs to return.
    * @return An array of ListedToken objects representing a subset of NFTs currently listed for sale.
    */
    function getAllNFTs(uint256 start, uint256 limit) public view returns (ListedToken[] memory) {
        if(start < 0 || limit == 0 || start > limit) {
            revert  InvalidStartOrLimit();
        }
        uint256 nftCount = _tokenIds;
        uint256 listedCount = 0;
        
        // Primero, contamos cuantos NFTs listados hay en total
        for (uint256 i = 0; i <= nftCount; i++) {
            if (idToListedToken[i].currentlyListed) {
                listedCount++;
            }
        }
        // Calculamos cuantos NFTs vamos a devolver
        uint256 returnedCount = 0;
        if (start < listedCount) {
            returnedCount = (listedCount - start < limit) ? listedCount - start : limit;
        }
        
        ListedToken[] memory tokens = new ListedToken[](returnedCount);
        uint256 index = 0;
        uint256 currentListedCount = 0;
        
        for (uint256 i = 1; i <= nftCount && index < returnedCount; i++) {
            if (idToListedToken[i].currentlyListed) {
                if (currentListedCount >= start) {
                    tokens[index] = idToListedToken[i];
                    index++;
                }
                currentListedCount++;
            }
        }
        
        return tokens;
    }

    /**
    * @notice Returns all the NFTs that the current user is the owner or seller of.
    * @dev This function filters the NFTs listed on the marketplace to return only those
    * owned or sold by the current user.
    * @return An array of ListedToken objects representing all NFTs owned or sold by the current user.
    */
    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        //Important to get a count of all the NFTs that belong to the user before we can make an array for them
        for (uint256 i = 1; i <= totalItemCount;) {
            if (
                idToListedToken[i].owner == msg.sender ||
                idToListedToken[i].seller == msg.sender
            ) {
                itemCount ++;
            }
                unchecked { i++; }
        }

        //Once you have the count of relevant NFTs, create an array then store all the NFTs in it
        ListedToken[] memory items = new ListedToken[](itemCount);
        for (uint256 i = 1; i <= totalItemCount;) {
            if (
                idToListedToken[i].owner == msg.sender ||
                idToListedToken[i].seller == msg.sender
            ) {
                items[currentIndex] = idToListedToken[i];
                currentIndex ++;
            }
                unchecked { i++; }
        }
        return items;
    }

    ////////////////////////////////////////////////////////////////
    ///                      Token Funtion                       ///
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Creates a new token and lists it for sale.
     * @dev Mints a new NFT and maps it to a tokenURI.
     * @param tokenURI The URI of the NFT metadata.
     * @param price The price to list the NFT at.
     * @return The new tokenId.
     */
    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable returns (uint256) {
        if (price == 0) {
            revert InsufficientPrice();
        }
        if (keccak256(abi.encodePacked(tokenURI)) == keccak256(abi.encodePacked(""))) {
            revert InvalidTokenURI();
        }
        if(msg.sender == address(0) || msg.sender == address(this)) {
            revert ThisAddressCantCreateTokens();
        }
        //Increment the tokenId counter, which is keeping track of the number of minted NFTs
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        //Mint the NFT with tokenId newTokenId to the address who called createToken
        _safeMint(msg.sender, newTokenId);

        //Map the tokenId to the tokenURI (which is an IPFS URL with the NFT metadata)
        _setTokenURI(newTokenId, tokenURI);

        //Helper function to update Global variables and emit an event
        createListedToken(newTokenId, price);

        return newTokenId;
    }
        /**
    * @notice Creates a listing for an NFT token with a specified price.
    * @dev This function requires the sender to send the exact listing price in ETH and ensures the price is greater than zero.
    * It updates the mapping of token IDs to their listing details and transfers the token to the contract.
    * Emits a {TokenListedSuccess} event upon successful listing.
    * @param tokenId The ID of the token to be listed.
    * @param price The price at which the token is to be listed.
    * @custom:reverts If the sent ETH is not equal to the listing price or if the price is zero.
    */
    function createListedToken(uint256 tokenId, uint256 price) private {
        //Make sure the sender sent enough ETH to pay for listing
        if (msg.value != listPrice){
            revert IsNotListPrice();
        }
        //Just sanity check
        if(price == 0){
            revert InsufficientPrice();
        }
        
        //Update the mapping of tokenId's to Token details, useful for retrieval functions
        idToListedToken[tokenId] = ListedToken(
            tokenId,
            price,
            payable(address(this)),
            payable(msg.sender),
            true
        );

        _transfer(msg.sender, address(this), tokenId);
        //Emit the event for successful transfer. The frontend parses this message and updates the end user
        emit TokenListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true
        );
    }

    ////////////////////////////////////////////////////////////////
    ///                      Sell Funtion                        ///
    ////////////////////////////////////////////////////////////////

    /**
    * @notice Executes the sale of an NFT listed on the marketplace and optionally relists it.
    * @dev This function handles the purchase of an NFT by transferring ownership and funds.
    * It requires the correct amount of Ether to be sent with the transaction to match the listing price.
    * If 'sell' is true, it also handles relisting the NFT and charges an additional listing fee.
    * @param tokenId The ID of the NFT to be sold.
    * @param sell A boolean indicating whether the NFT should be relisted after purchase.
    */
    function executeSale(uint256 tokenId, bool sell) public payable {
        if(msg.sender == address(this) || msg.sender == address(0)){
            revert ThisAddressCantBuy();
        }
        if(!idToListedToken[tokenId].currentlyListed){
            revert NotListed();
        }
        uint256 price = idToListedToken[tokenId].price;
        
        address seller = idToListedToken[tokenId].seller;

        idToListedToken[tokenId].seller = payable(msg.sender);
        _itemsSold++;

        _transfer(idToListedToken[tokenId].owner, msg.sender, tokenId);

        idToListedToken[tokenId].owner = payable(msg.sender);
        //If the option of sell the nft is true the user can sell the nft in the marketplace
        if(sell){
            if(msg.value < price + listPrice){
                revert InsufficientValue();
            }
            idToListedToken[tokenId].currentlyListed = true;
            //approve the marketplace to sell NFTs on your behalf
            approve(address(this), tokenId);
        }else {
            if(msg.value < price){
            revert InsufficientPrice();
        }
            idToListedToken[tokenId].currentlyListed = false;
        }

        //Transfer the listing fee to the marketplace creator
        // payable(address(this)).transfer(listPrice);
        (bool success, ) = payable(address(this)).call{value: listPrice}("");
        require(success, "Transfer to owner of the contract failed");

        //Transfer the proceeds from the sale to the seller of the NFT
        (bool success2, ) = payable(seller).call{value: idToListedToken[tokenId].price}("");
        require(success2, "Transfer to seller failed");
        // payable(seller).transfer(idToListedToken[tokenId].price);
        emit ExecuteSale(msg.sender, tokenId);
    }

    ////////////////////////////////////////////////////////////////
    ///                   Reception Functions                    ///
    ////////////////////////////////////////////////////////////////

    // /**
    // * @notice Handles the reception of Non-Fungible Tokens (NFTs) by the contract.
    // * @dev This function is called when an NFT is sent to the contract. It must return a specific value
    // * to indicate that the contract accepts the NFT.
    // * Emits no events by default. Any additional actions or events related to the received NFT
    // * should be specified within the function's implementation.
    // * @param operator The address which called `safeTransferFrom` function.
    // * @param from The address which previously owned the NFT.
    // * @param tokenId The NFT identifier which is being transferred.
    // * @param data Additional data with no specified format.
    // * @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))` to indicate that the contract accepts the NFT.
    // */

    function onERC721Received(
        address /*operator*/,
        address /*from*/,
        uint256 /*tokenId*/,
        bytes calldata /*data*/
    ) external pure override returns (bytes4) {
        //Return the value indicating that this contract accepts the NFT.
        return this.onERC721Received.selector;
    }

    /**
    * @notice Fallback function to receive Ether without data.
    * @dev This function is executed when the contract receives Ether without accompanying data.
    * The received Ether is added to the contract's balance.
    */
    receive() external payable {
        // No specific logic required for receiving Ether in this contract.
        // The received Ether is added to the contract's balance.
    }

    /**
     * @dev Fallback function executed when no other function matches the provided function signature,
     * or when no data is provided with the transaction.
     * @notice This function allows the contract to receive Ether and does not contain specific logic.
     * @notice Ether sent with this transaction is added to the contract's balance.
     */
    fallback() external payable {
        // No specific logic required in the fallback function.
        // The received Ether is added to the contract's balance.
        // Users should avoid relying on the fallback function for complex interactions.
    }
}