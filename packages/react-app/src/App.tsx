/* eslint-disable no-underscore-dangle */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, Menu, Alert, List } from "antd";
import { useUserAddress } from "eth-hooks";
import { formatEther, parseEther } from "@ethersproject/units";
import { NetworkDisplay } from "./Dmaul/NetworkDisplay";
import {
  useEthExchangePrice,
  useGasPrice,
  useUserProvider,
  useContractLoader,
  useContractReader,
  useEventListener,
  useBalance,
  // eslint-disable-next-line no-unused-vars
  useExternalContractLoader,
} from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Balance, Address } from "./components";
import { Transactor } from "./helpers";
// eslint-disable-next-line no-unused-vars
import { Hints, ExampleUI, Subgraph } from "./views";
// eslint-disable-next-line no-unused-vars
import { INFURA_ID, DAI_ADDRESS, NETWORKS } from "./constants";
import { log, debugLog, logError } from "./Dmaul/Logging";
import { targetNetwork } from "./Dmaul/Config";
import { web3Modal, logoutOfWeb3Modal } from "./Dmaul/Web3Modal";
import { mainnetProvider, localProvider, blockExplorer } from "./Dmaul/Web3Init";

const humanizeDuration = require("humanize-duration");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    📡 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

// --------------- Moved from Bottom of app.jsx -- not sure what its for yet ------------------------

// eslint-disable-next-line no-unused-expressions
window.ethereum &&
  // eslint-disable-next-line no-unused-vars
  window.ethereum.on("chainChanged", chainId => {
    setTimeout(() => {
      window.location.reload();
    }, 1);
  });

// ---------------------------------------------------------------------------------------------

