pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/payment/PullPayment.sol"; // ToDo Upgrade to OpenZeppelin 3.4 and change path
import "@openzeppelin/contracts/payment/PaymentSplitter.sol"; // ToDo Upgrade to OpenZeppelin 3.4 and change path
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two


// Payments: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/payment/PullPayment.sol
// Royalties: 
// Contract ERC271: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol

contract YourCollectible is ERC721, Ownable, PullPayment, PaymentSplitter {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;


  address payable public owner;

  // Reserved: [x from, x to, y from, y to]
  uint8[4] private _upperLeftGuard = [200, 400, 200, 400];
  uint8[4] private _upperRightGuard = [600, 800, 200, 400];
  uint8[4] private _lowerLeftGuard = [200, 400, 600, 800];
  uint8[4] private _lowerRightGuard = [600, 800, 600, 800];
  uint8[4] private _centerpiece = [400, 600, 400, 600];


  constructor(bytes32[] memory assetsForSale, bytes32[] memory payees) public ERC721("YourCollectible", "YCB") payable {
    
    _setBaseURI("https://ipfs.io/ipfs/");
    
    // Set all pixels that are for sales
    for(uint256 i=0;i<assetsForSale.length;i++){
      forSale[assetsForSale[i]] = true;
    }

    // Add payees for sales & royalties
    for(uint256 i=0;i<payees.length;i++){
      _addPayee(payees[i]);
    }
  }

  //this marks an item in IPFS as "forsale"
  mapping (bytes32 => bool) public forSale;
  //this lets you look up a token by the uri (assuming there is only one of each uri for now)
  mapping (bytes32 => uint256) public uriToTokenId;

  function mintPixel(string memory tokenURI) public returns (uint256)
  {
      // Generate hash from tokenURI | Can I also use my own generated TokenID?  
      bytes32 uriHash = keccak256(abi.encodePacked(tokenURI));

      // Make sure the uriHash is still for sale
      require(forSale[uriHash],"NOT FOR SALE");

      // Make sure the token is not for sale anymore
      forSale[uriHash] = false;

      // Increase token counter | Can I also use my own generated TokenID?  
      _tokenIds.increment();

      // Use current token counter as ID
      uint256 id = _tokenIds.current();

      // Mint the NFT and attach the token with the current ID to the message sender
      _mint(msg.sender, id);

      // Build token-specific URI
      _setTokenURI(id, tokenURI);

      // Save the tokenID and tokenURI combination
      uriToTokenId[uriHash] = id;

      return id;
  }

  function notReserved(uint[2][] memory _pixels){
      uint[] reserved = [_upperLeftGuard, _upperRightGuard, _lowerLeftGuard, _lowerRightGuard, _centerpiece];

      for (uint i = 0; i < _pixels.length; i++) {
        for (uint r = 0; r < 5; i++) {
          x = _pixels[i][0];
          y = _pixels[i][1];
          if (x >= reserved[r][0] && x < reserved[r][1] && y >= reserved[r][2] && y < reserved[r][3]) {
            return false;
          }
        }
      }

      return true;
  } 

  /**
    Provide a flexible array of 3 integers (tokenid, column, row)
   */
  function buyPixels(uint[4][] memory _pixels, uint256 amount) public returns (uint256){
      require(_pixels.length > 0, 'You need at least buy one pixel');
      require(amount > 0, 'Not enough');
      require(amount <= 100, 'Only 100 pixels at a time');
      require(notReserved(), 'These pixels are reserved');
      
      // Get paymentaddress

      // Make purchase
      _asyncTransfer(payee, msg.value);

      // Mint Item
      mintPixel();
  }

  function _baseURI() internal view virtual returns (string memory) {
      return "https://cryptopixels.org/";
  }

  public function setPixelForSale(string memory tokenURI){
      // Generate hash from tokenURI | Can I also use my own generated TokenID?  
      bytes32 uriHash = keccak256(abi.encodePacked(tokenURI));

      // Make sure the uriHash is still for sale
      require(!forSale[uriHash],"IS ALREADY FOR SALE");

      // Make sure the token is not for sale anymore
      forSale[uriHash] = true;


  }

  public function unsetPixelForSale(string memory tokenURI){
      // Generate hash from tokenURI | Can I also use my own generated TokenID?  
      bytes32 uriHash = keccak256(abi.encodePacked(tokenURI));

      // Make sure the uriHash is still for sale
      require(forSale[uriHash],"NOT FOR SALE");

      // Make sure the token is not for sale anymore
      forSale[uriHash] = false;
  }
 
}
