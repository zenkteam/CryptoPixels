import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";
import { Button } from "antd";
import { Transactor } from "../helpers";
import { utils } from "ethers";

export default function Pixels(props) {
    
    const pricePerPixelBlockInDollar = 100
    const reserved = getReserved()

    function onSelected(selection) {
        setSelection(selection)
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
        console.log('selection', selection)
        console.log('loaded', props.loadedAssets)
        var selectedAssets = [], i = 0
        for(let asset in props.loadedAssets){
            for(let j = 0; j < selection.length; j++){
                if(props.loadedAssets[asset].pixelId == selection[j]){
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

        // Prepare transaction
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
        
        console.log('Buying', buy)
        const tx = Transactor(props.userProvider, props.gasPrice)
        tx( props.writeContracts.CryptoPixels.buyPixels(buy, {
            gasPrice:gasPrice, 
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

    const [zoom, setZoom] = useState('auto');
    const [selection, setSelection] = useState([]);
    const [priceToBuyInDollar, setPriceToBuyInDollar] = useState(0);
    const [priceToBuyInEther, setPriceToBuyInEther] = useState(0);

    const STATI = {
        AVAILABLE: '',    
        RESERVED: 'r', // Because we have pre-rendered the reserved ones we keep it short to save space
        SOLD: 'sold'
    }

    function getReserved() {
        return [4041,4141,4241,4341,4441,4541,4641,4741,4841,4941,5041,5141,5241,5341,5441,5541,5641,5741,5841,5941,4042,4142,4242,4342,4442,4542,4642,4742,4842,4942,5042,5142,5242,5342,5442,5542,5642,5742,5842,5942,4043,4143,4243,4343,4443,4543,4643,4743,4843,4943,5043,5143,5243,5343,5443,5543,5643,5743,5843,5943,4044,4144,4244,4344,4444,4544,4644,4744,4844,4944,5044,5144,5244,5344,5444,5544,5644,5744,5844,5944,4045,4145,4245,4345,4445,4545,4645,4745,4845,4945,5045,5145,5245,5345,5445,5545,5645,5745,5845,5945,4046,4146,4246,4346,4446,4546,4646,4746,4846,4946,5046,5146,5246,5346,5446,5546,5646,5746,5846,5946,4047,4147,4247,4347,4447,4547,4647,4747,4847,4947,5047,5147,5247,5347,5447,5547,5647,5747,5847,5947,4048,4148,4248,4348,4448,4548,4648,4748,4848,4948,5048,5148,5248,5348,5448,5548,5648,5748,5848,5948,4049,4149,4249,4349,4449,4549,4649,4749,4849,4949,5049,5149,5249,5349,5449,5549,5649,5749,5849,5949,4050,4150,4250,4350,4450,4550,4650,4750,4850,4950,5050,5150,5250,5350,5450,5550,5650,5750,5850,5950,4051,4151,4251,4351,4451,4551,4651,4751,4851,4951,5051,5151,5251,5351,5451,5551,5651,5751,5851,5951,4052,4152,4252,4352,4452,4552,4652,4752,4852,4952,5052,5152,5252,5352,5452,5552,5652,5752,5852,5952,4053,4153,4253,4353,4453,4553,4653,4753,4853,4953,5053,5153,5253,5353,5453,5553,5653,5753,5853,5953,4054,4154,4254,4354,4454,4554,4654,4754,4854,4954,5054,5154,5254,5354,5454,5554,5654,5754,5854,5954,4055,4155,4255,4355,4455,4555,4655,4755,4855,4955,5055,5155,5255,5355,5455,5555,5655,5755,5855,5955,4056,4156,4256,4356,4456,4556,4656,4756,4856,4956,5056,5156,5256,5356,5456,5556,5656,5756,5856,5956,4057,4157,4257,4357,4457,4557,4657,4757,4857,4957,5057,5157,5257,5357,5457,5557,5657,5757,5857,5957,4058,4158,4258,4358,4458,4558,4658,4758,4858,4958,5058,5158,5258,5358,5458,5558,5658,5758,5858,5958,4059,4159,4259,4359,4459,4559,4659,4759,4859,4959,5059,5159,5259,5359,5459,5559,5659,5759,5859,5959,4060,4160,4260,4360,4460,4560,4660,4760,4860,4960,5060,5160,5260,5360,5460,5560,5660,5760,5860,5960]
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
                    reserved={reserved}
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
