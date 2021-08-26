import { Contract } from "@ethersproject/contracts";
import { useState, useEffect, useMemo, useCallback } from "react";
import { debugLog } from "../Dmaul/Logging";
import usePoller from "./Poller";

interface useContractReaderProps {
  contracts: {
    [key: string]: Contract;
} | undefined;
  contractName: string;
  functionName: string;
  args?: any[];
  pollTime?: any;
  formatter?: any;
  onChange?: any;
}

export default function useContractReader({
  contracts, 
  contractName, 
  functionName, 
  args, 
  pollTime, 
  formatter, 
  onChange }: useContractReaderProps) {

  const [value, setValue] = useState<any>();

  const adjustPollTime = useMemo(() => {
    if (pollTime) {
      return pollTime;
    }
    if (!pollTime && typeof args === "number") {
      // it's okay to pass poll time as last argument without args for the call
      return args;
    }
    return 1777;
  }, [args, pollTime]);

  useEffect(() => {
    if (typeof onChange === "function") {
      // @ts-ignore
      setTimeout(onChange.bind(this, value), 1);
    }
  }, [value, onChange]);


  const callSmartContractFunction = useCallback(() => {
    const execute = async () => {
      if (contracts && contracts[contractName]) {
        try {
          let newValue;
          debugLog("CALLING ", contractName, functionName, "with args", args);
          if (args && args.length > 0) {
            newValue = await contracts[contractName][functionName](...args);
            debugLog("contractName", contractName, "functionName", functionName, "args", args, "RESULT:", newValue);
          } else {
            newValue = await contracts[contractName][functionName]();
          }
          if (formatter && typeof formatter === "function") {
            newValue = formatter(newValue);
          }
          // console.log("GOT VALUE",newValue)
          if (newValue !== value) {
            setValue(newValue);
          }
        } catch (e) {
          console.log(e);
        }
      }
    };
    execute();
  }, [])

  usePoller(
    callSmartContractFunction,
    adjustPollTime,
    contracts,
  );

  return value;
}
