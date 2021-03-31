pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/payment/PullPayment.sol"; // ToDo Upgrade to OpenZeppelin 3.4 and change path
import "@openzeppelin/contracts/payment/escrow/Escrow.sol"; // ToDo Upgrade to OpenZeppelin 3.4 and change path
import "@openzeppelin/contracts/utils/Context.sol"; // ToDo Upgrade to OpenZeppelin 3.4 and change path
import "@openzeppelin/contracts/access/Ownable.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two
// Payments: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/payment/PullPayment.sol
// Contract ERC271: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol

contract CryptoPixels is  Context, Ownable, PullPayment, ERC721 {

  struct CryptoPixel {
      uint16 id;
      string ipfs;
      uint16 x;
      uint16 y;
  }


  // Reserved: [x from, x to, y from, y to]
  uint16[4][] private reserved = [ [200, 400, 200, 400], [600, 800, 200, 400], [200, 400, 600, 800], [600, 800, 600, 800], [400, 600, 400, 600] ];
  
  uint256 private pricePerPixel = 0.055066079 ether;

  // For Sale (maps a token id to its availability)
  mapping (uint16 => string) public notForSale;

  //this lets you look up a token by the uri (assuming there is only one of each uri for now)
  mapping (string => uint16) public ipfsToId;

  constructor() ERC721("CryptoPixels", "CPX") payable {
    _setBaseURI("https://ipfs.io/ipfs/"); // "https://api.cryptopixels.org/" ?
  }

  /**
    Allow to buy pixels in bulk
   */
  function buyPixels(CryptoPixel[] memory _pixels) payable public returns (CryptoPixel[] memory){
      require(_pixels.length > 0, 'You need at least buy one pixel');
      require(_pixels.length <= 1000, 'You can only buy 1000 pixels at a time');
      
      uint256 minPrice = pricePerPixel * 0.8 * _pixels.length;
      require(msg.value == pricePerPixel * _pixels.length && msg.value > minPrice, 'NOT PAYED ENOUGH');

      // CHECK IF: NOT RESERVED, VALID TOKEN RANGE, SET FOR SALE
      for (uint8 i = 0; i < _pixels.length; i++) {

        require(_pixels[i].id > 0 && _pixels[i].id < 10001, "PIXEL ID DOES NOT EXIST");
        
        require(!notForSale[_pixels[i].id], "NOT FOR SALE ANYMORE");

        /*for (uint r = 0; r < 5; i++) {
          require((_pixels[i].x <= reserved[r][0] || _pixels[i].x > reserved[r][1]) && (_pixels[i].y <= reserved[r][2] || _pixels[i].y > reserved[r][3]), "RESERVED");
        }*/
      }

      // Make purchase
      _asyncTransfer(owner(), msg.value);

      // Mint
      for (uint8 i = 0; i < _pixels.length; i++) {

        // Mint the NFT and attach the token with the current ID to the message sender
        _mint(msg.sender, _pixels[i].id);

        // Set to notForSale
        notForSale[_pixels[i].id] = _pixels[i].ipfs;

        // Build token-specific URI which points to metadata
        _setTokenURI(_pixels[i].id, _pixels[i].ipfs);

        ipfsToId[_pixels[i].ipfs] = _pixels[i].id;
      } 

      return (_pixels);
  }

  /**
  * We're overwriting this function as we can do it cheaper than the contract we're inherting from
  * @dev See {IERC721Metadata-tokenURI}.
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(tokenId > 0 && tokenId < 10001, "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(baseURI(), tokenId.toString()));
    }
  */

  /**
   * Withdraw funds
   
  function withdrawPayments(address payable payee) public onlyOwner override {
    _escrow.withdraw(owner());
  }*/
 
}