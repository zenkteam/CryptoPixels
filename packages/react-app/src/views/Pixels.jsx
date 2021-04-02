/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useEffect, useState, PureComponent } from "react";
import { SelectPlane } from "../components";
import { Button } from "antd";
import { Transactor } from "../helpers";
import { utils } from "ethers";

export default function Pixels(props) {
    
    var pricePerPixelBlockInDollar = 100

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
       
        selection = selection.filter((x) => {
           return reserved.indexOf(x) === -1
        })

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
        console.log('Price in initiateSales:', props.price)
        let price = typeof props.price == "undefined" ? 0 : parseInt(props.price)
        let priceInDollar = selection.length * pricePerPixelBlockInDollar
        let priceInEther = price ? (priceInDollar / price).toFixed(2) : '0.05543' 
        
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
          let x, y;
          for(let j = 0; j < selectedAssets[i].attributes.length; ++j){
            if(selectedAssets[i].attributes[j].trait_type === 'column'){
              x = selectedAssets[i].attributes[j].value
            } else if(selectedAssets[i].attributes[j].trait_type === 'row'){
              y = selectedAssets[i].attributes[j].value
            }
          }
          buy.push({id: selectedAssets[i].pixelId, ipfs: selectedAssets[i].ipfsId, x: x, y: y })
        }
        
        //tx( writeContracts.CryptoPixels.buyPixels(loadedAssets[a], ) )
        console.log('Buying', buy)
        tx( props.writeContracts.CryptoPixels.buyPixels(buy, {
            gasPrice:gasPrice, 
            value: utils.parseEther(priceToBuyInEther)
        }) ) //
    }

    function resetSelection() {
        onSelected([]);
    }

    function onZoomUpdate(zoom) {
        setZoom(zoom);
    }

    function getSpecialPieces() {
        let upperLeftPointOfEachPiece = [4041] // [2021, 2061, 4041, 6021, 6061]
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
        console.log("TEST")
        const pixels = getPixels()
        const reserved = getSpecialPieces()
        console.log("SOLD 1:", props.soldPixels)
        console.log("RESERVED:", props.soldPixels)

        if(props.soldPixels){
            console.log("SOLD 2: ", props.soldPixels)
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
