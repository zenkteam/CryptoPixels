import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";
import { Button } from "antd";
import { Transactor } from "../helpers";
import { utils } from "ethers";
import { useGasPrice } from "../hooks/index.js";
import axios from "axios";

export default function Pixels(props) {
    
    const pricePerPixelBlockInDollar = 100
    const [zoom, setZoom] = useState('auto');
    const [selection, setSelection] = useState([]);
    const [priceToBuyInDollar, setPriceToBuyInDollar] = useState(0);
    const [priceToBuyInEther, setPriceToBuyInEther] = useState(0);
    const gasPrice = useGasPrice(props.targetNetwork, "fast");
    const apiLink = props.targetNetwork.name === 'localhost' ? 'http://cryptoapi.test/' : 'https://cryptopixels.org/';

    useEffect(() => {
        if(selection.length>0){
            let priceInDollar = selection.length * pricePerPixelBlockInDollar
            let priceInEther = props.price ? (priceInDollar / props.price).toFixed(2) : 0
            console.log('Price', props.price)
            console.log('Price', priceInEther)
            
            setPriceToBuyInDollar(priceInDollar)
            setPriceToBuyInEther(priceInEther)
        }
    },[props.price, selection])
    
    function onSelected(selection) {
        setSelection(selection)
    }

    async function getIPFSData(ids){
        let data = await axios.post(apiLink + 'api/ipfs',{"p":ids}, { headers: { Accept: "application/json" } })
        return data
    }

    function generatePixelData(id){
        let column = id
        const row = parseInt((id-1)/100) + 1
        if(id > 999){
            column = id % 1000; // ignore thousand-digit
            if(column > 99){
                column = column % 100; // ignore hundred digit
            }
        } else if (id > 100){
            column = id % 100;
        } else if(column === 0){
            column = 100;
        }
        return {
            id: id,
            column: column,
            x: (column-1) * 10,
            row: row,
            y: (row-1)*10,
        };
    }

    function buyPixel(){
        console.log('selection', selection)
        const buy = getIPFSData(selection)
        console.log('Buying', buy)
        console.log('Price in Ether', priceToBuyInEther)
        console.log('Gas', gasPrice)
        const tx = Transactor(props.mainnetProvider, gasPrice)
        tx( props.writeContract.CryptoPixels.buyPixels(buy, {
                gasPrice: gasPrice, 
                value: utils.parseEther(priceToBuyInEther)
            })
        )
    }

    function createPixel(id){
        const pixel = generatePixelData(id)
        let p = document.createElement('div')
        p.style.cssText = 'position:absolute;z-index:2;width:10px;height:10px;margin-left:' + pixel.x + 'px;margin-top:' + pixel.y + 'px'
        p.setAttribute('id', id)
        p.setAttribute('class', 'p')
        return p
      }

    function onZoomUpdate(zoom) {
        setZoom(zoom);
    }

    function isReserved(id) {
        if(id < 4040 || id > 5961) return false;
        let t = id % 1000;
        if(t > 100) t = t % 100;
        return t > 40 && t < 61;
    }

    useEffect(() => {
        if(props.soldPixels && props.soldPixels.length > 0){
            for(let i = 0; i < props.soldPixels.length; ++i){
                let pixel = createPixel()
                pixel.classList.add('sold')
                document.getElementById('boxes').appendChild(pixel)
            }
        } 
    }, [props.soldPixels])
   
    return (
        <div className="Content" id="Content">
            {/* Only render pixels if they have already been generated */}
            {
                <SelectPlane
                    isReserved={(val) => isReserved(val)}
                    selection={selection}
                    zoom={zoom}
                    onSelected={value => onSelected(value)}
                    onZoomUpdate={value => onZoomUpdate(value)}
                    soldPixels={props.soldPixels}
                    generatePixelData={(id) => generatePixelData(id)}
                    createPixel={id => createPixel(id)}
                ></SelectPlane>
            }
            
            <div id="menu">
                <div className="corner" id="topleft-1"></div>
                <div className="corner" id="topleft-2"></div>
                <div className="corner" id="topright-1"></div>
                <div className="corner" id="topright-2"></div>
                <div className="corner" id="bottomleft-1"></div>
                <div className="corner" id="bottomleft-2"></div>
                <div className="corner" id="bottomright-1"></div>
                <div className="corner" id="bottomright-2"></div>
                <div className="corner" id="topmiddle-1"></div>
                <div className="corner" id="topmiddle-2"></div>
                <div className="corner" id="rightmiddle-1"></div>
                <div className="corner" id="rightmiddle-2"></div>
                <div className="corner" id="bottommiddle-1"></div>
                <div className="corner" id="bottommiddle-2"></div>
                <div className="corner" id="bottommiddle-3"></div>

                <ol>
                    <li>1 Pixel = $1</li>
                    <li>10.000 blocks of 10x10 pixels: $100</li>
                    <li>Select your pixels, connect and mint</li>
                    <li>Rundown:</li>
                    <li>Once all pixels apart from the centerpiece have been minted, we'll run a two week period in which pixels can be replaced with images and the centerpiece will be auctionized.</li>
                    <li><a href="">FAQ</a></li>
                </ol>
                
                {selection.length > 0 && props.injectedProvider &&
                    <div>
                        <div id="priceETH">Price for {selection.length*100} pixels: ETH {priceToBuyInEther} (${priceToBuyInDollar})</div>
                        <div id="buyPixels"><Button onClick={buyPixel}>Buy and own {selection.length*100} pixels ({selection.length} blocks)</Button></div>
                    </div>
                }
                
                {selection.length > 0 && !props.injectedProvider &&
                    <div>
                        <p>You selected <b>{selection.length} pixelblocks</b> but you need to connect your wallet first.</p>
                        <p>
                            <Button
                            key="loginbutton"
                            size="large"
                            id="menuConnect"
                            onClick={props.loadWeb3Modal}
                            >
                            Connect
                            </Button>
                        </p>
                    </div>
                }
            </div>
            
            <div className="imageUpload">
                
            </div>
        </div>
    );
}
