/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";
import { Button } from "antd";


export default function Pixels(props) {
    
    var pricePerPixelBlockInDollar = 1

    function generatePixelMatrix() {
        const matrix = [];
        var i = 1;
        for (var r = 0; r < 100; r++) {
            matrix.push([]);
            for (var c = 0; c < 100; c++) {
                matrix[r].push({
                    id: i++,
                    status: STATI.AVAILABLE,

                    // upper left corner of pixel area
                    //x: c * 10,
                    //y: r * 10,
                });
            }
        }

        return matrix;
    }

    function matrixToArray(matrix) {
        const pixels = [];
        for (var r = 0; r < matrix.length; r++) {
        for (var c = 0; c < matrix[r].length; c++) {
            pixels.push(matrix[r][c]);
        }
        }
        return pixels;
    }

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

        let priceInDollar = selection.length * pricePerPixelBlockInDollar
        let priceInEther = priceInDollar / (typeof props.price == "undefined" ? 0 : props.price.toFixed(2))
        console.log("price:", props.price)
        setPriceToBuyInDollar(priceInDollar)
        setPriceToBuyInEther(priceInEther)
    }

    function resetSelection() {
        onSelected([]);
    }

    function onZoomUpdate(zoom) {
        setZoom(zoom);
    }

    function checkForSpecialPiece(x, y) {
        const specialBoundaries = [
        { name: 'centerpiece', x: { from: 400, to: 600 }, y: { from: 400, to: 600 } },
        { name: 'upperLeftGuard', x: { from: 200, to: 400 }, y: { from: 200, to: 400 } },
        { name: 'upperRightGuard', x: { from: 600, to: 800 }, y: { from: 200, to: 400 } },
        { name: 'lowerLeftGuard', x: { from: 200, to: 400 }, y: { from: 600, to: 800 } },
        { name: 'lowerRightGuard', x: { from: 600, to: 800 }, y: { from: 600, to: 800 } },
        ];

        for (var boundary of specialBoundaries) {
        if (x >= boundary.x.from && x < boundary.x.to && y >= boundary.y.from && y < boundary.y.to) {
            return boundary.name;
        }
        }

        return false;
    }

    function checkIfSold(pixelId){
        return props.soldPixels && props.soldPixels.indexOf(pixelId) !== -1
    }

    const [matrix, setMatrix] = useState();
    const [pixels, setPixels] = useState();
    const [selectedPixels, setSelectedPixels] = useState([]);
    const [zoom, setZoom] = useState('auto');
    const [selection, setSelection] = useState([]);
    const [priceToBuyInDollar, setPriceToBuyInDollar] = useState([]);
    const [priceToBuyInEther, setPriceToBuyInEther] = useState([]);

    const STATI = {
        AVAILABLE: 'available',
        RESERVED: 'reserved',
        SOLD: 'sold',
    }

    useEffect(() => {
        // generate Data only once
        const matrix = generatePixelMatrix();
        const pixels = matrixToArray(matrix);

        // mark reserved
        for (var pixel of pixels) {
            if(checkIfSold(pixel.id)){
                pixel.status = STATI.SOLD
            } else if (checkForSpecialPiece(pixel.x, pixel.y)) {
                pixel.status = STATI.RESERVED
            }
        }

        setMatrix(matrix)
        setPixels(pixels)
        //setSelectedPixels(selection)
        // to manually select pixels call:
        setSelection([pixels[22, 23, 24]]);
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
            <Button onClick={()=>{
            let gasPrice = typeof props.gasPrice == "undefined" ? 0 : props.gasPrice.toFixed(2)
            console.log("gasPrice,", gasPrice)
            console.log(props.loadedAssets)
            console.log("all props", props)
            //tx( writeContracts.CryptoPixels.buyPixels(loadedAssets[a], {gasPrice:gasPrice, itemPrice: gasPrice}) )
            }}>
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
