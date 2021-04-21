pragma solidity >= 0.8.0;
pragma abicoder v2;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/PullPayment.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two
// Payments: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/payment/PullPayment.sol
// Contract ERC271: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol

contract CryptoPixels is Ownable, PullPayment, ERC721 {
  using Strings for uint256;

  string public baseUri = "https://cryptopixels.org/api/pixel/";
  
  uint256[] public soldPixels;

  uint256 private centerPieceId = 40000;
  uint256 private pricePerPixel = 0.0407094849029 ether;

  // For Sale (maps a token id to its availability)
  mapping (uint256 => bool) public notForSale;

  constructor() ERC721("CryptoPixels", "CPX") payable {
    _mint(msg.sender, centerPieceId);
    notForSale[centerPieceId] = true;
  }

  /**
    Allow to buy pixels in bulk
   */
  function buyPixels(uint256[] memory _pixels) payable public returns (uint256[] memory){
      require(_pixels.length > 0, 'not enough pixels');

      // Minium price
      uint256 minPrice = (pricePerPixel / 10 * 9) * _pixels.length;
      require(msg.value >= minPrice, 'more $ pls');

      // Check each pixels availability
      for (uint8 i = 0; i < _pixels.length; i++) {
        require(_pixels[i] > 0 && _pixels[i] < 10001, "not valid");
        require(!notForSale[_pixels[i]], "already minted");
        require(!isReserved(_pixels[i]), "reserved");
        require(_pixels[i] != centerPieceId, "centerpiece not allowed");
      }

      // Make purchase
      _asyncTransfer(owner(), msg.value);

      // Mint
      for (uint8 i = 0; i < _pixels.length; i++) {

        // Mint the NFT and attach the token with the current ID to the message sender
        _mint(msg.sender, _pixels[i]);

        // Set to notForSale
        notForSale[_pixels[i]] = true;

        // Add pixel to sold pixels
        soldPixels.push(_pixels[i]);
      } 

      return _pixels;
  }

/* NOT FINISHED
  function setForSale(uint256 pixelId, address forAddress) public {
    approve(forAddress, pixelId);
  }

  function buyFromSomeone(uint256 pixelId) public {
    // Split
    uint256 foundersShare = msg.value / 100 * 15;
    uint256 pixelOwnerShare = msg.value - founderShare;

    // Pay
    _asyncTransfer(pixelOwner, pixelOwner);
    _asyncTransfer(owner(), foundersShare);

    // Transfer
    safeTransferFrom(pixelOwner, msg.sender, pixelId);
  }
*/

  /**
  * Checks if id is within reserved range
  */
  function isReserved(uint256 pixelId) public view returns (bool){
    if(pixelId < 4040 || pixelId > 5961) {
      if(pixelId == centerPieceId){
        return true;
      }
      return false;
    }
    
    uint256 rest = pixelId % 1000;
    if(rest > 100){
      rest = rest % 100;
    } 
    return rest > 40 && rest < 61;
  }

  /**
  * We're overwriting this function as we can do it cheaper than the contract we're inherting from
  * @dev See {IERC721Metadata-tokenURI}.
  */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
      require(!isReserved(tokenId), "not minted, yet");
      require(notForSale[tokenId], 'ERC721Metadata: URI query for nonexistent token');
      require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token - exists");
      return string(abi.encodePacked(_baseURI(), tokenId.toString()));
  }

  /**
    * @dev Base URI for computing {tokenURI}. Empty by default, can be overriden
    * in child contracts.
    */
  function _baseURI() override internal view virtual returns (string memory) {
      return baseUri;
  }

  /**
    * @dev Base URI for computing {tokenURI}. Empty by default, can be overriden
    * in child contracts.
    */
  function changeEtherPricePerPixel(uint256 newPricePerPixel) public onlyOwner {
      pricePerPixel = newPricePerPixel;
  }

  /**
    * @dev Base URI for computing {tokenURI}. Empty by default, can be overriden
    * in child contracts.
    */
  function changeBaseUri(string memory newBaseUri) public onlyOwner {
      baseUri = newBaseUri;
  }

  /**
    * @dev Base URI for computing {tokenURI}. Empty by default, can be overriden
    * in child contracts.
    */
  function getPricePerPixel() public view onlyOwner returns (uint256) {
      return pricePerPixel;
  }

  /**
    * @dev Get all ids of pixels sold
    */
  function getSoldPixels() public view returns (uint256[] memory) {
      return soldPixels;
  }
  
}