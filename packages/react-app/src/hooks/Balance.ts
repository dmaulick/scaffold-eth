import { BigNumber } from "@ethersproject/bignumber/lib/bignumber";
import { JsonRpcProvider } from "@ethersproject/providers/lib/json-rpc-provider";
import { useCallback, useState } from "react";
import usePoller from "./Poller";

interface useBalanceProps {
  provider?: JsonRpcProvider;
  address?: string;
}

export default function useBalance({ provider, address }: useBalanceProps) {
  const [balance, setBalance] = useState<BigNumber>();

  const pollBalance = useCallback(() => {
    const pollBalanceAsync = async () => {
      if (address && provider) {
        const newBalance = await provider.getBalance(address);
        if (newBalance !== balance) {
          // console.log("NEW BALANCE:",newBalance,"Current balance",balance)
          setBalance(newBalance);
        }
      }
    };
    pollBalanceAsync();
  }, [address, balance, provider]);

  usePoller(pollBalance, 27777, address && provider);

  return balance;
}
