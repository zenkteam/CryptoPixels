import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import {  JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "antd/dist/antd.css";
import Web3Modal from "web3modal";
import "./App.css";
import { Header, Account } from "./components";
import { Pixels } from "./views";
import { INFURA_ID, NETWORKS } from "./constants";
import { useContractLoader } from "./hooks";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { Token, WETH, Fetcher, Route as URoute } from "@uniswap/sdk";

// Switching to "mainnet" or "rinkeby" automatically changs the targetNetwork.rpcUrl
const network = 'localhost'
const targetNetwork = NETWORKS[network]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

function App() {
  const [ soldPixels, setSoldPixels ] = useState([])
  const [ updating, setUpdating ] = useState(0)
  const [ ownPixels, setOwnPixels ] = useState()
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
    const dappProvider = new JsonRpcProvider(network === 'localhost' ? 'http://localhost:8545' : process.env.REACT_APP_PROVIDER)

    const fetchPrice = async () => {
      const DAI = new Token(
          mainnetProvider._network ? mainnetProvider._network.chainId : 1,
          "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          18,
      );
      const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], mainnetProvider);
      const route = new URoute([pair], WETH[DAI.chainId]);
      const price = parseFloat(route.midPrice.toSignificant(6));
      setPrice(price)
    }
    fetchPrice()
    
    setDappProvider(dappProvider)
    setMainnetProvider(mainnetProvider)

    
  }, [])

  //const transferEvents = useEventListener(contract, "CryptoPixels", "Transfer", mainnetProvider, 1);
 // console.log("📟 Transfer events:",transferEvents)

  useEffect(()=>{
    if(soldPixels.length === 0 && updating === 0 && readContract && readContract.CryptoPixels && walletAddress !== ''){
      setUpdating(1)
      updateCryptoPixels()
    }
  }, [readContract, walletAddress]); //, transferEvents
  
  const updateCryptoPixels = async () => {
    let ownPixels = [], soldPixels = []

    let soldPixelList = await readContract.CryptoPixels.getSoldPixels()
    for(let i = 0; i < soldPixelList.length; ++i){
      soldPixels[i] = soldPixelList[i].toNumber()
    }

    if(walletAddress){
      let ownedPixelList = await readContract.CryptoPixels.getMyPixels()
      for(let i = 0; i < ownedPixelList.length; ++i){
        ownPixels[i] = ownedPixelList[i].toNumber()
        if(ownPixels[i] === 40000){
          setCenterPieceOwner(true)
          console.log("LAWL CRAZY OWNING THE CENTERPIECE")
        }
      }
    }
    
    setSoldPixels(soldPixels)
    setOwnPixels(ownPixels)
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

      <BrowserRouter>
        <Switch>
          <Route path="/">
            <Pixels
              soldPixels={soldPixels}
              ownPixels={ownPixels}
              wallet={wallet}
              targetNetwork={targetNetwork}
              mainnetProvider={mainnetProvider}
              writeContract={writeContract}
              readContract={readContract}
              price={price}
              loadWeb3Modal={loadWeb3Modal}
              updateCryptoPixels={updateCryptoPixels}
            />
          </Route>
        </Switch>
      </BrowserRouter>


      <canvas id="world"></canvas>
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