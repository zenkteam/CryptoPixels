import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";
import { Button } from "antd";
import { Transactor } from "../helpers";
import { utils } from "ethers";
import { useGasPrice} from "../hooks/index.js";
import axios from 'axios';

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
        console.log('SELECTION', selection)
        setSelection(selection)
    }

    async function getPixelData(ids){
        let data = new Array(ids.length)
        for(let i = 0; i < ids.length; ++i){
            data[i] = generatePixelData(ids[i])
        }
        return data
    }

    function generatePixelData(id){
        let column, row, x, y
        // There are 100 columns and 100 Rows
        // To determine the column we just want to break down the id to ten-digits
        // If the id is smaller 100, column is automatically id 
            // as e.g. id 3 points to the third pixel in the first row
        if(id > 999){
            column = id % 1000; // ignore thousand-digit
    
            if(column > 99){
                column = column % 100; // ignore hundred digit
            }
        } else if (id > 100){
            column = id % 100;
        } else {
            column = id; 
        }
        // If %-rest equals zero, it has to be a full hundred and column = 100
        if(column === 0){ 
            column = 100;
        }
    
        // There are only 100 columns of 10px width, whereby first pixel starts on 0px
        x = (column-1) * 10;
    
        // There are only 100 rows. Let's see how often the 100 fits in.
        // Beware that if id is < 100, it is supposed to be row 1
        // Let's say id is 100, then we want row to be 1 after we added 1
        // Because if id is 400, row is actually 3:
        // Row 1: 1 - 100
        // Row 2: 101 - 200
        // Row 3: 201 - 300
        // Row 4: 301 - 400
        row = parseInt((id-1)/100) + 1;
        y = (row-1)*10;
    
        return {
            id: id,
            column: column,
            x: x,
            row: row,
            y: y,
        };
    }

    function buyPixel(){
        console.log('selection', selection)
        var buy = getPixelData(selection)

        console.log('Buying', buy)
        console.log('Price in Ether', priceToBuyInEther)
        console.log('Gas', gasPrice)
        const tx = Transactor(props.mainnetProvider, gasPrice)
        tx( props.writeContract.CryptoPixels.buyPixels(buy, {
            gasPrice: gasPrice, 
            value: utils.parseEther(priceToBuyInEther)
        }) ) //
    }

    function resetSelection() { 
        document.getElementById('selectedArea').remove()
        onSelected([]);
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
                document.getElementById(props.soldPixels[i]).classList.add('sold')
            }
        } 
    }, [props.soldPixels])
   
    return (
        <div>
            {/* Only render pixels if they have already been generated */}
            {
                <SelectPlane
                    isReserved={(val) => isReserved(val)}
                    selection={selection}
                    zoom={zoom}
                    onSelected={value => {onSelected(value);}}
                    onZoomUpdate={value => {onZoomUpdate(value);}}
                    soldPixels={props.soldPixels}
                    generatePixelData={(id) => generatePixelData(id)}
                ></SelectPlane>
            }
            
        
            <div id="menu">
                <ol>
                    <li>1 Pixel = $1</li>
                    <li>10.000 blocks of 10x10 pixels: $100</li>
                    <li>Select your pixels, connect and mint</li>
                    <li>Rundown:</li>
                    <li>Once all pixels apart from the centerpiece have been minted, we'll run a two week period in which pixels can be replaced with images and the centerpiece will be auctionized.</li>
                    <li><a href="">FAQ</a></li>
                </ol>

                {selection.length > 0 &&
                    <div id="reset-button" onClick={() => resetSelection()}>Reset</div>
                }
                
                {selection.length > 0 && props.injectedProvider &&
                    <div>
                        <div id="priceETH">Price:  ETH {priceToBuyInEther} (${priceToBuyInDollar})</div>
                        <div id="buyPixels"><Button onClick={buyPixel}>Buy and own {selection.length*100} pixels ({selection.length} blocks)</Button></div>
                    </div>
                }
                
                {selection.length > 0 && !props.injectedProvider &&
                    <div>
                        <p>You need to connect your wallet first.</p>
                        <p>
                            <Button
                            key="loginbutton"
                            style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
                            shape="round"
                            size="large"
                            /*type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time*/
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
