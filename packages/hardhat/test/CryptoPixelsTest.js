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

      // Have 2 pixels been sold?
      expect((await cryptoPixels.getSoldPixels()).length).to.equal(2);
        
      // Try to re-buy the same NFTs with another wallet (shouldn't work) 
      await expect(cryptoPixels.connect(wallet3).buyPixels(buy, {value: price(3)})).to.be.revertedWith('ALREADY MINTED');
      
      // TokenURI should be available
      expect(await cryptoPixels.tokenURI(buy[0].id)).to.equal('https://ipfs.io/ipfs/' + buy[0].ipfs);
      expect(await cryptoPixels.tokenURI(buy[1].id)).to.equal('https://ipfs.io/ipfs/' + buy[1].ipfs);
      await expect(cryptoPixels.tokenURI('999')).to.be.revertedWith('This pixel has not been minted yet - 1');
    
      // POTENTIAL TODO: Get contract return value (I didn't get any return value except the transaction)
      

      // Check for Reserved (We need to generate more pixels to get here :) )
      expect(await cryptoPixels.isReserved(1)).to.be.equal(false);
      expect(await cryptoPixels.isReserved(3000)).to.be.equal(false);
      expect(await cryptoPixels.isReserved(4445)).to.be.equal(true);
      expect(await cryptoPixels.isReserved(4461)).to.be.equal(false);
      expect(await cryptoPixels.isReserved(5656)).to.be.equal(true);
      expect(await cryptoPixels.isReserved(8000)).to.be.equal(false);

      //  Adjust pixel price
      let newPrice = '2'
      expect(await cryptoPixels.getPricePerPixel()).to.be.equal(utils.parseEther(costPerPixel.toString()))
      await cryptoPixels.connect(owner).changePricePerPixel(utils.parseEther(newPrice));
      await expect(cryptoPixels.connect(wallet2).changePricePerPixel(utils.parseEther(newPrice))).to.be.revertedWith('Ownable: caller is not the owner');
      expect(await cryptoPixels.getPricePerPixel()).to.be.equal(utils.parseEther(newPrice))

      // Try to withdraw money
      let currentBalance = await owner.getBalance()
      await cryptoPixels.withdrawPayments(owner.address);
      expect(await owner.getBalance()).to.be.above(currentBalance)

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