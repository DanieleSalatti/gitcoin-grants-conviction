import React from "react";
import { Dropdown, Menu, Button } from "antd";
import { NETWORKS } from "../constants";

function NetworkSwitch({ networkOptions, selectedNetwork, setSelectedNetwork }) {
  const menu = (
    <Menu>
      {networkOptions
        .filter(i => i !== selectedNetwork)
        .map(i => (
          <Menu.Item key={i}>
            <Button
              type="text"
              onClick={async () => {
                setSelectedNetwork(i);
                const targetNetwork = NETWORKS[i];
                const ethereum = window.ethereum;
                const data = [
                  {
                    chainId: "0x" + targetNetwork.chainId.toString(16),
                    chainName: targetNetwork.name,
                    nativeCurrency: targetNetwork.nativeCurrency,
                    rpcUrls: [targetNetwork.rpcUrl],
                    blockExplorerUrls: [targetNetwork.blockExplorer],
                  },
                ];
                console.log("data", data);

                let switchTx;
                // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
                try {
                  switchTx = await ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: data[0].chainId }],
                  });
                } catch (switchError) {
                  // not checking specific error code, because maybe we're not using MetaMask
                  try {
                    switchTx = await ethereum.request({
                      method: "wallet_addEthereumChain",
                      params: data,
                    });
                  } catch (addError) {
                    // handle "add" error
                  }
                }

                if (switchTx) {
                  console.log(switchTx);
                }
              }}
            >
              <span style={{ textTransform: "capitalize" }}>{i}</span>
            </Button>
          </Menu.Item>
        ))}
    </Menu>
  );

  return (
    <div>
      <Dropdown.Button overlay={menu} placement="bottomRight" trigger={["click"]}>
        <span style={{ textTransform: "capitalize" }}>{selectedNetwork}</span>
      </Dropdown.Button>
    </div>
  );
}

export default NetworkSwitch;
