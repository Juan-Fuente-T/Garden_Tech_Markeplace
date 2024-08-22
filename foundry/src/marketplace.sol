//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

//Console functions to help debug the smart contract just like in Javascript
//import "hardhat/console.sol";
import "../lib/forge-std/src/Test.sol";
//OpenZeppelin's NFT Standard Contracts. We will extend functions from this in our implementation
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    //_tokenIds variable has the most recent minted tokenId
    Counters.Counter private _tokenIds;
    //Keeps track of the number of items sold on the marketplace
    Counters.Counter private _itemsSold;
    //owner is the contract address that created the smart contract
    address payable owner;
    //The fee charged by the marketplace to be allowed to list an NFT
    uint256 listPrice = 0.01 ether;

    //The structure to store info about a listed token
    struct ListedToken {
        uint256 tokenId;
        uint256 price;
        address payable owner;
        address payable seller;
        bool currentlyListed;
    }

    //the event emitted when a token is successfully listed
    event TokenListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );

    //This mapping maps tokenId to token info and is helpful when retrieving details about a tokenId
    mapping(uint256 => ListedToken) private idToListedToken;

    error InsufficientPrice();
    error IsNotListPrice();
    error NotOwner();
    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    //The first time a token is created, it is listed here
    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable returns (uint256) {
        //Increment the tokenId counter, which is keeping track of the number of minted NFTs
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        //Mint the NFT with tokenId newTokenId to the address who called createToken
        console.log("Sender", msg.sender);
        _safeMint(msg.sender, newTokenId);

        //Map the tokenId to the tokenURI (which is an IPFS URL with the NFT metadata)
        _setTokenURI(newTokenId, tokenURI);

        //Helper function to update Global variables and emit an event
        createListedToken(newTokenId, price);

        return newTokenId;
    }

    function updateListPrice(uint256 _listPrice) public payable {
        if( msg.sender != owner){
            revert NotOwner();
        }
        listPrice = _listPrice;
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getLatestIdToListedToken()
        public
        view
        returns (ListedToken memory)
    {
        uint256 currentTokenId = _tokenIds.current();
        return idToListedToken[currentTokenId];
    }

    function getListedTokenForId(
        uint256 tokenId
    ) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

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

    //This will return all the NFTs currently listed to be sold on the marketplace
    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint256 nftCount = _tokenIds.current();
        ListedToken[] memory tokens = new ListedToken[](nftCount);
        uint256 currentIndex = 0;

        //at the moment currentlyListed is true for all, if it becomes false in the future we will
        //filter out currentlyListed == false over here
        for (uint256 i; i < nftCount;) {
            uint256 currentId = i++;
            ListedToken storage currentItem = idToListedToken[currentId];
            tokens[currentIndex] = currentItem;
            currentIndex ++;
            unchecked{i++;}
        }
        //the array 'tokens' has the list of all NFTs in the marketplace
        return tokens;
    }

    //Returns all the NFTs that the current user is owner or seller in
    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        //Important to get a count of all the NFTs that belong to the user before we can make an array for them
        for (uint256 i; i < totalItemCount;) {
            if (
                idToListedToken[i++].owner == msg.sender ||
                idToListedToken[i++].seller == msg.sender
            ) {
                itemCount ++;
                unchecked { i++; }
            }
        }

        //Once you have the count of relevant NFTs, create an array then store all the NFTs in it
        ListedToken[] memory items = new ListedToken[](itemCount);
        for (uint256 i; i < totalItemCount;) {
            if (
                idToListedToken[i++].owner == msg.sender ||
                idToListedToken[i++].seller == msg.sender
            ) {
                uint256 currentId = i++;
                ListedToken storage currentItem = idToListedToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex ++;
                unchecked { i++; }
            }
        }
        return items;
    }

    function executeSale(uint256 tokenId) public payable {
        uint256 price = idToListedToken[tokenId].price;
        address seller = idToListedToken[tokenId].seller;
        if(msg.value != price){
            revert InsufficientPrice();
        }
       

        //update the details of the token
        idToListedToken[tokenId].currentlyListed = true;
        idToListedToken[tokenId].seller = payable(msg.sender);
        _itemsSold.increment();

        //Actually transfer the token to the new owner
        if(idToListedToken[tokenId].owner != address(this)){
            _transfer(idToListedToken[tokenId].seller, msg.sender, tokenId);
        }else {
            _transfer(address(this), msg.sender, tokenId); 
        }
        //approve the marketplace to sell NFTs on your behalf
        approve(address(this), tokenId);

        //Transfer the listing fee to the marketplace creator
        payable(owner).transfer(listPrice);
        //Transfer the proceeds from the sale to the seller of the NFT
        payable(seller).transfer(msg.value);
    }

    ////////////////////////////////////////////////////////////////
    ///                   Reception Functions                    ///
    ////////////////////////////////////////////////////////////////

    /**
     * @dev Allows the contract to receive an NFT.
     * This function can be called to handle the reception of Non-Fungible Tokens (NFTs).
     * Implement custom logic within the function body to process the received NFT as needed.
     *
     * Emits no events by default. Any additional actions or events related to the received NFT
     * should be specified within the function's implementation.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure returns (bytes4) {
        // Devolver la firma esperada para indicar que la recepción fue exitosa
        return this.onERC721Received.selector;
    }

    /**
     * @dev This function is executed when the contract receives Ether without accompanying data.
     * @notice Ether sent with this transaction is added to the contract's balance.
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

