/*import React from "react";
import { Button, List, Card} from "antd";
import { Address, AddressInput } from "./components";
import Web3Connect from "./Web3Connect";

export default function Bought() {

  [] = Web3Connect


  return (
    <div style={{ width:640, margin: "auto", marginTop:32, paddingBottom:32 }}>
      <List
        bordered
        dataSource={CryptoPixels}
        renderItem={(item) => {
          const id = item.id; //.toNumber()
          return (
            <List.Item key={id+"_"+item.uri+"_"+item.owner}>
              <Card title={(
                <div>
                  <span style={{fontSize:16, marginRight:8}}>#{id}</span> {item.name}
                </div>
              )}>
                <div><img src={item.image} style={{maxWidth:150}} /></div>
                <div>{item.description}</div>
              </Card>

              <div>
                owner: <Address
                    address={item.owner}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={16}
                />
                <AddressInput
                  ensProvider={mainnetProvider}
                  placeholder="transfer to address"
                  value={transferToAddresses[id]}
                  onChange={(newValue)=>{
                    let update = {}
                    update[id] = newValue
                    setTransferToAddresses({ ...transferToAddresses, ...update})
                  }}
                />
                <Button onClick={()=>{
                  console.log("writeContracts",writeContracts)
                  tx( writeContracts.CryptoPixels.transferFrom(address, transferToAddresses[id], id) )
                }}>
                  Transfer
                </Button>
              </div>
            </List.Item>
          )
        }}
      />
    </div>  
  );
}
*/