function App() {
  const [injectedProvider, setInjectedProvider] = useState<Web3Provider>();

  const price = useEthExchangePrice(targetNetwork, mainnetProvider);

  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);
  debugLog("👩‍💼 selected address:", address);

  // ** For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks
  const tx = Transactor(userProvider, gasPrice); // The transactor wraps transactions and provides notificiations

  const faucetTx = Transactor(localProvider, gasPrice); // Faucet Tx can be used to send funds from the faucet


  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourLocalBalance = useBalance({ provider: localProvider, address });
  const yourMainnetBalance = useBalance({ provider: mainnetProvider, address });
  debugLog("💵 yourLocalBalance", yourLocalBalance ? formatEther(yourLocalBalance) : "...");
  debugLog("💵 yourMainnetBalance", yourMainnetBalance ? formatEther(yourMainnetBalance) : "...");

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);
  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider);
  debugLog("📝 readContracts", readContracts);
  debugLog("🔐 writeContracts", writeContracts);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  // const mainnetDAIContract = useExternalContractLoader(mainnetProvider, DAI_ADDRESS, DAI_ABI)
  // log("🥇DAI contract on mainnet:",mainnetDAIContract)
  //
  // Then read your DAI balance like:
  // const myMainnetBalance = useContractReader({DAI: mainnetDAIContract},"DAI", "balanceOf",["0x34aA3F359A9D614239015126635CE7732c18fDF3"])
  //


  // INVESTIGATE STAKER SMART CONTRACT STATE:

  // keep track of contract balance to know how much has been staked total:
  const stakerContractBalance = useBalance({provider: localProvider, address: readContracts && readContracts.Staker.address});
  // keep track of total 'threshold' needed of ETH
  const threshold = useContractReader(readContracts, "Staker", "threshold");
  // keep track of a variable from the contract in the local React state:
  const balanceStaked = useContractReader(readContracts, "Staker", "balances", [address]);
  // 📟 Listen for broadcast events
  const stakeEvents = useEventListener(readContracts, "Staker", "Stake", localProvider, 1);
  // keep track of a variable from the contract in the local React state:
  const timeLeft = useContractReader(readContracts, "Staker", "timeLeft");
  // check to see if contract has completed:
  const complete = useContractReader(readContracts, "ExampleExternalContract", "completed");
  // check balance of example external contract
  const exampleExternalContractBalance = useBalance({
    provider: localProvider,
    address: readContracts && readContracts.ExampleExternalContract.address,
  });

  debugLog("💵 stakerContractBalance", stakerContractBalance);
  log("💵 threshold:", threshold);
  log("💸 balanceStaked:", balanceStaked);
  log("📟 stake events:", stakeEvents);
  log("⏳ timeLeft:", timeLeft);
  log("✅ complete:", complete);
  debugLog("💵 exampleExternalContractBalance", exampleExternalContractBalance);


  const completeDisplay = useMemo(() => {
    if (complete) {
      return (
        <div style={{ padding: 64, backgroundColor: "#eeffef", fontWeight: "bolder" }}>
          🚀 🎖 👩‍🚀 - Staking App triggered `ExampleExternalContract` -- 🎉 🍾 🎊
          <Balance balance={exampleExternalContractBalance} fontSize={64} /> ETH staked!
        </div>
      );
    } else {
      return "";
    }
  }, []);

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    const web3Provider = new Web3Provider(provider)
    setInjectedProvider(web3Provider);
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState<string>();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const [faucetClicked, setFaucetClicked] = useState(false);

  const faucetHint = useMemo(() => {
    if (
      !faucetClicked &&
      localProvider &&
      localProvider._network &&
      localProvider._network.chainId === 31337 &&
      yourLocalBalance &&
      parseInt(formatEther(yourLocalBalance)) <= 0
    ) {
      return (
        <div style={{ padding: 16 }}>
          <Button
            type="primary"
            onClick={() => {
              faucetTx?.({
                to: address,
                value: parseEther("0.01"),
              });
              setFaucetClicked(true);
            }}
          >
            💰 Grab funds from the faucet ⛽️
          </Button>
        </div>
      );
    }
    return "";
  }, [address, faucetClicked, faucetTx, yourLocalBalance]);

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      <NetworkDisplay selectedChainId={userProvider?._network?.chainId} localChainId={localProvider?._network?.chainId} />
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={route ? [route]: undefined} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Staker UI
            </Link>
          </Menu.Item>
          <Menu.Item key="/contracts">
            <Link
              onClick={() => {
                setRoute("/contracts");
              }}
              to="/contracts"
            >
              Debug Contracts
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {completeDisplay}

            <div style={{ padding: 8, marginTop: 32 }}>
              <div>Timeleft:</div>
              {timeLeft && humanizeDuration(timeLeft.toNumber() * 1000)}
            </div>

            <div style={{ padding: 8 }}>
              <div>Total staked:</div>
              <Balance balance={stakerContractBalance} fontSize={64} />/<Balance balance={threshold} fontSize={64} />
            </div>

            <div style={{ padding: 8 }}>
              <div>You staked:</div>
              <Balance balance={balanceStaked} fontSize={64} />
            </div>

            <div style={{ padding: 8 }}>
              <Button
                type="default"
                onClick={() => {
                  tx?.(writeContracts.Staker.execute());
                }}
              >
                📡 Execute!
              </Button>
            </div>

            <div style={{ padding: 8 }}>
              <Button
                type="default"
                onClick={() => {
                  tx?.(writeContracts.Staker.withdraw(address));
                }}
              >
                🏧 Withdraw
              </Button>
            </div>

            <div style={{ padding: 8 }}>
              <Button
                type={balanceStaked ? "primary" : "dashed" }
                onClick={() => {
                  tx?.(writeContracts.Staker.stake({ value: parseEther("0.5") }));
                }}
              >
                🥩 Stake 0.5 ether!
              </Button>
            </div>

            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}

            <div style={{ width: 500, margin: "auto", marginTop: 64 }}>
              <div>Stake Events:</div>
              <List
                dataSource={stakeEvents}
                renderItem={item => {
                  return (
                    <List.Item key={item[0] + item[1] + item.blockNumber}>
                      <Address value={item[0]} ensProvider={mainnetProvider} fontSize={16} />
                      <Balance balance={item[1]} />
                    </List.Item>
                  );
                }}
              />
            </div>

            {/* uncomment for a second contract:
            <Contract
              name="SecondContract"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            */}

            {/* Uncomment to display and interact with an external contract (DAI on mainnet):
            <Contract
              name="DAI"
              customContract={mainnetDAIContract}
              signer={userProvider.getSigner()}
              provider={mainnetProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            */}
          </Route>
          <Route path="/contracts">
            <Contract
              name="Staker"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            <Contract
              name="ExampleExternalContract"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>

      <div style={{ marginTop: 32, opacity: 0.5 }}>
        Created by <Address value="Your...address" ensProvider={mainnetProvider} fontSize={16} />
      </div>

      <div style={{ marginTop: 32, opacity: 0.5 }}>
        <a
          // eslint-disable-next-line react/jsx-no-target-blank
          target="_blank"
          style={{ padding: 32, color: "#000" }}
          href="https://github.com/austintgriffith/scaffold-eth"
        >
          🍴 Fork me!
        </a>
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              localProvider &&
              localProvider.connection &&
              localProvider.connection.url &&
              localProvider.connection.url.indexOf(window.location.hostname) >= 0 &&
              !process.env.REACT_APP_PROVIDER &&
              price > 1 ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
