import React, { useState, useMemo } from "react";
import { Input, Button, Tooltip } from "antd";
import Blockies from "react-blockies";
import { SendOutlined } from "@ant-design/icons";
import { parseEther } from "@ethersproject/units";
import { Transactor } from "../helpers";
import Wallet from "./Wallet";
import { JsonRpcProvider } from "@ethersproject/providers/lib/json-rpc-provider";

interface FaucetProps {
  localProvider: JsonRpcProvider;
  ensProvider: JsonRpcProvider;
  price: number;
}

export default function Faucet({ localProvider, ensProvider, price }: FaucetProps) {
  const [address, setAddress] = useState<string | undefined>();

  const blockie = useMemo(() => {
    return address ? <Blockies seed={address} size={8} scale={4} /> : <div />;
  }, [address])

  const tx = useMemo(() => (Transactor({provider: localProvider})), [localProvider])

  return (
    <span>
      <Input
        size="large"
        placeholder="local faucet"
        prefix={blockie}
        value={address}
        onChange={e => {
          setAddress(e.target.value);
        }}
        suffix={
          <Tooltip title="Faucet: Send local ether to an address.">
            <Button
              onClick={() => {
                tx?.({
                  to: address,
                  value: parseEther("0.01"),
                });
                setAddress("");
              }}
              shape="circle"
              icon={<SendOutlined />}
            />
            <Wallet
              color="#888888"
              provider={localProvider}
              ensProvider={ensProvider}
              price={price}
            />
          </Tooltip>
        }
      />
    </span>
  );
}
