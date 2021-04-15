import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";
import { Button } from "antd";
import { Transactor } from "../helpers";
import { utils } from "ethers";
import { useGasPrice} from "../hooks/index.js";

export default function Pixels(props) {
    
    const pricePerPixelBlockInDollar = 100
    const [zoom, setZoom] = useState('auto');
    const [selection, setSelection] = useState([]);
    const [priceToBuyInDollar, setPriceToBuyInDollar] = useState(0);
    const [priceToBuyInEther, setPriceToBuyInEther] = useState(0);
    const gasPrice = useGasPrice(props.targetNetwork, "fast");

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

    function getPixelData(id){
        return {
            id: id,
            ipfs: 'dj2938d2390d239dk' + id
        }
    }

    function buyPixel(){
        console.log('selection', selection)
        var buy = new Array(selection.length)
        for(let i = 0; i < selection.length; ++i){
            buy[i] = getPixelData(selection[i])
        }
        
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

    const STATI = {
        AVAILABLE: '',    
        RESERVED: 'r', // Because we have pre-rendered the reserved ones we keep it short to save space
        SOLD: 'sold'
    }

    function isReserved(id) {
        if(id < 4040 || id > 5961){
            return false;
        }
        let t = id % 1000;
        if(t > 100){
            t = t % 100;
        }
        return t > 40 && t < 61;
    }

    useEffect(() => {
        if(props.soldPixels && props.soldPixels.length > 0){
            for(let i = 0; i < props.soldPixels.length; ++i){
                document.getElementById(props.soldPixels[i]).classList.add(STATI.SOLD)
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
                ></SelectPlane>
            }
            <div className="reset-button" onClick={() => resetSelection()}>Reset</div>
            
            {selection.length > 0 && 
                <div>
                    <div className="priceUSD">
                        Price $ {priceToBuyInDollar}
                    </div>
                    <div className="priceETH">Price ETH {priceToBuyInEther}</div>
                    <div className="buyPixels"><Button onClick={buyPixel}>Buy</Button></div>
                    <p><b>Selected Pixels {selection.length}</b></p>
                </div>
            }
         
            <div className="imageUpload">
                
            </div>
        </div>
    );
}
