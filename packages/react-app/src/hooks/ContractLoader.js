/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { Contract } from "@ethersproject/contracts";
import { useState, useEffect } from "react";

/*
  ~ What it does? ~

  Loads your local contracts and gives options to read values from contracts 
                                              or write transactions into them

  ~ How can I use? ~

  const readContracts = useContractLoader(localProvider) // or
  const writeContracts = useContractLoader(userProvider)

  ~ Features ~

  - localProvider enables reading values from contracts
  - userProvider enables writing transactions into contracts
  - Example of keeping track of "purpose" variable by loading contracts into readContracts 
    and using ContractReader.js hook:
    const purpose = useContractReader(readContracts,"YourContract", "purpose")
  - Example of using setPurpose function from our contract and writing transactions by Transactor.js helper:
    tx( writeContracts.YourContract.setPurpose(newPurpose) )
*/

const loadContract = (contractName, signer) => {
  let address, abi, bytecode;
  
  switch (process.env.REACT_APP_NETWORK) {
    case 'mainnet':
      address = require(`../contracts/mainnet/${contractName}.address.js`);
      abi = require(`../contracts/mainnet/${contractName}.abi.js`);
      bytecode = require(`../contracts/mainnet/${contractName}.address.js`);
      break;
    case 'rinkeby':
      address = require(`../contracts/rinkeby/${contractName}.address.js`);
      abi = require(`../contracts/rinkeby/${contractName}.abi.js`);
      bytecode = require(`../contracts/rinkeby/${contractName}.address.js`);
      break;
    case 'localhost':
    default:
      address = require(`../contracts/${contractName}.address.js`);
      abi = require(`../contracts/${contractName}.abi.js`);
      bytecode = require(`../contracts/${contractName}.address.js`);
  }
  
  const newContract = new Contract(
    address,
    abi,
    signer,
  );
  try {
    newContract.bytecode = bytecode;
  } catch (e) {
    console.log(e);
  }
  return newContract;
};

export default function useContractLoader(providerOrSigner) {
  const [contracts, setContracts] = useState();
  useEffect(() => {
    async function loadContracts() {
      if (typeof providerOrSigner !== "undefined") {
        try {
          // we need to check to see if this providerOrSigner has a signer or not
          let signer;
          let accounts;
          if (providerOrSigner && typeof providerOrSigner.listAccounts === "function") {
            accounts = await providerOrSigner.listAccounts();
          }

          if (accounts && accounts.length > 0) {
            signer = providerOrSigner.getSigner();
          } else {
            signer = providerOrSigner;
          }

          const contractList = require("../contracts/contracts.js");

          const newContracts = contractList.reduce((accumulator, contractName) => {
            accumulator[contractName] = loadContract(contractName, signer);
            return accumulator;
          }, {});
          setContracts(newContracts);
        } catch (e) {
          console.log("ERROR LOADING CONTRACTS!!", e);
        }
      }
    }
    loadContracts();
  }, [providerOrSigner]);
  return contracts;
}
