/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";
import { Button } from "antd";
import { Transactor } from "../helpers";

export default function Pixels(props) {
    
    var pricePerPixelBlockInDollar = 1

    const tx = Transactor(props.userProvider, props.gasPrice)

    function getPixelsByIds(ids) {
        const list = new Array(ids.length);
        for (let i = 0; i < ids.length; ++i) {
            list[i] = pixels[ids[i] - 1]
        }
        return list;
    }

    function onSelected(selection) {

        const selected = getPixelsByIds(selection);
        setSelection(selected);
        // all selected, no matter which status they have
        //console.log('onSelectedSelection', selection);
        //console.log('onSelected', selected);
       
        //selection = selection.filter((x) => {
        //    return reserved.indexOf(x) === -1
        //})
        let selectedPixels = new Array(selection.length)
        for(let n in selection){
            selectedPixels.push(
                <div key={selection[n]}>CryptoPixel# {selection[n]}</div> 
            )
        }

        setSelectedPixels(selectedPixels)
        initiateSales(selection)
    }

    function initiateSales(selection){
        console.log(props.price)
        let price = typeof props.price == "undefined" ? 0 : parseInt(props.price)
        let priceInDollar = selection.length * pricePerPixelBlockInDollar
        let priceInEther = price ? (priceInDollar / price).toFixed(2) : '-' 
        
        setPriceToBuyInDollar(priceInDollar)
        setPriceToBuyInEther(priceInEther)
    }

    function buyPixel(){
        let gasPrice = typeof props.gasPrice == "undefined" ? 0 : parseInt(props.gasPrice)
        //console.log("gasPrice,", gasPrice)
        //console.log("loaded assets", props.loadedAssets)
        //console.log("all props", props)

        // Loop through all assets and pull the ones that were selected
        var selectedAssets = [], i = 0
        for(let asset in props.loadedAssets){
            for(let j = 0; j < selection.length; j++){
                if(props.loadedAssets[asset].pixelId === selection[j].p){
                    selectedAssets[i] = props.loadedAssets[asset]
                    ++i
                    if(selectedAssets.length === selection.length){
                        break;
                    }
                }       
            }
        }

        console.log('selectedAssets',selectedAssets)
        if(selectedAssets.length < 1){
            // TODO: Show warning
        }

        var buy = []
        for(let i = 0; i < selectedAssets.length; ++i){
            const pixelId = selectedAssets[i].pixelId
            const x = pixelId > 1000 ? parseInt(pixelId[1]+pixelId[2]+pixelId[3]) : 1
            const y = pixelId > 1000 ? parseInt(pixelId[0]) : 1
            buy.push({id: selectedAssets[i].pixelId, tokenId: selectedAssets[i].tokenId, x: x, y: y })
        }
        //initiateSales()
        //tx( writeContracts.CryptoPixels.buyPixels(loadedAssets[a], ) )
        //console.log()
        tx( props.writeContracts.CryptoPixels.buyPixels(buy, 1, {gasPrice:gasPrice}) )
    }

    function resetSelection() {
        onSelected([]);
    }

    function onZoomUpdate(zoom) {
        setZoom(zoom);
    }

    function getSpecialPieces() {
        let upperLeftPointOfEachPiece = [2021, 2061, 4041, 6021, 6061]
        let sizeOfEachPiece = 20
        let reserved = new Array(upperLeftPointOfEachPiece.length * sizeOfEachPiece * sizeOfEachPiece)
        reserved.length = upperLeftPointOfEachPiece.length * sizeOfEachPiece * sizeOfEachPiece
        let c = 0
        for(let i = 0; i < upperLeftPointOfEachPiece.length; ++i){
            for(let j = 0; j < sizeOfEachPiece; ++j){
                for(let k = 0; k < sizeOfEachPiece; ++k){
                    reserved[c] = upperLeftPointOfEachPiece[i] + j + k*100
                    ++c
                }
            }
        }
        return reserved;
    }

    const [pixels, setPixels] = useState();
    const [reserved, setReserved] = useState();
    const [selectedPixels, setSelectedPixels] = useState([]);
    const [zoom, setZoom] = useState('auto');
    const [selection, setSelection] = useState([]);
    const [priceToBuyInDollar, setPriceToBuyInDollar] = useState(0);
    const [priceToBuyInEther, setPriceToBuyInEther] = useState(0);

    const STATI = {
        AVAILABLE: '',
        RESERVED: 'reserved',
        SOLD: 'sold',
    }

    function getPixels(){
        const pixels = new Array(10000)
        for (let r = 0; r < 10000; r++) {
            pixels[r] = {p:r+1,s:''}
        }
        return pixels;
    }

    useEffect(() => {
        // generate Data only once
        const pixels = getPixels()
        const reserved = getSpecialPieces()

        if(props.soldPixels){
            console.log("SOLD 2: "+props.soldPixels)
            for(var i = 0; i < props.soldPixels.length; ++i){
                pixels[props.soldPixels[i]-1].s = STATI.SOLD
            }
        }
        
        for(var i = 0; i < reserved.length; ++i){
            pixels[reserved[i]-1].s = STATI.RESERVED
        }
        
        setPixels(pixels)
        setReserved(reserved)
    }, []);
   
    return (
        <div>
            {/* Only render pixels if they have already been generated */}
            {pixels &&
                <SelectPlane
                    pixels={pixels}
                    selection={selection}
                    zoom={zoom}
                    onSelected={value => {
                        onSelected(value);
                    }}
                    onZoomUpdate={value => {
                        onZoomUpdate(value);
                    }}
                ></SelectPlane>
            }
            <div className="reset-button" onClick={resetSelection}>Reset</div>
            
            {selectedPixels.length > 0 && 
            <div>
                <div className="priceUSD">
                    Price $ {priceToBuyInDollar}
                </div>
                <div className="priceETH">
                    Price ETH {priceToBuyInEther}
                </div>
                <div className="buyPixels">
                    <Button onClick={buyPixel}>
                    Buy
                    </Button>
                </div>
                <div className="selectedPixels">
                    <p><b>Selected Pixels</b></p>
                    {selectedPixels}
                </div>
            </div>
            
            }
        
            
            <div className="imageUpload">
                
            </div>
        </div>
    );
}
