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
import { About, Faq, Imprint, Manage, Pixels, Privacy, Trade } from "./views";

// Switching to "localhost", "mainnet" or "rinkeby" automatically changs the targetNetwork.rpcUrl
// Define the the variable REACT_APP_NETWORK in your .env file
const network = process.env.REACT_APP_NETWORK || 'localhost'
const targetNetwork = NETWORKS[network]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

function App() {
  const [ soldPixels, setSoldPixels ] = useState([])
  const [ ownPixels, setOwnPixels ] = useState([])
  // const [ centerPieceOwner, setCenterPieceOwner ] = useState(false)
  const [ mainnetProvider, setMainnetProvider ] = useState()
  const [ dappProvider, setDappProvider ] = useState()
  const [ price, setPrice ] = useState(0)
  const [ wallet, setWallet ] = useState()

  // The UserProvider is your wallet
  // We need this for readContract | so that we can read from the blockchain even though no wallet is connected
  const readContract = useContractLoader(dappProvider)
  // Obviusly only set if wallet is connected and a wallet is also needed to write to the blockchain
  const walletAddress = useUserAddress(wallet)
  const readWriteContractViaWallet = useContractLoader(wallet)

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
  
  // Request OwnPixels from contract | Seems like we need a 
  async function getOwnPixels() {
    if(walletAddress && readWriteContractViaWallet){
      const ownPixels = await readWriteContractViaWallet.CryptoPixels.getMyPixels()
      // if(ownPixels.indexOf(40000) !== -1){
      //   setCenterPieceOwner(true)
      // }
      setOwnPixels(Array.from(ownPixels))
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
          <Route path="/trade">
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