import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from "./constants";
import { Button, Alert, Card } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import assets from './assets.js'

const NFT_CONTRACT = "CryptoPixels"
/*
    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)

    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

const DEBUG = true

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS['localhost']; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

const { BufferList } = require('bl')
// https://www.npmjs.com/package/ipfs-http-client
//const ipfsAPI = require('ipfs-http-client');
//const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    console.log(file.path)
    if (!file.content) continue;
    const content = new BufferList()
    for await (const chunk of file.content) {
      content.append(chunk)
    }
    console.log(content)
    return content
  }
}
//console.log("📦 Assets: ",assets)

export default Web3Connect = () => {

    // 🛰 providers
    if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
    // const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
    // const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
    //
    // attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
    const scaffoldEthProvider = new JsonRpcProvider("https://rpc.scaffoldeth.io:48544")
    const mainnetInfura = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
    // ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

    // 🏠 Your local provider is usually pointed at your local blockchain
    const localProviderUrl = targetNetwork.rpcUrl;
    // as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
    const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
    if(DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
    const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

    // 🔭 block explorer URL
    const blockExplorer = targetNetwork.blockExplorer;

    const mainnetProvider = (scaffoldEthProvider && scaffoldEthProvider._network) ? scaffoldEthProvider : mainnetInfura
    // if(DEBUG) console.log("🌎 mainnetProvider",mainnetProvider)

    const [injectedProvider, setInjectedProvider] = useState();
    /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
    const price = useExchangePrice(targetNetwork, mainnetProvider);

    /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
    const gasPrice = useGasPrice(targetNetwork,"fast");
    // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
    const userProvider = useUserProvider(injectedProvider, localProvider);
    const address = useUserAddress(userProvider);
    
    // You can warn the user if you would like them to be on a specific network
    let localChainId = localProvider && localProvider._network && localProvider._network.chainId

    let selectedChainId = userProvider && userProvider._network && userProvider._network.chainId
    // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

    // The transactor wraps transactions and provides notificiations
    const tx = Transactor(userProvider, gasPrice)

    // Faucet Tx can be used to send funds from the faucet
    const faucetTx = Transactor(localProvider, gasPrice)

    // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
    const yourLocalBalance = useBalance(localProvider, address);

    // Just plug in different 🛰 providers to get your balance on different chains:
    const yourMainnetBalance = useBalance(mainnetProvider, address);

    // Load in your local 📝 contract and read a value from it:
    const readContracts = useContractLoader(localProvider)

    // If you want to make 🔐 write transactions to your contracts, use the userProvider:
    const writeContracts = useContractLoader(userProvider)

    // EXTERNAL CONTRACT EXAMPLE:
    // If you want to bring in the mainnet DAI contract it would look like:
    const mainnetDAIContract = useExternalContractLoader(mainnetProvider, DAI_ADDRESS, DAI_ABI)

    // Then read your DAI balance like:
    const myMainnetDAIBalance = useContractReader({DAI: mainnetDAIContract},"DAI", "balanceOf",["0x34aA3F359A9D614239015126635CE7732c18fDF3"])

    // keep track of a variable from the contract in the local React state:
    const balance = useContractReader(readContracts,NFT_CONTRACT, "balanceOf", [ address ])

    //📟 Listen for broadcast events
    const transferEvents = useEventListener(readContracts, NFT_CONTRACT, "Transfer", localProvider, 1);

    //
    // ☝️ These effects will log your major set up and upcoming transferEvents- and balance changes
    // 
    useEffect(()=>{
      if(DEBUG && address && selectedChainId && yourLocalBalance && yourMainnetBalance && readContracts && writeContracts && mainnetDAIContract){
        console.log("_____________________________________")
        console.log("🏠 localChainId",localChainId)
        console.log("👩‍💼 selected address:",address)
        console.log("🕵🏻‍♂️ selectedChainId:",selectedChainId)
        console.log("💵 yourLocalBalance",yourLocalBalance?formatEther(yourLocalBalance):"...")
        console.log("💵 yourMainnetBalance",yourMainnetBalance?formatEther(yourMainnetBalance):"...")
        console.log("📝 readContracts",readContracts)
        console.log("🌍 DAI contract on mainnet:",mainnetDAIContract) 
        console.log("🔐 writeContracts",writeContracts)
      }
    }, [address, selectedChainId, yourLocalBalance, yourMainnetBalance, readContracts, writeContracts, mainnetDAIContract])

    const [oldBalance, setOldBalance] = useState()
    const [oldMainnetBalance, setOldMainnetDAIBalance] = useState()
    const [oldTransferEvents, setOldTransferEvents] = useState([])
    useEffect(()=>{
      if(DEBUG){
        if(transferEvents && oldTransferEvents !== transferEvents){
          console.log("📟 Transfer events:", transferEvents)
          setOldTransferEvents(transferEvents)
        }
        if(myMainnetDAIBalance && oldMainnetBalance && !myMainnetDAIBalance.eq(oldMainnetBalance)){
          console.log("🥇 myMainnetDAIBalance:",myMainnetDAIBalance)
          setOldMainnetDAIBalance(myMainnetDAIBalance)
        }
        if(balance && oldBalance && !balance.eq(oldBalance)){
          console.log("🤗 balance:", balance)
          setOldBalance(balance)
        }
      }
    }, [myMainnetDAIBalance, balance, transferEvents])

    //
    // 🧠 This effect will update CryptoPixels by polling when your balance changes
    //
    const yourBalance = balance && balance.toNumber && balance.toNumber()
    const [ CryptoPixels, setCryptoPixels ] = useState()

    useEffect(()=>{
      const updateCryptoPixels = async () => {
        let collectibleUpdate = []
        console.log("Balance after change", balance)
        let ownPixels = [];
        for(let tokenIndex=1;tokenIndex<=balance;tokenIndex++){
          try{
            ownPixels.push(tokenIndex);
            console.log("Getting token index",tokenIndex)
            
            const tokenURI = await readContracts.CryptoPixels.tokenURI(tokenIndex)
            console.log("tokenURI",tokenURI)

            const ipfsHash =  tokenURI.replace("https://ipfs.io/ipfs/","")
            console.log("ipfsHash",ipfsHash)

            const jsonManifestBuffer = await getFromIPFS(ipfsHash)

            try{
              const jsonManifest = JSON.parse(jsonManifestBuffer.toString())
              console.log("jsonManifest",jsonManifest)
              collectibleUpdate.push({ id:tokenIndex, uri:tokenURI, owner: address, ...jsonManifest })
            }catch(e){console.log(e)}

          }catch(e){console.log(e)}
        }
        setCryptoPixels(collectibleUpdate)
      }
      setOwnPixels(ownPixels)
      updateCryptoPixels()
    },[ address, yourBalance ])


    let networkDisplay = ""
    if(localChainId && selectedChainId && localChainId != selectedChainId ){
      networkDisplay = (
        <div style={{zIndex:2, position:'absolute', right:0,top:60,padding:16}}>
          <Alert
            message={"⚠️ Wrong Network"}
            description={(
              <div>
                You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
              </div>
            )}
            type="error"
            closable={false}
          />
        </div>
      )
    }else{
      networkDisplay = (
        <div style={{zIndex:-1, position:'absolute', right:154,top:28,padding:16,color:targetNetwork.color}}>
          {targetNetwork.name}
        </div>
      )
    }

    useEffect(() => {
      if (web3Modal.cachedProvider) {
        loadWeb3Modal();
      }
    }, [loadWeb3Modal]);

    let faucetHint = ""
    const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name == "localhost"

    const [ faucetClicked, setFaucetClicked ] = useState( false );
    if(!faucetClicked&&localProvider&&localProvider._network&&localProvider._network.chainId==31337&&yourLocalBalance&&formatEther(yourLocalBalance)<=0){
      faucetHint = (
        <div style={{padding:16}}>
          <Button type={"primary"} onClick={()=>{
            faucetTx({
              to: address,
              value: parseEther("0.01"),
            });
            setFaucetClicked(true)
          }}>
            💰 Grab funds from the faucet ⛽️
          </Button>
        </div>
      )
    }

    useEffect(()=>{
      // LIST OF ASSETS GETS INITIATED
      const updateCryptoPixels = async () => {
        
        let assetUpdate = []
        let ownPixels = []
        let soldPixels = await readContracts.CryptoPixels.getSoldPixels()
        console.log("SOLD PIXELS: ", soldPixels)
        console.log("asp9di asp9d", assets)

        for(let a in assets){
          try{
            let owner, notForSale = false
            // If pixel is not for sale, get me the owner
            if(soldPixels.indexOf(assets[a].pixelId) !== -1){
              owner = await readContracts.CryptoPixels.ownerOf(assets[a].pixelId)
              notForSale = true
              if(owner === address){  
                ownPixels.push(assets[a].pixelId)
              }
            }
            assetUpdate.push({id:a,...assets[a], notForSale:notForSale, owner:owner})
          }catch(e){console.log(e)}
        }

        setSoldPixels(soldPixels)
        setOwnPixels(ownPixels)
      }
      if(readContracts && readContracts.CryptoPixels) updateCryptoPixels()
    }, [ assets, readContracts, transferEvents ]);

    const loadWeb3Modal = useCallback(async () => {
        const provider = await web3Modal.connect();
        setInjectedProvider(new Web3Provider(provider));
      }, [setInjectedProvider]);

    const [ transferToAddresses, setTransferToAddresses ] = useState({})
    const [ soldPixels, setSoldPixels ] = useState()
    const [ ownPixels, setOwnPixels ] = useState()

    return {
      address: address,
      localProvider: localProvider,
      userProvider: userProvider, 
      mainnetProvider: mainnetProvider,
      price: price, 
      web3Modal: web3Modal,
      loadWeb3Modal: loadWeb3Modal,
      logoutOfWeb3Modal: logoutOfWeb3Modal,
      blockExplorer: blockExplorer,
      faucetHint: faucetHint,
      address: address,
      NETWORKS: NETWORKS,
      gasPrice: gasPrice,
      faucetAvailable: faucetAvailable
    }

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