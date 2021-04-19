pragma solidity >= 0.8.0;
pragma abicoder v2;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/PullPayment.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two
// Payments: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/payment/PullPayment.sol
// Contract ERC271: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol

contract CryptoPixels is Ownable, PullPayment, ERC721 {

  struct CryptoPixel {
      uint256 id;
      string ipfs;
  }
  
  uint16 public pixelsRemaining;

  uint16[] public soldPixels;

  uint256 private pricePerPixel = 0.055066079 ether;

  // For Sale (maps a token id to its availability)
  mapping (uint256 => bool) public notForSale;

  //this lets you look up a token by the uri (assuming there is only one of each uri for now)
  mapping (uint256 => string) private _tokenURIs;

  constructor() ERC721("CryptoPixels", "CPX") payable {
    pixelsRemaining = 10000;
  }

  /**
    Allow to buy pixels in bulk
   */
  function buyPixels(CryptoPixel[] memory _pixels) payable public returns (CryptoPixel[] memory){
      require(_pixels.length > 0, 'NOT ENOUGH PIXELS');
      require(_pixels.length <= 1000, 'TOO MANY PIXELS');
      require(pixelsRemaining > 0, 'ALL PIXELS HAVE BEEN MINTED');
      
      uint256 minPrice = (pricePerPixel / 10 * 8) * _pixels.length;
      require(msg.value >= minPrice, 'NOT PAYED ENOUGH');

      for (uint8 i = 0; i < _pixels.length; i++) {
        require(_pixels[i].id > 0 && _pixels[i].id < 10001, "DOES NOT EXIST");
        require(!notForSale[_pixels[i].id], "ALREADY MINTED");
        require(!isReserved(_pixels[i].id), "RESERVED");
      }

      // Make purchase
      _asyncTransfer(owner(), msg.value);

      // Mint
      for (uint8 i = 0; i < _pixels.length; i++) {

        // Mint the NFT and attach the token with the current ID to the message sender
        _mint(msg.sender, _pixels[i].id);

        // Set to notForSale
        notForSale[_pixels[i].id] = true;

        --pixelsRemaining;

        soldPixels.push(uint16(_pixels[i].id));

        // Build token-specific URI which points to metadata
        _tokenURIs[_pixels[i].id] = _pixels[i].ipfs;
      } 

      return _pixels;
  }

  /**
  * Checks if id is within reserved range
  */
  function isReserved(uint256 pixelId) private pure returns (bool){
    if(pixelId < 4040 || pixelId > 5961) {
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
  function tokenURI(uint256 pixelId) public view virtual override returns (string memory) {
      require(!isReserved(pixelId), "ERC721Metadata: URI query for nonexistent token");
      require(notForSale[pixelId], 'This pixel has not been minted yet - 1');
      return string(abi.encodePacked(_baseURI(), _tokenURIs[pixelId]));
  }

  /**
    * @dev Base URI for computing {tokenURI}. Empty by default, can be overriden
    * in child contracts.
    */
  function _baseURI() override internal view virtual returns (string memory) {
      return "https://ipfs.io/ipfs/"; //"https://api.cryptopixels.org/"
  }

  /**
    * @dev Base URI for computing {tokenURI}. Empty by default, can be overriden
    * in child contracts.
    */
  function changePricePerPixel(uint256 newPricePerPixel) public onlyOwner {
      pricePerPixel = newPricePerPixel;
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
  function getSoldPixels() public view returns (uint16[] memory) {
      return soldPixels;
  }
  
}