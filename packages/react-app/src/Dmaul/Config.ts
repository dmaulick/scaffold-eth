import { NETWORKS, ValidNetworkName } from "../constants";

// 😬 Sorry for all the console logging
type LogLevel = 'none' | 'debug' | 'trace'; 
export const LOG_LEVEL: LogLevel = 'debug'

/// 📡 What chain are your contracts deployed to?
const selectedNetwork: ValidNetworkName = 'localhost' // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
export const targetNetwork = NETWORKS[selectedNetwork]; 
