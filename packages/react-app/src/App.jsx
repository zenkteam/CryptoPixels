import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Fetcher, Route as URoute, Token, WETH, getDefaultProvider, getNetwork } from "@uniswap/sdk";
import WalletConnectProvider from "@walletconnect/web3-provider";
import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { Account, Header } from "./components";
import { INFURA_ID, NETWORKS } from "./constants";
import { useContractLoader } from "./hooks";
import { About, Faq, Imprint, Pixels, Privacy, Trade } from "./views";

// Switching to "mainnet" or "rinkeby" automatically changs the targetNetwork.rpcUrl
const network = 'localhost'
const targetNetwork = NETWORKS[network]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

function App() {
  const [ soldPixels, setSoldPixels ] = useState([])
  const [ ownPixels, setOwnPixels ] = useState([])
  const [ updating, setUpdating ] = useState(0)
  const [ centerPieceOwner, setCenterPieceOwner ] = useState(false)
  const [ mainnetProvider, setMainnetProvider ] = useState()
  const [ dappProvider, setDappProvider ] = useState()
  const [ price, setPrice ] = useState(0)
  const [ wallet, setWallet ] = useState()

  // The UserProvider is your wallet
  // We need this for readContract | so that we can read from the blockchain even though no wallet is connected
  const readContract = useContractLoader(dappProvider)
  // Obviusly only set if wallet is connected and a wallet is also needed to write to the blockchain
  const walletAddress = useUserAddress(wallet)
  const writeContract = useContractLoader(wallet)

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
      console.log("price", price)
      setPrice(price)
    }
    fetchPrice()
    
    setDappProvider(dappProvider)
    setMainnetProvider(mainnetProvider)
  }, [])

  useEffect(()=>{
    if(soldPixels.length === 0 && updating === 0 && readContract && readContract.CryptoPixels && walletAddress !== ''){
      setUpdating(1)
      updateCryptoPixels()
    }
  }, [readContract, walletAddress]);
  
  const updateCryptoPixels = async () => {
    let ownPixels = [], soldPixels = []

    let soldPixelList = await readContract.CryptoPixels.getSoldPixels()
    for(let i = 0; i < soldPixelList.length; ++i){
      soldPixels[i] = soldPixelList[i].toNumber()
    }

    if(walletAddress){
      console.log("I'M HERE")
      let ownedPixelList = await readContract.CryptoPixels.getMyPixels()
      console.log("owned", ownedPixelList)
      for(let i = 0; i < ownedPixelList.length; ++i){
        ownPixels[i] = ownedPixelList[i].toNumber()
        if(ownPixels[i] === 40000){
          setCenterPieceOwner(true)
          console.log("LAWL CRAZY OWNING THE CENTERPIECE")
        }
      }

      setOwnPixels(ownPixels)
    }
    
    setSoldPixels(soldPixels)
  }
  
  // Request SoldPixels from contract
  async function getSoldPixels() {
    const soldPixels = []
    const soldPixelList = await readContract.CryptoPixels.getSoldPixels()
    for (let i = 0; i < soldPixelList.length; ++i) {
      let purePixel = soldPixelList[i].toNumber()
      soldPixels.push(purePixel)
    }
    setSoldPixels(soldPixels)
  }
  useEffect(() => {
    if (readContract) {
      getSoldPixels()
    }
  }, [readContract])

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
        <Header/>

        {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
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

        <Switch>
          <Route path="/trade">
            <Trade
              mainnetProvider={mainnetProvider}
              wallet={wallet}
              targetNetwork={targetNetwork}
              writeContract={writeContract}
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
          <Route path="/">
            <Pixels
              soldPixels={soldPixels}
              ownPixels={ownPixels}
              wallet={wallet}
              targetNetwork={targetNetwork}
              mainnetProvider={mainnetProvider}
              dappProvider={dappProvider}
              writeContract={writeContract}
              readContract={readContract}
              price={price}
              loadWeb3Modal={loadWeb3Modal}
              updateCryptoPixels={updateCryptoPixels}
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