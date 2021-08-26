
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { log, debugLog, trace, logError } from "./Logging";
import { INFURA_ID, DAI_ADDRESS, NETWORKS } from "../constants";
import { targetNetwork } from "./Config";

// 🛰 providers
debugLog("📡 Connecting to Mainnet Ethereum");
export const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID); // ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

debugLog("📡 Connecting to Local Ethereum");
const localProviderUrl = targetNetwork.rpcUrl; // 🏠 Your local provider is usually pointed at your local blockchain

trace("📡 Connecting to Local env provided Network");
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl; // as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
debugLog("🏠 Connecting to provider:", localProviderUrlFromEnv);
export const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
export const blockExplorer = targetNetwork.blockExplorer;
