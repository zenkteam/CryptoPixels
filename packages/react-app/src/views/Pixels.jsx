import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";
import { Button } from "antd";
import { Transactor } from "../helpers";
import { utils, BigNumber, constants } from "ethers";
import { parseEther } from "@ethersproject/units";
import { useGasPrice } from "../hooks/index.js";
import Countdown from '../components/Countdown';

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
        const column = id % 100 === 0 ? 100 : id % 100
        const row = Math.floor((id - 1) / 100) + 1

        return {
            id: id,
            column: column,
            x: (column-1) * 10,
            row: row,
            y: (row-1) * 10,
        };
    }

    async function buyPixel(){
        const etherPriceAsString = priceToBuyInEther.toString()

        console.log('Buying', selection)
        console.log('Price in Ether', priceToBuyInEther)
        console.log('Price in Ether BIGNUMBER', utils.parseEther(etherPriceAsString))
        console.log('Gas', gasPrice)

        let pixels = new Array(selection.length)
        for(let i = 0; i < selection.length; ++i){
            pixels[i] = BigNumber.from(selection[i])
        }

        const tx = Transactor(props.wallet, gasPrice)
        let transaction = await tx( props.writeContract.CryptoPixels.buyPixels(pixels, {
                gasPrice: gasPrice, 
                value: parseEther(etherPriceAsString)
            })
        )

        if(transaction && transaction.hash){
            props.updateCryptoPixels()
            removeSelectedArea()
            setSelection([])
        }
    }

    function removeSelectedArea(){
        let selectedArea = document.getElementById('selectedArea')
          if(selectedArea){
              selectedArea.remove()
          }
      }

    function createPixel(id){
        const pixel = generatePixelData(id)
        let p = document.createElement('div')
        p.className = 'p'
        p.style.setProperty('left', pixel.x + 'px')
        p.style.setProperty('top', pixel.y + 'px')
        p.setAttribute('id', id)
        return p
      }

    function onZoomUpdate(zoom) {
        setZoom(zoom);
    }

    useEffect(() => {
        const soldButNotMine = props.soldPixels.filter((i) => props.ownPixels.indexOf(i) === -1)
        drawSoldAndOwnedAreas(soldButNotMine, 'sold')
        drawSoldAndOwnedAreas(props.ownPixels, 'own')
    }, [props.soldPixels, props.ownPixels])

    function drawSoldAndOwnedAreas(ids, classType){
        const boxes = document.getElementById('boxes')
        // We start with the 2nd (i = 1)
        if(ids.length > 2){
            let adjacents = [[ids[0]]]
            let stacked = []
            
            ids.sort()
            let adjacentCount = 0
            for(let i = 1; i < ids.length; ++i){
                // If not adjacent, start new row
                if(ids[i] !== ids[i - 1]+1){
                    ++adjacentCount
                }

                if(!adjacents[adjacentCount]){
                    adjacents.push([])
                }

                adjacents[adjacentCount].push(ids[i])
            }
            
            if(adjacents.length > 1){
                let stackedCount = 0;
                for(let j = 1; j < adjacents.length; ++j){
                    if(!stacked[stackedCount]){
                        // startId, width, rows
                        stacked[stackedCount] = [adjacents[j-1][0], adjacents[j-1].length, 1]
                    }
                    // Check if two columns have the same length
                    if(adjacents[j-1].length === adjacents[j].length
                    && adjacents[j][0] === (adjacents[j-1][0] + 100)){
                        // Check if adjacents are above
                        ++stacked[stackedCount][2]
                    } else {
                        ++stackedCount 
                    }
                }
            }

            for(let i = 0; i < stacked.length; ++i) {
                const el = document.getElementById('a' + stacked[i][0])
                if(el){
                    el.remove()
                }
                const p = createPixel(stacked[i][0])
                p.classList.add(classType)
                p.style.setProperty('width', stacked[i][1] * 10 + 'px')
                p.style.setProperty('height', stacked[i][2] * 10 + 'px')
                p.setAttribute('id', 'a' + stacked[i][0])
                boxes.appendChild(p)
            }
        }else if (ids.length === 1){
            const p = createPixel(ids[0])
            p.classList.add(classType)
            boxes.appendChild(p)
        }
      }

    return (
        <>
            <div className="Content" id="Content">

                <SelectPlane
                    selection={selection}
                    zoom={zoom}
                    onSelected={ids => onSelected(ids)}
                    onZoomUpdate={value => onZoomUpdate(value)}
                    soldPixels={props.soldPixels}
                    generatePixelData={id => generatePixelData(id)}
                    createPixel={id => createPixel(id)}
                    removeSelectedArea={removeSelectedArea}
                ></SelectPlane>
            </div>
           
            <div id="Overlays">
                {/* Menu */}
                <div id="menu">
                    <ol>
                        <li>1 Pixel = $1</li>
                        <li>1 Block = 10x10 Pixels = 100$</li>
                        <li>10.000 Blocks in total</li>
                        <li>Select your pixels, connect and mint</li>
                    </ol>
                    
                    <div>Rundown:</div>
                    <div>
                        Once 9600 Pixelblocks have been sold the the last Centerpiece of 400 Pixelblocks will be auctioned for 2 Weeks.
                        After the auction closes Pixelblocks can be replaced with images.
                        You can resell your blocks on our marketplace anytime.
                    </div>


                    {selection.length > 0 && props.wallet &&
                        <div>
                            <div id="priceETH">Price for {selection.length*100} pixels: ETH {priceToBuyInEther} (${priceToBuyInDollar})</div>
                         
                            <div className="box-outer hoverme" id="buyPixels">
                                <div className="main_box" onClick={buyPixel}>
                                    Buy and own {selection.length*100} pixels ({selection.length} blocks)
                                    <div className="bar top"></div>
                                    <div className="bar right delay"></div>
                                    <div className="bar bottom delay"></div>
                                    <div className="bar left"></div>
                                </div>
                                <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                            </div>
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
                
                {/* Countdown */}
                <Countdown soldPixels={props.soldPixels}/>
            </div>
        </>
    );
}