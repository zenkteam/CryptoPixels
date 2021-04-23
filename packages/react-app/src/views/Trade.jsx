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
            tx( props.writeContracts.CryptoPixels.transferFrom(props.walletAddress, transferToAddresses, pixelIdToTransfer) )
          }}>
            Transfer
          </Button>
        </div>

        <div>
          <h3>WITHDRAW</h3>
          <Button onClick={()=>{
            tx( props.writeContracts.CryptoPixels.withdrawPayments(props.walletAddress) )
          }}>
            WITHDRAW OWNER CASH
          </Button>
        </div>
        
    </div>
  );
}
