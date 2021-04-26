import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Fetcher, Route as URoute, Token, WETH } from "@uniswap/sdk";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { PageHeader } from "antd";
import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { Account } from "./components";
import { INFURA_ID, NETWORKS } from "./constants";
import { useContractLoader } from "./hooks";
import { About, Faq, Imprint, Manage, Pixels, Privacy, Trade, YourPixels } from "./views";

// Switching to "localhost", "mainnet" or "rinkeby" automatically changs the targetNetwork.rpcUrl
// Define the the variable REACT_APP_NETWORK in your .env file
const network = process.env.REACT_APP_NETWORK || 'localhost'
const targetNetwork = NETWORKS[network]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

function App() {
  const [ soldPixels, setSoldPixels ] = useState([])
  const [ ownPixels, setOwnPixels ] = useState([])
  const [ apiPixels, setApiPixels ] = useState([])
  const [ mainnetProvider, setMainnetProvider ] = useState()
  const [ dappProvider, setDappProvider ] = useState()
  const [ price, setPrice ] = useState(0)
  const [ wallet, setWallet ] = useState()
  const [ soldButNotMineCryptoPixels, setSoldButNotMineCryptoPixels] = useState([])
  const [ ownCryptoPixels, setOwnCryptoPixels ] = useState([])
  
  // The UserProvider is your wallet
  // We need this for readContract | so that we can read from the blockchain even though no wallet is connected
  const readContract = useContractLoader(dappProvider)
  // Obviusly only set if wallet is connected and a wallet is also needed to write to the blockchain
  const walletAddress = useUserAddress(wallet)
  const readWriteContractViaWallet = useContractLoader(wallet)

  // Request OwnPixels from contract | Seems like we need a 
  async function getOwnPixels() {
    if(walletAddress && readWriteContractViaWallet){
      const ownPixels = await readWriteContractViaWallet.CryptoPixels.getMyPixels()
      const ownPixelArray = Array.from(ownPixels)
      setOwnPixels(ownPixelArray)
      return ownPixelArray;
    } else {
      return [];
    }
  }
  
  // Request SoldPixels from contract
  async function getSoldPixels() {
    const soldPixelList = await readContract.CryptoPixels.getSoldPixels()
    const soldPixels = new Array(soldPixelList.length)
    for (let i = 0; i < soldPixelList.length; ++i) {
      soldPixels[i] = soldPixelList[i].toNumber()
    }
    setSoldPixels(soldPixels)
  }

  async function getApiPixels() {
    return fetch(process.env.REACT_APP_API_URL + 'pixels')
      .then(res => res.json())
      .then(pixels => pixels.map((pixel) => {
        pixel.pixel_id = parseInt(pixel.pixel_id);
        pixel.pixel_to_id = parseInt(pixel.pixel_to_id);
        pixel.width = pixel.pixel_to_id % 100 - pixel.pixel_id % 100 + 1;
        pixel.width_px = pixel.width * 10;
        pixel.height = Math.floor(pixel.pixel_to_id / 100) - Math.floor(pixel.pixel_id / 100) + 1; // TODO handle last col
        pixel.height_px = pixel.height * 10;
        return pixel;
      }))
      .then(setApiPixels);
  }
  
  // Calculate areas with edging pixels - we call them "cryptopixels"
  function calculateCryptoPixels(ids){

    // handle border cases
    if (ids.length === 0) {
      return [];
    } else if (ids.length === 1) {
      return [{
        pixel_id: ids[0],
        pixel_to_id: ids[0],
        width: 1,
        width_px: 10,
        height: 1,
        height_px: 10,
      }];
    }

    ids.sort((a, b) => {
      return a - b;
    })

    const adjacents = [[ids[0]]]
    const stacked = []
    const idRanges = []
    
    let adjacentCount = 0
    for(let i = 1; i <= ids.length; ++i){
        // If not adjacent, start new row
        if(ids[i] !== ids[i - 1]+1){
          idRanges[adjacentCount] = [adjacents[adjacentCount][0], adjacents[adjacentCount][ adjacents[adjacentCount].length-1 ]]
          ++adjacentCount
        }

        // Create row
        if(!adjacents[adjacentCount]){
            adjacents[adjacentCount] = []
        }
        
        // Push id into row
        adjacents[adjacentCount].push(ids[i])
    }

    if(adjacents.length > 1){
        let stackedCount = 0;
        for(let j = 1; j <= adjacents.length; ++j){
          let found = false;
          if(adjacents[j-1][0]){
            if(!stacked[stackedCount]){
              // startId, width, rows
              stacked[stackedCount] = [adjacents[j-1][0], adjacents[j-1].length, 1, idRanges[j-1]]
            }

            // check if adjacent has the same size as previously stacked one
            if(adjacents[j-1].length > 1){
              for (let s = 0; !found && s <= stackedCount; ++s) {
                if (
                  stacked[s][1] === adjacents[j].length &&
                  (stacked[s][0] + stacked[s][2] * 100) === adjacents[j][0]
                ) {
                  ++stacked[s][2]
                  found = true
                }
              }
            }
          }

          if (!found) {
            ++stackedCount
          }
        }
    }

    return stacked.map((stack) => {
      return {
        pixel_id: stack[3][0],
        pixel_to_id: stack[3][1] + (stack[2] - 1) * 100,
        width: stack[1],
        width_px: stack[1] * 10,
        height: stack[2],
        height_px: stack[2] * 10,
      }
    })
  }

  // Called once during first time render
  useEffect(() => {
    const mainnetProvider = new JsonRpcProvider(targetNetwork.rpcUrl);
    const dappProvider = new JsonRpcProvider(network === 'localhost' ? 'http://localhost:8545' : targetNetwork.rpcUrl)

    const fetchPrice = async () => {
      const DAI = new Token(
          mainnetProvider._network ? mainnetProvider._network.chainId : 1,
          "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          18,
      );
      const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], mainnetProvider.chainId);
      const route = new URoute([pair], WETH[DAI.chainId]);
      const price = parseFloat(route.midPrice.toSignificant(6));
      setPrice(price)
    }
    fetchPrice()

    setDappProvider(dappProvider)
    setMainnetProvider(mainnetProvider)
  }, [])

  // Called one time once read/write contract is available
  useEffect(()=>{
    if(ownPixels.length === 0 && readWriteContractViaWallet){
      getOwnPixels()
    }
  }, [readWriteContractViaWallet]);

  useEffect(()=>{
    if(soldPixels.length === 0 && readContract){
      getSoldPixels()
    }
  }, [readContract]);
  
  useEffect(() => {
    getApiPixels();
  }, []);

  // Merge Pixel Information
  useEffect(() => {
    const soldButNotMineApiPixels = apiPixels.filter((pixel) => pixel.owner !== walletAddress);
    const ownApiPixels = apiPixels.filter((pixel) => pixel.owner === walletAddress);

    const soldButNotMine = soldPixels.filter((i) => ownPixels.indexOf(i) === -1)
    const soldCryptoPixels = calculateCryptoPixels(soldButNotMine)

    // extend with api pixels
    for (const pixel of soldButNotMineApiPixels) {
      const matchingPixel = soldCryptoPixels.find((sold) => sold.pixel_id === pixel.pixel_id);
      if (matchingPixel) {
        matchingPixel.owner = pixel.owner;
        matchingPixel.link = pixel.link;
        matchingPixel.image = pixel.image;
      }
    }
    setSoldButNotMineCryptoPixels(soldCryptoPixels)

    const ownCryptoPixels = calculateCryptoPixels(ownPixels)
    for (let i = 0; i < ownCryptoPixels.length; i++) {
      ownCryptoPixels[i].owner = walletAddress;
    }
    // extend with api pixels
    for (const pixel of ownApiPixels) {
      const matchingPixel = ownCryptoPixels.find((own) => own.pixel_id === pixel.pixel_id);
      if (matchingPixel) {
        matchingPixel.owner = pixel.owner;
        matchingPixel.link = pixel.link;
        matchingPixel.image = pixel.image;
      }
    }
    setOwnCryptoPixels(ownCryptoPixels)
  }, [soldPixels, ownPixels, apiPixels])

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    const wallet = new Web3Provider(provider)
    setWallet(wallet);
  },[]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  return (
    <div className="App">
      <BrowserRouter>
      <div className="header">
        <Link to="/">
          <PageHeader
            title="CryptoPixels.org"
            subTitle="Buy a piece of internet history and own it forever."
            className="pageHeader"
          />
        </Link>

        <div className="headerLinks">
          <a href="https://opensea.io/collection/cryptopixelsorg" title="Trade on OpenSea" rel="noopener nofollow noreferrer" target="_blank">Trade</a>
          &nbsp;|&nbsp;
          {ownPixels.length > 0 &&
            <>
              <Link to="/yourpixels">Upload</Link>
              &nbsp;|&nbsp;
            </>
          }
          <Link to="/faq">FAQ</Link>
          &nbsp;|&nbsp;
          <Link to="/about">About</Link>
          &nbsp;|&nbsp;
          <a href="https://twitter.com/CryptoPixelsOrg" title="Follow us for Updates and Drops" rel="noopener nofollow noreferrer" target="_blank" id="twitter">Twitter</a>
          &nbsp;|&nbsp;
          <a href="https://discord.gg/7SWWSTyJj4" title="Join our community and trade" rel="noopener nofollow noreferrer" target="_blank" id="discord">Discord</a>
        </div>
        
        <div className="Account">
          <Account
            walletAddress={walletAddress}
            wallet={wallet}
            mainnetProvider={mainnetProvider}
            price={price}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            blockExplorer={targetNetwork.blockExplorer}
          />
        </div>
      </div>

        <Switch>
          <Route on path="/trade">
            <Trade/>
          </Route>
          <Route path="/manage">
            <Manage
              mainnetProvider={mainnetProvider}
              wallet={wallet}
              targetNetwork={targetNetwork}
              readWriteContractViaWallet={readWriteContractViaWallet}
              readContract={readContract}
              walletAddress={walletAddress}
            />
          </Route>
          <Route path="/faq">
            <Faq/>
          </Route>
          <Route path="/yourpixels">
            <YourPixels
              ownPixels={ownPixels}
              ownCryptoPixels={ownCryptoPixels}
              network={network}
              walletAddress={walletAddress}
              getApiPixels={getApiPixels}
            />
          </Route>
          <Route path="/about">
            <About/>
          </Route>
          <Route path="/imprint">
            <Imprint/>
          </Route>
          <Route path="/privacy">
            <Privacy/>
          </Route>
          <Route path="*">
            <Pixels
              soldPixels={soldPixels}
              ownPixels={ownPixels}
              wallet={wallet}
              targetNetwork={targetNetwork}
              mainnetProvider={mainnetProvider}
              dappProvider={dappProvider}
              readWriteContractViaWallet={readWriteContractViaWallet}
              readContract={readContract}
              price={price}
              loadWeb3Modal={loadWeb3Modal}
              getOwnPixels={getOwnPixels}
              walletAddress={walletAddress}
              calculateCryptoPixels={calculateCryptoPixels}
              soldButNotMineCryptoPixels={soldButNotMineCryptoPixels}
              ownCryptoPixels={ownCryptoPixels}
            />
          </Route>
        </Switch>

        <div className="links">
          <Link to="/imprint">Imprint</Link> |&nbsp; 
          <Link to="/privacy">Privacy</Link>
        </div>
        
      </BrowserRouter>
    </div>
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

 window.ethereum && window.ethereum.on('chainChanged', chainId => {
  setTimeout(() => {
    window.location.reload();
  }, 1);
})

export default App;