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
        setSelection(selection)
    }

    async function getPixelData(ids){
        let data = await axios.post(apiLink + 'api/meta',{"p":ids}, { headers: { Accept: "application/json" } })
        console.log(data)
        return data
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
        let el = document.getElementsByClassName('selected')
        while(el.length > 0) {
            el[0].classList.remove('selected')
        }
        
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
                ></SelectPlane>
            }
            
        
            <div id="menu">
                <ol>
                    <li>1 Pixel = $1</li>
                    <li>Minimum buyin 10x10 = 100 pixels => $100</li>
                    <li>Each pixelblock can be replaced with an image</li>
                    <li>The center block gets auctioned once everything else is gone</li>
                </ol>

                {selection.length > 0 &&
                    <div id="reset-button" onClick={() => resetSelection()}>Reset</div>
                }

                <button onClick={() => getPixelData(selection)}>Meta</button>

                
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
