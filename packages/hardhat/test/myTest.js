const { ethers, network } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { utils, BigNumber, wei } = require("ethers");
const fs = require("fs");
const { doesNotMatch } = require("assert");

use(solidity);

describe("CryptoPixels.org", function () {
   
  let cryptoPixels, owner, wallet2, wallet3, provider; 
  let costPerPixel = 0.055066079;
  let buy = getRandomPixelsToBuy(3)
  let price = (amount) => utils.parseEther((costPerPixel * amount).toString()); // We're calculating Ether but save it as wei
  let wei = (bigNum) => utils.formatUnits(bigNum,'wei')
  

  beforeEach(async () => {
    /*await network.provider.request({
      method: "hardhat_reset",
      params: []
    })  */
    const CryptoPixels = await ethers.getContractFactory("CryptoPixels");
    cryptoPixels = await CryptoPixels.deploy();
    [owner, wallet2, wallet3] = await ethers.getSigners()
    provider = ethers.getDefaultProvider()
  });

  describe("buyPixels()", function () {

    it("Should lazy mint pixels", async function(){
    
      
      let actualPrice = price(2) // bignumber / wei
      
      expect(await cryptoPixels.connect(wallet2).buyPixels([buy[0], buy[1]], {value: actualPrice}))
                .to.emit(cryptoPixels, 'Transfer')


      // POTENTIAL TODO: Listen for Deposited event from Escrow contract (didn't manage to get it)
      //await expect(cryptoPixels.connect(wallet2).buyPixels([buy[2]], {value: price}))
      //          .to.emit(cryptoPixels, 'Deposited')


      // POTENTIAL TODO: Wallet should have less money  (it does, but I couldn't manage to get the exact amount)
      // let moneyBefore = await wallet3.getBalance() // in Wei as bignumber
      // let block = await provider.getBlock() // Get latest block
      // let expectedWalletBalanceAfterPriceAndGas = wei(moneyBefore.sub(actualPrice).sub(block.gasUsed))
      // expect(wei(await wallet2.getBalance())).to.equal(expectedWalletBalanceAfterPriceAndGas) 

      // Does Wallet2 own NFT #1?
      expect(await cryptoPixels.ownerOf(buy[0].id)).to.equal(wallet2.address);
      
      // Does Owner have open payments?
      expect(await cryptoPixels.payments(owner.address)).to.equal(actualPrice);
        
      // Try to re-buy the same NFTs (shouldn't work) 
      await expect(cryptoPixels.connect(wallet3).buyPixels(buy, {value: price})).to.be.revertedWith('NOT FOR SALE ANYMORE');
      
      // TokenURI should be available
      expect(await cryptoPixels.tokenURI(buy[0].id)).to.equal('https://ipfs.io/ipfs/' + buy[0].ipfs);
      expect(await cryptoPixels.tokenURI(buy[1].id)).to.equal('https://ipfs.io/ipfs/' + buy[1].ipfs);
      await expect(cryptoPixels.tokenURI('999')).to.be.revertedWith('This pixel has not been minted yet - 1');

    
      // POTENTIAL TODO: Get contract return value (I didn't get any return value except the transaction)


      // POTENTIAL TODO: Check for Reserved (We need to generate more pixels to get here :) )


      // TODO: Adjust pixel price


      // Try to withdraw money
      console.log('Owner status:', utils.formatEther(await provider.getBalance(owner.address)))
      await expect(cryptoPixels.withdrawPayments(owner.address)).to.emit(cryptoPixels, 'Withdrawn');
      console.log('Owner status:', utils.formatEther(await provider.getBalance(owner.address)))

    }); 
  });
});

function getRandomPixelsToBuy(amount){
  amount = amount || 3
  let uploadedAssetsParsed = JSON.parse(fs.readFileSync("./uploaded.json"));

  // Select 2 random pixels
  let tokenURIs = Object.values(uploadedAssetsParsed)
  let pixelsToBuy = [], used = []
  while(pixelsToBuy.length < amount){
    let r = parseInt(Math.random() * tokenURIs.length)
    if(used.indexOf(r) === -1){
      pixelsToBuy.push(tokenURIs[r])
      used.push(r)
    }
  }

  // Put together required data
  buy = []
  for(let i = 0; i < pixelsToBuy.length; ++i){
    let x, y;
    for(let j = 0; j < pixelsToBuy[i].attributes.length; ++j){
      if(pixelsToBuy[i].attributes[j].trait_type === 'column'){
        x = pixelsToBuy[i].attributes[j].value
      } else if(pixelsToBuy[i].attributes[j].trait_type === 'row'){
        y = pixelsToBuy[i].attributes[j].value
      }
    }
    buy.push({id: pixelsToBuy[i].pixelId, ipfs: pixelsToBuy[i].ipfsId, x: x, y: y })
  }

  return buy;
}