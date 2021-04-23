import React, { useEffect, useState } from "react";
import { Button, Input } from "antd";
import { AddressInput } from "../components";
import { utils, BigNumber, constants } from "ethers";
import { parseEther } from "@ethersproject/units";
import { Transactor } from "../helpers";
import { useGasPrice } from "../hooks/index.js";

export default function Trade(props) {

  const [ transferToAddresses, setTransferToAddresses ] = useState()
  const [ pixelIdToTransfer, setPixelIdToTransfer ] = useState()
  const [ newEtherPrice, setNewEtherPrice ] = useState()

  const gasPrice = useGasPrice(props.targetNetwork, "fast");
  const tx = Transactor(props.wallet, gasPrice)
  

  return (
    <div className="textPage">
        <h2>Trade</h2>
        <div>
          <h3>TRANSFER</h3>

          <Input
            value={pixelIdToTransfer}
            placeholder={"Pixel-ID"}
            onChange={(e)=>{
              setPixelIdToTransfer(e.target.value)
            }}
          />
          <AddressInput
            ensProvider={props.mainnetProvider}
            placeholder="transfer to address"
            onChange={(newValue)=>{
              setTransferToAddresses(newValue)
            }}
          />
          <Button onClick={()=>{
            tx( props.readWriteContractViaWallet.CryptoPixels.transferFrom(props.walletAddress, transferToAddresses, pixelIdToTransfer) )
          }}>
            Transfer
          </Button>
        </div>

        <div>
          <h3>WITHDRAW</h3>
          <Button onClick={()=>{
            tx( props.readWriteContractViaWallet.CryptoPixels.withdrawPayments(props.walletAddress) )
          }}>
            WITHDRAW OWNER CASH
          </Button>
        </div>

        <div>
          <h3>Set Ether Price in Contract</h3>
          <Input
            value={newEtherPrice}
            placeholder={"Pixel-ID"}
            onChange={(e)=>{
              setNewEtherPrice(e.target.value)
            }}
          />
          <Button onClick={()=>{
            tx( props.readWriteContractViaWallet.CryptoPixels.setEtherPricePerPixel(utils.parseEther(newEtherPrice) ) )
          }}>
            REFRESH CURRENT ETHER PRICE
          </Button>
        </div>

        <div>
          <h3>Get Ether Price from Contract</h3>
          <Button onClick={async ()=>{
            let price = await props.readWriteContractViaWallet.CryptoPixels.getEtherPricePerPixel()
            console.log("CURRENT PRICE IN CONTRACT", utils.formatEther(price))
          }}>
            Get CURRENT ETHER PRICE
          </Button>
        </div>

        <div>
          <h3>Set Ether Price</h3>
          <Button onClick={()=>{
            tx( props.readWriteContractViaWallet.CryptoPixels.mintCenterpiece() )
          }}>
            MINT CENTERPIECE
          </Button>
        </div>
        
    </div>
  );
}
