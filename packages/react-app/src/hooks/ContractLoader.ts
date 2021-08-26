/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers/lib/json-rpc-provider";
import { useState, useEffect } from "react";

const loadContract = (contractName: string, signer?: JsonRpcSigner | JsonRpcProvider) => {
  const newContract = new Contract(
    require(`../contracts/${contractName}.address.js`),
    require(`../contracts/${contractName}.abi.js`),
    signer,
  );
  try {
    // @ts-ignore
    newContract.bytecode = require(`../contracts/${contractName}.bytecode.js`);
  } catch (e) {
    console.log(e);
  }
  return newContract;
};

export default function useContractLoader(providerOrSigner: JsonRpcProvider) {
  const [contracts, setContracts] = useState<{
    [key: string]: Contract;
  }>();
  
  useEffect(() => {
    async function loadContracts() {
      if (typeof providerOrSigner !== "undefined") {
        try {
          // we need to check to see if this providerOrSigner has a signer or not
          let signer: JsonRpcSigner | JsonRpcProvider | undefined;
          let accounts: string[] | undefined;
          if (providerOrSigner && typeof providerOrSigner.listAccounts === "function") {
            accounts = await providerOrSigner.listAccounts();
          }

          if (accounts && accounts.length > 0) {
            signer = providerOrSigner.getSigner();
          } else {
            signer = providerOrSigner;
          }

          const contractList: string[] = require("../contracts/contracts.js");

          const newContracts = contractList.reduce((accumulator: {[key: string]: Contract}, contractName) => {
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
