import { Button, Input } from "antd";
import { utils } from "ethers";
import React, { useState } from "react";
import { Transactor } from "../helpers";
import { useGasPrice } from "../hooks/index.js";

export default function Manage(props) {
  const [ newEtherPrice, setNewEtherPrice ] = useState()
  const gasPrice = useGasPrice(props.targetNetwork, "fast");
  const tx = Transactor(props.wallet, gasPrice)

  return (
    <div className="textPage">
        <h2>Trade</h2>
        <div>
          <h3>TRANSFER</h3>
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
