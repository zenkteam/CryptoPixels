const { ethers, network } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { utils, BigNumber, wei } = require("ethers");
const fs = require("fs");
const { doesNotMatch } = require("assert");

use(solidity);

describe("CryptoPixels.org", function () {
   
  let cryptoPixels, owner, wallet2, wallet3, provider; 
  let costPerPixel = 0.0407094849029;
  let buy = getRandomPixelsToBuy(3)
  let price = (amount) => utils.parseEther((costPerPixel * amount).toString()); // We're calculating Ether but save it as wei
  let wei = (bigNum) => utils.formatUnits(bigNum,'wei')
  let baseUri = 'https://cryptopixels.org/api/pixel/'

  const ERRORS = {
    E1: 'NOT ENOUGH PIXELS',
    E2: 'TOO MANY PIXELS',
    E3: 'ALL PIXELS HAVE BEEN MINTED - TIME FOR THE CENTER PIECE',
    E4: 'NOT PAYED ENOUGH',
    E5: 'DOES NOT EXIST, HAS ALREADY BEEN MINTED OR IS RESERVED',
    E6: 'ERC721Metadata: URI query for nonexistent token',
  }

  beforeEach(async () => {
    const CryptoPixels = await ethers.getContractFactory("CryptoPixels");
    cryptoPixels = await CryptoPixels.deploy([baseUri]);
    [owner, wallet2, wallet3] = await ethers.getSigners()
    provider = ethers.getDefaultProvider()
  });


  describe("buyPixels()", function () {

    it("Should lazy mint pixels", async function(){
    
      
      const actualPrice = price(2) // bignumber / wei
      
      expect(await cryptoPixels.connect(wallet2)
                .buyPixels([buy[0], buy[1]], {value: actualPrice}))
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
      expect(await cryptoPixels.ownerOf(buy[0])).to.equal(wallet2.address);
      
      // Does Owner have open payments?
      expect(await cryptoPixels.payments(owner.address)).to.equal(actualPrice);

      // Have 2 pixels been sold?
      expect((await cryptoPixels.getSoldPixels()).length).to.equal(2);
        
      // Try to re-buy the same NFTs with another wallet (shouldn't work) 
      await expect(cryptoPixels.connect(wallet3).buyPixels(buy, {value: price(3)})).to.be.revertedWith('already minted');
      
      // TokenURI should be available
      console.log(await cryptoPixels.tokenURI(buy[0]))
      expect(await cryptoPixels.tokenURI(buy[0])).to.equal(baseUri + buy[0].toString());
      //expect((await cryptoPixels.tokenURI(buy[1])).toString()).to.equal(baseUri + buy[1]);
      //await expect(cryptoPixels.tokenURI(BigNumber.from('999'))).to.be.revertedWith('not minted, yet');
    
      // POTENTIAL TODO: Get contract return value (I didn't get any return value except the transaction)
      

      // Check for Reserved (We need to generate more pixels to get here :) )
      expect(await cryptoPixels.isReserved(1)).to.be.equal(false);
      expect(await cryptoPixels.isReserved(3000)).to.be.equal(false);
      expect(await cryptoPixels.isReserved(4445)).to.be.equal(true);
      expect(await cryptoPixels.isReserved(4461)).to.be.equal(false);
      expect(await cryptoPixels.isReserved(5656)).to.be.equal(true);
      expect(await cryptoPixels.isReserved(8000)).to.be.equal(false);
      expect(await cryptoPixels.isReserved(40000)).to.be.equal(true);

      //  Adjust pixel price
      let newPrice = '2'
      expect(await cryptoPixels.getEtherPricePerPixel()).to.be.equal(utils.parseEther(costPerPixel.toString()))
      await cryptoPixels.connect(owner).setEtherPricePerPixel(utils.parseEther(newPrice));
      await expect(cryptoPixels.connect(wallet2).setEtherPricePerPixel(utils.parseEther(newPrice))).to.be.revertedWith('Ownable: caller is not the owner');
      expect(await cryptoPixels.getEtherPricePerPixel()).to.be.equal(utils.parseEther(newPrice))

      // Try to withdraw money
      let currentBalance = await owner.getBalance()
      await cryptoPixels.withdrawPayments(owner.address);
      expect(await owner.getBalance()).to.be.above(currentBalance)

    }); 
  });
});

function getRandomPixelsToBuy(amount){
  amount = amount || 3

  // Put together required data
  let buy = [], numbers = []
  for(let i = 0; i < amount; ++i){
    let n = randomNumber(1,1000)
    numbers.push(n)
    buy.push(BigNumber.from(n))
  }

  console.log("ATTEMPTING TO BUY", numbers)

  return buy;
}

function randomNumber(min, max) {
  max = max || 10
  return ~~(Math.random() * (max - min) + min)
}