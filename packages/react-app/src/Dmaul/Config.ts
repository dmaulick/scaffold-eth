import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from "../constants";

// 😬 Sorry for all the console logging
type LogLevel = 'none' | 'debug' | 'trace'; 
export const LOG_LEVEL: LogLevel = 'debug'



/// 📡 What chain are your contracts deployed to?
export const targetNetwork = NETWORKS['localhost']; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
