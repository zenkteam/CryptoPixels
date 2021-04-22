import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";
import { Button } from "antd";
import { Transactor } from "../helpers";
import { utils, BigNumber } from "ethers";
import { parseEther, formatEther } from "@ethersproject/units";
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
            const priceInDollar = selection.length * pricePerPixelBlockInDollar
            const priceInEther = props.price ? (priceInDollar / props.price).toFixed(2) : 0
            setPriceToBuyInDollar(priceInDollar)
            setPriceToBuyInEther(priceInEther)
        }
    },[props.price, selection])
    
    function onSelected(selection) {
        setSelection(selection)
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
            y: (row-1) * 10,
        };
    }

    function buyPixel(){
        console.log('Buying', selection)
        console.log('Price in Ether', priceToBuyInEther)
        console.log('Price in Ether BIGNUMBER', utils.parseEther(priceToBuyInEther))
        console.log('Gas', gasPrice)

        let pixels = new Array(selection.length)
        for(let i = 0; i < selection.length; ++i){
            pixels[i] = BigNumber.from(selection[i])
        }

        const tx = Transactor(props.wallet, gasPrice)
        tx( props.writeContract.CryptoPixels.buyPixels(pixels, {
                gasPrice: gasPrice, 
                value: parseEther(priceToBuyInEther)
            })
        )
    }

    function createPixel(id){
        const pixel = generatePixelData(id)
        let p = document.createElement('div')
        p.className = 'p'
        p.style.setProperty('margin-left', pixel.x + 'px')
        p.style.setProperty('margin-top', pixel.y + 'px')
        p.setAttribute('id', id)
        return p
      }

    function onZoomUpdate(zoom) {
        setZoom(zoom);
    }

    useEffect(() => {
        if(props.ownPixels && props.soldPixels){
            let soldButNotMine = props.soldPixels.filter((i) => props.ownPixels.indexOf(i) === -1)
            if(soldButNotMine && soldButNotMine.length > 0){
                for(let i = 0; i < soldButNotMine.length; ++i){
                    let pixel = createPixel(soldButNotMine[i])
                    pixel.classList.add('sold')
                    document.getElementById('boxes').appendChild(pixel)
                }
            } 
            if(props.ownPixels && props.ownPixels.length > 0){
                for(let i = 0; i < props.ownPixels.length; ++i){
                    let pixel = createPixel(props.ownPixels[i])
                    pixel.classList.add('own')
                    document.getElementById('boxes').appendChild(pixel)
                }
            }
        }
    }, [props.soldPixels, props.ownPixels])

    return (
        <div className="Content" id="Content">
            {/* Only render pixels if they have already been generated */}
            {
                <SelectPlane
                    selection={selection}
                    zoom={zoom}
                    onSelected={ids => onSelected(ids)}
                    onZoomUpdate={value => onZoomUpdate(value)}
                    soldPixels={props.soldPixels}
                    generatePixelData={id => generatePixelData(id)}
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
                
                {selection.length > 0 && props.wallet &&
                    <div>
                        <div id="priceETH">Price for {selection.length*100} pixels: ETH {priceToBuyInEther} (${priceToBuyInDollar})</div>
                        <div id="buyPixels"><Button onClick={buyPixel}>Buy and own {selection.length*100} pixels ({selection.length} blocks)</Button></div>
                    </div>
                }
                
                {selection.length > 0 && !props.wallet &&
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