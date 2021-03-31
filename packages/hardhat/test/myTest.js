const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { utils } = require("ethers");
const fs = require("fs");
const { doesNotMatch } = require("assert");

use(solidity);

describe("CryptoPixels.org", function () {
  let cryptoPixels;
  let uploadedAssets = fs.readFileSync("./uploaded.json");
  let uploadedAssetsParsed = JSON.parse(uploadedAssets);
  let costPerPixel = 0.055066079;
  

  describe("CryptoPixels", function () {
    it("Should deploy CryptoPixels", async function () {
      /*let bytes32Array = []
      for(let a in uploadedAssetsParsed){
        let bytes32 = utils.id(a)
        bytes32Array.push(bytes32)
      }*/
      
      const CryptoPixels = await ethers.getContractFactory("CryptoPixels");
      cryptoPixels = await CryptoPixels.deploy();
    });

    describe("buyPixels()", function () {
      it("Should be able to buy multiple pixels", async function () {

        var [user1, user2, user3] = await ethers.getSigners()

        // Select 2 random pixels
        let tokenURIs = Object.values(uploadedAssetsParsed)
        let pixelsToBuy = [], used = []
        let amount = 3
        while(pixelsToBuy.length < amount){
          let r = parseInt(Math.random() * tokenURIs.length)
          if(used.indexOf(r) === -1){
            pixelsToBuy.push(tokenURIs[r])
            used.push(r)
          }
        }

        // Put together required data
        var buy = []
        for(let i = 0; i < pixelsToBuy.length; ++i){
          let x, y;
          for(let j = 0; j < pixelsToBuy[i].attributes.length; ++j){
            if(pixelsToBuy[i].attributes[j].trait_type === 'column'){
              x = pixelsToBuy[i].attributes[j].value
            } else if(pixelsToBuy[i].attributes[j].trait_type === 'row'){
              y = pixelsToBuy[i].attributes[j].value
            }
          }
          const pixelId = pixelsToBuy[i].pixelId
          buy.push({id: pixelsToBuy[i].pixelId, ipfs: pixelsToBuy[i].ipfsId, x: x, y: y })
        }

        console.log('Buying', buy)
        
        // Buy 2 NFTs (lazy mint)
        let price = costPerPixel * buy.length
        let boughtPixelsTx = await cryptoPixels.connect(user2).buyPixels(buy, {value: utils.parseEther(price.toString())})
        expect('buyPixels').to.be.calledOnContract(cryptoPixels)
        //let boughtPixels = await boughtPixelsTx.wait()

        // Try to re-buy the same NFTs (shouldn't work) 
       await expect(cryptoPixels.connect(user3).buyPixels(buy, {value: utils.parseEther(price.toString())})).to.be.revertedWith('NOT FOR SALE ANYMORE');

        //console.log('Bought Blocks', boughtPixels)

        //expect(boughtPixels).to.equal(buy.length);

        // See that the lazy minting runs through

        // Check that wallet actually holds those NFTs

        

        // Buy other NFTs

        
      });
    });

  });
});
