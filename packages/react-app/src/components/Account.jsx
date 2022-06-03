import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";

import Address from "./Address";
import Balance from "./Balance";
import Wallet from "./Wallet";

/**
  ~ What it does? ~

  Displays an Address, Balance, and Wallet as one Account component,
  also allows users to log in to existing accounts and log out

  ~ How can I use? ~

  <Account
    useBurner={boolean}
    address={address}
    localProvider={localProvider}
    userProvider={userProvider}
    mainnetProvider={mainnetProvider}
    price={price}
    web3Modal={web3Modal}
    loadWeb3Modal={loadWeb3Modal}
    logoutOfWeb3Modal={logoutOfWeb3Modal}
    blockExplorer={blockExplorer}
    isContract={boolean}
  />

  ~ Features ~

  - Provide address={address} and get balance corresponding to the given address
  - Provide localProvider={localProvider} to access balance on local network
  - Provide userProvider={userProvider} to display a wallet
  - Provide mainnetProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide price={price} of ether and get your balance converted to dollars
  - Provide web3Modal={web3Modal}, loadWeb3Modal={loadWeb3Modal}, logoutOfWeb3Modal={logoutOfWeb3Modal}
              to be able to log in/log out to/from existing accounts
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
**/

export default function Account({
  useBurner,
  address,
  userSigner,
  localProvider,
  mainnetProvider,
  price,
  minimized,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
  isContract,
  fontSize,
  readContracts,
  localChainId,
}) {
  const { currentTheme } = useThemeSwitcher();

  const [showOptimismBridge, setShowOptimismBridge] = useState(localChainId === 1);

  useEffect(() => {
    if (localChainId === 10) {
      setShowOptimismBridge(true);
    } else {
      setShowOptimismBridge(false);
    }
  }, [localChainId]);

  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
        <Button
          key="logoutbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          onClick={logoutOfWeb3Modal}
        >
          logout
        </Button>,
      );
    } else {
      modalButtons.push(
        <Button
          key="loginbutton"
          style={{ verticalAlign: "top", marginRight: 38, marginTop: 14, transform: "scale(1.4)" }}
          shape="round"
          size="large"
          type={minimized ? "default" : "primary"}
          onClick={loadWeb3Modal}
        >
          👛 Connect Wallet
        </Button>,
      );
    }
  }
  const display = minimized ? (
    ""
  ) : (
    <span>
      {web3Modal && web3Modal.cachedProvider ? (
        <>
          {address && (
            <Address
              address={address}
              ensProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              fontSize={fontSize}
            />
          )}
          <Balance
            address={address}
            provider={localProvider}
            price={price}
            size={fontSize}
            readContracts={readContracts}
          />
          <Wallet
            address={address}
            provider={localProvider}
            signer={userSigner}
            ensProvider={mainnetProvider}
            price={price}
            color={currentTheme === "light" ? "#1890ff" : "#2caad9"}
          />
        </>
      ) : useBurner ? (
        ""
      ) : isContract ? (
        <>
          {address && (
            <Address
              address={address}
              ensProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              fontSize={fontSize}
            />
          )}
          <Balance address={address} provider={localProvider} price={price} size={fontSize} />
        </>
      ) : (
        ""
      )}
      {useBurner && web3Modal && !web3Modal.cachedProvider ? (
        <>
          <Address address={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={fontSize} />
          <Balance address={address} provider={localProvider} price={price} size={fontSize} />
          <Wallet
            address={address}
            provider={localProvider}
            signer={userSigner}
            ensProvider={mainnetProvider}
            price={price}
            color={currentTheme === "light" ? "#1890ff" : "#2caad9"}
          />
        </>
      ) : (
        <></>
      )}
    </span>
  );

  return (
    <>
      <div>
        {display}
        {modalButtons}
        {showOptimismBridge && (
          <div style={{ textAlign: "left" }}>
            <a href="https://app.optimism.io/bridge" target="_blank">
              Bridge Mainnet GTC to Optimism
            </a>
          </div>
        )}
      </div>
    </>
  );
}
