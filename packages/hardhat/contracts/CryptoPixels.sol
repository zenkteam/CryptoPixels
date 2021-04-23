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

  string public baseUri;
  
  uint256[] public soldPixels;

  uint256 public centerPieceId = 40000;

  uint256 public pricePerPixel = 0.042 ether;

  // For Sale (maps a token id to its availability)
  mapping (uint256 => bool) public notForSale;

  constructor(string memory newBaseUri) ERC721("CryptoPixelsOrg", "CPX") {
    baseUri = newBaseUri;
  }

  /**
    Allow to buy pixels in bulk
   */
  function buyPixels(uint256[] memory _pixels) payable public returns (uint256[] memory){
      require(_pixels.length > 0, 'not enough pixels');

      // Minium price
      uint256 minPrice = (pricePerPixel / 10 * 8) * _pixels.length;
      require(msg.value >= minPrice, 'more $ pls');

      // Check each pixels availability
      for (uint16 i = 0; i < _pixels.length; i++) {
        require(_pixels[i] > 0 && _pixels[i] < 10001, "not valid");
        require(!notForSale[_pixels[i]], "already minted");
        require(!isReserved(_pixels[i]), "reserved");
        require(_pixels[i] != centerPieceId, "centerpiece not allowed");
      }

      // Make purchase
      _asyncTransfer(owner(), msg.value);

      // Mint
      for (uint16 i = 0; i < _pixels.length; i++) {

        // Mint the NFT and attach the token with the current ID to the message sender
        _mint(msg.sender, _pixels[i]);

        // Set to notForSale
        notForSale[_pixels[i]] = true;

        // Add pixel to sold pixels
        soldPixels.push(_pixels[i]);
      } 

      return _pixels;
  }

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
      require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
      return string(abi.encodePacked(_baseURI(), tokenId.toString()));
  }

  /**
    * @dev Base URI for computing {tokenURI}. Empty by default, can be overriden
    * in child contracts.
    */
  function _baseURI() override internal view virtual returns (string memory) {
      return baseUri;
  }

  function mintCenterpiece() public onlyOwner {
    _mint(msg.sender, centerPieceId);
  }

  /**
    * @dev Set price per pixel
    */
  function setEtherPricePerPixel(uint256 newPricePerPixel) public onlyOwner {
      pricePerPixel = newPricePerPixel;
  }

  /**
    * @dev Get current price per pixel
    */
  function getEtherPricePerPixel() public view onlyOwner returns (uint256) {
      return pricePerPixel;
  }

  /**
    * @dev Get all ids of pixels sold
    */
  function getSoldPixels() public view returns (uint256[] memory) {
      return soldPixels;
  }

  /**
  * @dev Get all of an owners pixels
  */
  function getMyPixels() public view returns (uint16[] memory) {
    uint256[] memory ownedPixels = new uint256[](soldPixels.length);
    uint16 count = 0;
    for (uint16 i = 0; i < soldPixels.length; i++) {
      if(msg.sender == ownerOf(soldPixels[i])){
        ownedPixels[count] = soldPixels[i];
        ++count;
      }
    }

    uint16[] memory myPixels = new uint16[](count);   
    for (uint16 i = 0; i < count; i++) {
      myPixels[i] = uint16(ownedPixels[i]);
    }
    
    return myPixels; 
  }
  
}