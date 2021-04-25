import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";
import { Transactor } from "../helpers";
import { BigNumber } from "ethers";
import { parseEther } from "@ethersproject/units";
import { useGasPrice } from "../hooks/index.js";
import Countdown from '../components/Countdown';
import { notification } from "antd";
import { TableOutlined } from '@ant-design/icons';

export default function Pixels(props) {

    const assetsUri = process.env.REACT_APP_UPLOADED_URI || 'http://localhost:8888/uploads/'
    const pricePerPixelBlockInDollar = 100
    const [zoom, setZoom] = useState('auto');
    const [initialZoom, setInitialZoom] = useState();
    const [selection, setSelection] = useState([]);
    const [selectedPixelRanges, setSelectedPixelRanges] = useState([]);
    const [priceToBuyInDollar, setPriceToBuyInDollar] = useState(0);
    const [priceToBuyInEther, setPriceToBuyInEther] = useState(0);
    const gasPrice = useGasPrice(props.targetNetwork, "fast");
    const [waitingForWalletConfirm, setWaitingForWalletConfirm] = useState(false)
    // const apiLink = props.targetNetwork.name === 'localhost' ? 'http://cryptoapi.test/' : 'https://cryptopixels.org/';

    useEffect(() => {
        if(selection.length>0){
            generatePixelRanges()
            const priceInDollar = selection.length * pricePerPixelBlockInDollar
            const priceInEther = props.price ? (priceInDollar / props.price).toFixed(2) : 0
            setPriceToBuyInDollar(priceInDollar)
            setPriceToBuyInEther(priceInEther)
        }
    },[props.price, selection])
    
    function generatePixelRanges(){
        const areas = props.calculateCryptoPixels(selection)
        const pixelRanges = []
        if(areas.length > 0){
            for(let i = 0; i < areas.length; ++i){
                pixelRanges.push(<div className='pixelRange' key={i}><b className="rangeFrom">{areas[i][3][0]}</b> <TableOutlined/> <b className="rangeTo">{areas[i][3][1] + areas[i][2] * 100}</b></div>)
            }
        }else{
            pixelRanges.push(<div className='pixelRange' key="add"><b>{selection[0]}</b></div>) 
        }            
        setSelectedPixelRanges(pixelRanges)
    }

    function onSelected(selection) {
        setMenuToggled(true)
        setSelection(selection)
    }

    async function buyPixel(){
        const etherPriceAsString = priceToBuyInEther.toString()
        // const block = await props.dappProvider.getBlock('latest')

        // console.log('Buying', selection)
        // console.log('Price in Ether', priceToBuyInEther)
        // console.log('Price in Ether BIGNUMBER', utils.parseEther(etherPriceAsString))
        // console.log('Gas', gasPrice)
    
        if(etherPriceAsString === '0'){
            notification.error({
                message: "Could not calculate ether",
                description: 'Check the gas station',
            });
            etherPriceAsString = '0.05';
        }

        // Transform pixelIds into bignumbers
        let pixels = new Array(selection.length)
        for(let i = 0; i < selection.length; ++i){
            pixels[i] = BigNumber.from(selection[i])
        }

        setWaitingForWalletConfirm(true);
        const tx = Transactor(props.wallet, gasPrice)
        let transaction = await tx(
            props.readWriteContractViaWallet.CryptoPixels.buyPixels(pixels, {
                gasPrice: gasPrice,
                gasLimit: 220000 * pixels.length,
                value: parseEther(etherPriceAsString)
            })
        )
        setWaitingForWalletConfirm(false);
        
        // reset selection
        if (transaction && transaction.hash) {
            let selectedArea = document.getElementById('selectedArea');
            selectedArea.id = "pendingArea";
            setSelection([]);

            // wait for confirmation
            transaction.confirmation.then(async () => {
                const amountOwnendBefore = props.ownPixels.length;
                let amountOwnendAfter = amountOwnendBefore;
                while (amountOwnendAfter <= amountOwnendBefore) {
                    await sleep(1000);
                    const pixels = await props.getOwnPixels();
                    amountOwnendAfter = pixels.length;
                }
                selectedArea.remove();
            })
        }
    }

    function sleep(delay) {
        return new Promise((resolve) => setTimeout(resolve, delay))
    }

    function resetSelection() {
        setSelection([])
        removeSelectedArea()
    }

    function removeSelectedArea(){
        let selectedArea = document.getElementById('selectedArea')
          if(selectedArea){
              selectedArea.remove()
          }
      }

    // zomm Update from Plane
    function onZoomUpdate(z) {
        setZoom(z);
        if (!initialZoom) {
            setInitialZoom(z);
        }
    }

    // update Zoom in UI
    function selectZoom(z) {
        setZoom(initialZoom * z);
    }

    const [menuToggled, setMenuToggled] = useState(false);
    function toggleMenu() {
        setMenuToggled(!menuToggled);
    }

    useEffect(() => {
        drawSoldAndOwnedAreas('sold', props.soldButNotMineCryptoPixels)
        drawSoldAndOwnedAreas('own', props.ownCryptoPixels)
    }, [props.ownCryptoPixels])

    // Draw sold and own pixels on the map
    function drawSoldAndOwnedAreas(classType, cryptoPixels){
        const boxes = document.getElementById('boxes')

        if(boxes){
            // We start with the 2nd (i = 1)
            if(cryptoPixels.length > 2){
                for(let i = 0; i < cryptoPixels.length; ++i) {
                    const el = document.getElementById('a' + cryptoPixels[i][0])
                    if(el){
                        el.remove()
                    }
                    const p = props.createPixel(cryptoPixels[i][0])
                    p.classList.add(classType)
                    p.style.setProperty('width', cryptoPixels[i][1] * 10 + 'px')
                    p.style.setProperty('height', cryptoPixels[i][2] * 10 + 'px')
                    p.setAttribute('id', 'a' + cryptoPixels[i][0])
                    p.style.setProperty('background-image', 'url(' + assetsUri + cryptoPixels[i][0] + '.png)') 
                    boxes.appendChild(p)
                }
            }else if (cryptoPixels.length === 1){
                const p = props.createPixel(cryptoPixels[0][0])
                p.classList.add(classType)
                boxes.appendChild(p)
            }
        }
    }
    
    return (
        <>
            <div className="Content contentGlitch" id="Content">

                <SelectPlane
                    selection={selection}
                    zoom={zoom}
                    onSelected={ids => onSelected(ids)}
                    onZoomUpdate={value => onZoomUpdate(value)}
                    soldPixels={props.soldPixels}
                    ownPixels={props.ownPixels}
                    generatePixelData={id => props.generatePixelData(id)}
                    createPixel={id => props.createPixel(id)}
                    removeSelectedArea={removeSelectedArea}
                ></SelectPlane>
            </div>
           
            <div id="Overlays">
                {/* Menu */}
                <div id="menu" className={menuToggled ? 'isToggled' : null} onClick={toggleMenu}>
                    {!menuToggled &&
                        <>
                            <div className="close">
                            </div>
                            <ol>
                                <li>1 Pixel = $1</li>
                                <li>1 Block = 10x10 Pixels = 100$</li>
                                <li>10.000 Blocks in total</li>
                                <li>Select your pixels, connect and mint</li>
                            </ol>
                            
                            <div>Rundown:</div>
                            <div>
                                After you have bought a Pixelblock you own a unique CryptoPixel NFT & can upload your image. 
                                Once 9600 Pixelblocks have been sold the last Centerpiece of 400 Pixelblocks will be auctioned for 2 Weeks. 
                                You can resell your blocks on the secondary market anytime.
                            </div>

                            { props.walletAddress &&
                                <div className="connected">
                                    Connected with: { props.walletAddress.substr(0, 6)}
                                </div>
                            }
                        </>
                    }
                    {menuToggled && 
                        <>Info</>
                    }
                </div>

                {selection.length &&
                <div className="buy" style={selection.sort()[selection.length-1] > 5000 ? {'top':'150px','bottom':'auto'} : null}>
                    {props.wallet &&
                        <div>
                            <h3>Selected Pixelblock{selectedPixelRanges.length > 1 && 's'}:</h3>
                            <div>{selectedPixelRanges}</div>
                            <div className="box-outer hoverme" id="buyPixels">
                                <div className="main_box" onClick={buyPixel}>
                                    Buy and own {selection.length*100} pixels ({selection.length} blocks)
                                    <br /><small>Price: ETH {priceToBuyInEther} (${priceToBuyInDollar})</small>
                                    <div className="bar top"></div>
                                    <div className="bar right delay"></div>
                                    <div className="bar bottom delay"></div>
                                    <div className="bar left"></div>
                                </div>
                                <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                            </div>
                        </div>
                    }
                    
                    {!props.wallet &&
                        <div>
                            <h3>Selected Pixelblock{selectedPixelRanges.length > 1 && 's'}:</h3>
                            <div>{selectedPixelRanges}</div>
                            <p>You selected <b>{selection.length} pixelblocks</b> but you need to connect your wallet first.</p>
                            <div className="box-outer hoverme menuConnect">
                                <div className="main_box" onClick={props.loadWeb3Modal}>             
                                    Connect
                                    <div className="bar top"></div>
                                    <div className="bar right delay"></div>
                                    <div className="bar bottom delay"></div>
                                    <div className="bar left"></div>
                                </div>
                            </div>
                        </div>
                    }

                    <div onClick={resetSelection}>(Reset)</div>
                </div>
                }

                {/* Zoom */}
                <div className="zoomLevel">
                    <span onClick={() => selectZoom(1.0)}>1.0x</span>|<span onClick={() => selectZoom(2.0)}>2.0x</span>|<span onClick={() => selectZoom(4.0)}>4.0x</span>
                </div>
                
                {/* Countdown */}
                <Countdown soldPixels={props.soldPixels}/>
            </div>

            { waitingForWalletConfirm &&
                <div className="walletConfirm">
                    Please confirm the transaction in your wallet
                </div>
            }
        </>
    );
}