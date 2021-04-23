import React from "react";

export default function About() {

  return (
    <div className="textPage">
      <h2>About</h2>

      <div className="textBlock">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/kNHLVD5l2m0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>

      <div className="textBlock" style={{marginTop:'30px'}}>
        Around 15 Years ago a guy named Alex Tew started the milliondollarhomepage. On the page he showed a 1000x1000 Pixel Grid with 1 Million Pixels. Each Pixel could be bought for the price of $1. The project went viral and in the end he was able to sell all Pixels and even auctioned the last 1000 for over $30.000. Now since back then the internet has changed, technologies have changed and new possibilities are here. Just recently the concept of NFTs (Non Fungible Tokens) has taken over the internet and transformed the way digital items can be made provably unique and offer a proof of ownership. So in short Cryptopixels.org is a NFT based version of the MillionDollarHomepage. People who buy Cryptopixels NFTs actually own a unique digital Pixel Space on cryptopixels.org On their dedicated area they can upload a picture and hyperlink it to promote their art, product, project or whatever they like. The price per pixel is $1. Cryptopixel NFTs are sold in 10x10 Pixel Blocks, 1 Block includes 100 Pixels and therefore costs $100 in the intial offering. Of course owners of Cryptopixels NFTs are free to resell them for their own prices whenever they like, or buy addtional blocks. Each Block has unique cooordinates, which allows owners of multiple blocks to connect them and therefore upload bigger images. Cryptopixels.org simply detects all NFTs someone owns, when they sign in with MetaMask or a similar Ethereum Based Wallet. When 990,000 Pixels of the intitial offering have been sold an auction for the last 10,000 Pixels (the most valuable Center Piece) starts. All uploaded images are stored on IPFS.
      </div>

      <h2 style={{marginTop:'30px'}}>Who are we?</h2>

      <div className="textBlock">
        We're Oskar, Max and Philipp - three entrepreneurs. Oskar has been a Youtuber for over ten years and started several channels. Max and Philipp have been working together for over 8 years and are the developers of stomt.com. 
      </div>

      <h2 style={{marginTop:'30px'}}>What are you going to do with all the money?</h2>

      <div className="textBlock">
        <p>Philipp and Max are starting to become very committed to the blockchain. This is their first project. They took part in the NFTHack-Hackathon (from Ethereum Global foundation) and are already part of the "Scaling Ethereum" hackathon. Having over ten years of experience building web platforms you can expect valuable contributions to the blockchain community, seed-funded by this project.</p>

        <p>Oskar's current channel is about trying new business ideas. He'll use the money to try risikier things and to be able to make a living as a creator.</p>
      </div>
    </div>
  );
}
