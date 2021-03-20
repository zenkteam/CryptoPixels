pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
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

  // Reserved: [x from, x to, y from, y to]
  uint16[4][] private reserved = [ [200, 400, 200, 400], [600, 800, 200, 400], [200, 400, 600, 800], [600, 800, 600, 800], [400, 600, 400, 600] ];


  constructor() public ERC721("CryptoPixels", "CPX") payable {
    _setBaseURI("https://ipfs.io/ipfs/"); // "https://api.cryptopixels.org/" ?
  }

  // This marks a pixel as "notForSale", that way we only write once something gets minted
  mapping (uint256 => bool) public notForSale;

  /**
    Provide a flexible array of 3 integers (tokenid, column, row)
   */
  function buyPixels(uint[4][] memory _pixels, uint256 amount) payable public returns (uint256) {
      require(_pixels.length > 0, 'You need at least buy one pixel');
      require(amount > 0, 'Not enough');
      require(amount <= 100, 'Only 100 pixels at a time');

      // CHECK IF: NOT RESERVED, VALID TOKEN RANGE, SET FOR SALE
      for (uint i = 0; i < _pixels.length; i++) {

        uint tokenId = _pixels[i][2];

        require(tokenId > 0 && tokenId < 10001, "TOKEN ID DOES NOT EXISt");
        require(!notForSale[tokenId], "NOT FOR SALE");

        for (uint r = 0; r < 5; i++) {
          // TODO: Check if X and Y are defined correctly
          uint x = _pixels[i][0];
          uint y = _pixels[i][1];
          require(x >= reserved[r][0] && x < reserved[r][1] && y >= reserved[r][2] && y < reserved[r][3], "RESERVED");
        }
      }

      // Make purchase
      _asyncTransfer(owner(), msg.value);

      // Mint
      for (uint i = 0; i < _pixels.length; i++) {
        
        uint tokenId = _pixels[i][2];

        // Mint the NFT and attach the token with the current ID to the message sender
        _mint(msg.sender, tokenId);

        // Set to notForSale
        notForSale[tokenId] = true;

        // Build token-specific URI which points to metadata
        _setTokenURI(tokenId, tokenURI(tokenId));
      }   
  }

  /**
  * We're overwriting this function as we can do it cheaper than the contract we're inherting from
  * @dev See {IERC721Metadata-tokenURI}.
  */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
      require(tokenId > 0 && tokenId < 10001, "ERC721Metadata: URI query for nonexistent token");
      return string(abi.encodePacked(baseURI(), tokenId.toString()));
  }

  /**
   * Withdraw funds
   
  function withdrawPayments(address payable payee) public onlyOwner override {
    _escrow.withdraw(owner());
  }*/
 
}