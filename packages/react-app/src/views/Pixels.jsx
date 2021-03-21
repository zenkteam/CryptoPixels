/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";
import { Button } from "antd";
import { Transactor } from "../helpers";
import  m from '../matrix.js'


export default function Pixels(props) {
    
    var pricePerPixelBlockInDollar = 1

    const tx = Transactor(props.userProvider, props.gasPrice)

    function getPixelsByIds(ids) {
        const list = [];
        for (var id of ids) {
        list.push(pixels[id - 1]);
        }
        return list;
    }

    function onSelected(selection) {

        const selected = getPixelsByIds(selection);
        setSelection(selected);
        // all selected, no matter which status they have
        //console.log('onSelectedSelection', selection);
        //console.log('onSelected', selected);
        
        let selectedPixels = []
        for(let n in selection){
            selectedPixels.push(
                <div key={selection[n]}>CryptoPixel# {selection[n]}</div> 
            )
        }
        setSelectedPixels(selectedPixels)
    }

    function initiateSales(){
        console.log("all props 3", props)
        let priceInDollar = selection.length * pricePerPixelBlockInDollar
        let priceInEther = priceInDollar / (typeof props.price == "undefined" ? 0 : props.price.toFixed(2))
        
        setPriceToBuyInDollar(priceInDollar)
        setPriceToBuyInEther(priceInEther)
    }

    function buyPixel(){
        let gasPrice = typeof props.gasPrice == "undefined" ? 0 : parseInt(props.gasPrice)
        console.log("gasPrice,", gasPrice)
        console.log("loaded assets", props.loadedAssets)
        console.log("all props", props)

        // Loop through all assets and pull the ones that were selected
        var selectedAssets = []
        for(let asset in props.loadedAssets){
            for(let j = 0; j < selection.length; j++){
                if(props.loadedAssets[asset].pixelId === selection[j].p){
                    selectedAssets.push(props.loadedAssets[asset])
                }       
            }
        }

        console.log('selectedAssets',selectedAssets)
        if(selectedAssets.length < 1){
            // TODO: Show warning
        }

        var buy = []
        for(let i = 0; i < selectedAssets.length; ++i){
            let pixelId = selectedAssets[i].pixelId
            let x = pixelId > 1000 ? parseInt(pixelId[1]+pixelId[2]+pixelId[3]) : 1
            let y = pixelId > 1000 ? parseInt(pixelId[0]) : 1
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

    function getSpecialPieces() { // pixelId
        //let x = pixelId > 1000 ? parseInt(pixelId[1]+pixelId[2]+pixelId[3]) : 1
        //let y = pixelId > 1000 ? parseInt(pixelId[0]) : 1

        const specialBoundaries = [
        { name: 'centerpiece', x: { from: 400, to: 600 }, y: { from: 400, to: 600 } },
        { name: 'upperLeftGuard', x: { from: 200, to: 400 }, y: { from: 200, to: 400 } },
        { name: 'upperRightGuard', x: { from: 600, to: 800 }, y: { from: 200, to: 400 } },
        { name: 'lowerLeftGuard', x: { from: 200, to: 400 }, y: { from: 600, to: 800 } },
        { name: 'lowerRightGuard', x: { from: 600, to: 800 }, y: { from: 600, to: 800 } },
        ];

        /*for (var boundary of specialBoundaries) {
            if (x >= boundary.x.from && x < boundary.x.to && y >= boundary.y.from && y < boundary.y.to) {
                return boundary.name;
            }
        }*/

        // Get from coordinates to Id
        let reserved = []
        for (var b of specialBoundaries) {
            for(let i = b.x.from; i <= b.x.to; ++i){
                for(let j = b.y.from; j <= b.y.to; ++j){
                    reserved.push(j[0]+i)
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
    const [priceToBuyInDollar, setPriceToBuyInDollar] = useState([]);
    const [priceToBuyInEther, setPriceToBuyInEther] = useState([]);

    const STATI = {
        AVAILABLE: 'a',
        RESERVED: 'reserved',
        SOLD: 'sold',
    }

    useEffect(() => {
        // generate Data only once
        const pixels = m.pixel
        const reserved = getSpecialPieces()

        if(props.soldPixels){
            for(var i = 0; i < props.soldPixels.length; ++i){
                pixels[props.soldPixels[i]-1].s = STATI.SOLD
            }
        }
        
        for(var i = 0; i < reserved; ++i){
            pixels[reserved[i]-1].s = STATI.RESERVED
        }

        setPixels(pixels)
        setReserved(reserved)
        //setSelection([pixels[22, 23, 24]]);
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
            Selected Pixels 
            {selectedPixels}
        </div>
        </div>
    );
}
