
import React from "react";
import { targetNetwork } from "./Config";
import { debugLog, log, logError } from "./Logging";
import { localProvider } from "./Web3Init";
import { Alert } from "antd";

interface NetworkDisplayProps {
  selectedChainId?: number;
  localChainId?: number;
}

// Warning in upper right corner of screen notifying of network error
export const NetworkDisplay = ({ selectedChainId, localChainId }: NetworkDisplayProps) => {
  
  debugLog("🏠 localChainId", localChainId);
  debugLog("🕵🏻‍♂️ selectedChainId:", selectedChainId);

  if (localChainId !== selectedChainId) {
    log("Error", localChainId, selectedChainId);
  }

  if (localChainId && selectedChainId && localChainId !== selectedChainId) {
    return (
      <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
        <Alert
          message="⚠️ Wrong Network"
          description={<div>You have a network error.</div>}
          type="error"
          closable={false}
        />
      </div>
    );
  } else {
    return (
      <div style={{ zIndex: 2, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }
};