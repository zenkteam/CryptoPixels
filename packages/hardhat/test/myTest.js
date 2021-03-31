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
  let [user1, user2, user3] = await ethers.getSigners()

  describe("CryptoPixels", function () {
    it("Should deploy CryptoPixels", async function () {
      /*let bytes32Array = []
      for(let a in uploadedAssetsParsed){
        let bytes32 = utils.id(a)
        bytes32Array.push(bytes32)
      }*/

      const CryptoPixels = await ethers.getContractFactory("CryptoPixels");
      cryptoPixels = await CryptoPixels.deploy(bytes32Array);
    });

    describe("buyPixels()", function () {
      it("Should be able to buy multiple pixels", async function () {

        // Select 2 random pixels
        let tokenURIs = Object.values(uploadedAssetsParsed)
        let randomTokenURI_1, randomTokenURI_2, pixelsToBuy
        do {
         randomTokenURI_1 = tokenURIs[parseInt(Math.random() * tokenURIs.length)]
         randomTokenURI_2 = tokenURIs[parseInt(Math.random() * tokenURIs.length)]
         pixelsToBuy = [randomTokenURI_1, randomTokenURI_2];
        } while (randomTokenURI_1 === randomTokenURI_2)

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

        console.log(buy)
        
        // Buy 2 NFTs (lazy mint)
        let boughtPixelsTx = await cryptoPixels.buyPixels(buy)
        let boughtPixels = await boughtPixelsTx.wait()

        console.log(boughtPixels)

        expect(boughtPixels).to.equal(buy);

        // See that the lazy minting runs through

        // Check that wallet actually holds those NFTs

        // Try to re-buy the same NFTs (shouldn't work) 

        // Buy other NFTs

        
      });
    });

  });
});
