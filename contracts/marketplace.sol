// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Airplane.sol";

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
}

contract Marketplace is ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    using Address for address;
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeERC20 for IERC20;
    address adminAddress;
    bool marketplaceStatus;
    EnumerableSet.AddressSet tokenWhiteList;

    IERC20 paymentToken;

    uint256 listingFee = 0 ether; // minimum price, change for what you want
    uint256 _serviceFee = 0;  // 0 % with 1000 factor

    struct ListItem {
        uint256 tokenId;
        address seller;
    }

    struct ListItemInput {
        address nftContract;
        uint256 tokenId;
    }

    struct TransferItem {
        address nftContract;
        uint8 contractType;
        uint256 tokenId;
        uint256 amount;
        address toAccount;
    }

    struct CollectionMarket {
      EnumerableSet.UintSet tokenIdsListing;
      mapping(uint256 => ListItem) listings;
    }

    mapping(address => CollectionMarket) private _marketplaceSales;

    // declare a event for when a item is created on marketplace
    event TokenListed(
        address indexed nftnftContract,
        uint256 indexed tokenId,
        string indexed contractType,
        ListItem listItem
    );
    event TokenDelisted(
        address indexed nftContract,
        uint256 indexed tokenId,
        ListItem listItem
    );
    event TokenBought(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed buyer,
        ListItem listing
    );

    constructor(address _paymentToken) {
        adminAddress = msg.sender;
        marketplaceStatus = true;
        paymentToken = IERC20(_paymentToken);
        tokenWhiteList.add(msg.sender);
    }

    modifier onlyMarketplaceOpen() {
        require(marketplaceStatus, "Listing and bid are not enabled");
        _;
    }

    modifier onlyWhiteList() {
        require(tokenWhiteList.contains(msg.sender), "Listing and bid are not enabled");
        _;
    }

    function _isTokenApproved(address nftContract, uint256 tokenId)
        private
        view
        returns (bool)
    {
        IERC721 _erc721 = IERC721(nftContract);
        try _erc721.getApproved(tokenId) returns (address tokenOperator) {
            return tokenOperator == address(this);
        } catch {
            return false;
        }
    }

    function _isAllTokenApproved(address nftContract, address owner)
        private
        view
        returns (bool)
    {
        IERC721 _erc721 = IERC721(nftContract);
        return _erc721.isApprovedForAll(owner, address(this));
    }

    function _isTokenOwner(
        address nftContract,
        uint256 tokenId,
        address account
    ) private view returns (bool) {
        IERC721 _erc721 = IERC721(nftContract);
        try _erc721.ownerOf(tokenId) returns (address tokenOwner) {
            return tokenOwner == account;
        } catch {
            return false;
        }
    }

    function _isListItemValid(address nftContract, ListItem memory listItem)
        private
        view
        returns (bool isValid)
    {
        if (
            _isTokenOwner(nftContract, listItem.tokenId, listItem.seller) &&
            (_isTokenApproved(nftContract, listItem.tokenId) ||
                _isAllTokenApproved(nftContract, listItem.seller))
        ) {
            isValid = true;
        }
    }


    // returns the listing price of the contract
    function getListingPrice() public view returns (uint256) {
        return listingFee;
    }


    function addWhiteLilst(address wallet) external onlyOwner {
        tokenWhiteList.add(wallet);
    }

    function getServiceFee() public view returns (uint256) {
        return _serviceFee;
    }

    function setServiceFee(uint256 fee) external onlyOwner {
        require(
            fee <= 100,
            "Attempt to set percentage higher than 10 %"
        );
        _serviceFee = fee;
    }

    function changeMarketplaceStatus (bool status) external onlyOwner {
        require(status != marketplaceStatus, "Already set.");
        marketplaceStatus = status;
    }

    function _delistToken(address nftContract, uint256 tokenId) private {
        if (_marketplaceSales[nftContract].tokenIdsListing.contains(tokenId)) {
            delete _marketplaceSales[nftContract].listings[tokenId];
            _marketplaceSales[nftContract].tokenIdsListing.remove(tokenId);
        }
    }
    // places an item for sale on the marketplace

    function listToken(
        address nftContract,
        uint256 tokenId
    ) public payable nonReentrant onlyMarketplaceOpen onlyWhiteList {

        require(!_marketplaceSales[nftContract].tokenIdsListing.contains(tokenId), "Already listed");

        ListItem memory listItem = ListItem(
            tokenId,
            msg.sender
        );

        require(
            _isListItemValid(nftContract, listItem),
            "Listing is not valid"
        );

        _marketplaceSales[nftContract].listings[tokenId] = listItem;
        _marketplaceSales[nftContract].tokenIdsListing.add(tokenId);

        if (listingFee > 0) {
            payable(adminAddress).transfer(listingFee);
        }
        emit TokenListed(nftContract, tokenId, "erc721", listItem);
    }

    function delistToken(address nftContract, uint256 tokenId)
        external
        onlyWhiteList
    {
        require(
            _marketplaceSales[nftContract].listings[tokenId].seller == msg.sender,
            "Only token seller can delist token"
        );

        emit TokenDelisted(
            nftContract,
            tokenId,
            _marketplaceSales[nftContract].listings[tokenId]
        );

        _delistToken(nftContract, tokenId);
    }

    function buyToken(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant onlyMarketplaceOpen onlyWhiteList {

        ListItem memory listItem = _marketplaceSales[nftContract].listings[tokenId];

        require(
            _isListItemValid(nftContract, listItem),
            "Not for sale"
        );
        require(
            !_isTokenOwner(nftContract, tokenId, msg.sender),
            "Token owner can't buy their own token"
        );

        uint256 totalPrice = Airplane(nftContract).cost();
   
        paymentToken.safeTransferFrom(msg.sender, listItem.seller, totalPrice);

        IERC721(nftContract).safeTransferFrom(listItem.seller, msg.sender, tokenId);

        emit TokenBought(
            nftContract,
            tokenId,
            msg.sender,
            listItem
        );

        _delistToken(nftContract, tokenId);
    }

    function getTokenListing(address nftContract, uint256 tokenId)
        public
        view
        returns (ListItem memory validListing)
    {
        ListItem memory listing = _marketplaceSales[nftContract].listings[tokenId];
        if (_isListItemValid(nftContract, listing)) {
            validListing = listing;
        }
    }

    function numOfTokenListings(address nftContract)
        public
        view
        returns (uint256)
    {
        return _marketplaceSales[nftContract].tokenIdsListing.length();
    }

    function getTokenListings(
        address nftContract,
        uint256 from,
        uint256 size
    ) public view returns (ListItem[] memory listings) {
        uint256 listingsCount = numOfTokenListings(nftContract);

        if (from < listingsCount && size > 0) {
            uint256 querySize = size;
            if ((from + size) > listingsCount) {
                querySize = listingsCount - from;
            }
            listings = new ListItem[](querySize);
            for (uint256 i = 0; i < querySize; i++) {
                uint256 tokenId = _marketplaceSales[nftContract]
                    .tokenIdsListing
                    .at(i + from);
                ListItem memory listing = _marketplaceSales[nftContract].listings[
                    tokenId
                ];
                if (_isListItemValid(nftContract, listing)) {
                    listings[i] = listing;
                }
            }
        }
    }
}
