const { ethers, network } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { utils, BigNumber } = require("ethers");
const fs = require("fs");
const { doesNotMatch } = require("assert");

use(solidity);

describe("CryptoPixels.org", function () {
   
  let cryptoPixels, owner, wallet2, wallet3, provider; 
  let costPerPixel = 0.055066079;
  let buy = getRandomPixelsToBuy(2)
  let price = utils.parseEther((costPerPixel * buy.length).toString());
  

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
    
      let moneyBefore = await provider.getBalance(wallet2.address)
      console.log('cash left:',utils.formatEther(moneyBefore))
      expect(await cryptoPixels.connect(wallet2).buyPixels(buy, {value: price}))
                .to.emit(cryptoPixels, 'Transfer')
                .to.emit(cryptoPixels, 'Deposited')
      let moneyAfter = await provider.getBalance(wallet2.address)
      console.log('cash left:',utils.formatEther(moneyAfter))
        
      // Wallet should have less money
      //expect(await provider.getBalance(wallet3.address)).to.equal(moneyBefore.sub(price)) 
      
      // Try to re-buy the same NFTs (shouldn't work) 
      await expect(cryptoPixels.connect(wallet3).buyPixels(buy, {value: price})).to.be.revertedWith('NOT FOR SALE ANYMORE');

      expect(await cryptoPixels.payments(owner.address)).to.be.bignumber.equal(price);
      
      // TokenURI should be available
      expect(await cryptoPixels.tokenURI(buy[0].id)).to.equal('https://ipfs.io/ipfs/' + buy[0].ipfs);
      expect(await cryptoPixels.tokenURI(buy[1].id)).to.equal('https://ipfs.io/ipfs/' + buy[1].ipfs);
      expect(await cryptoPixels.tokenURI('999')).to.equal('https://ipfs.io/ipfs/');

      
      
      // Get contract return value


      // Check for Reserved


      // Adjust pixel price


      // Try to withdraw money
      expect(await cryptoPixels.withdrawPayments(owner.address)).to.emit(cryptoPixels, 'Withdrawn');

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