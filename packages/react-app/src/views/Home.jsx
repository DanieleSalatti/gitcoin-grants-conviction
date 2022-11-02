import React from "react";

import { Dashboard } from "../components";

require("dotenv").config();

export default function Home({
  address,
  votes,
  tx,
  readContracts,
  writeContracts,
  localProvider,
  mainnetProvider,
  localChainId,
}) {
  return (
    <>
      <Dashboard
        address={address}
        readContracts={readContracts}
        writeContracts={writeContracts}
        contractName={"GTCStaking"}
        eventName={"VoteCasted"}
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        votes={votes}
        tx={tx}
        localChainId={localChainId}
      />
      <div style={{ maxWidth: "1280px", marginLeft: "auto", marginRight: "auto" }}>
        <div
          style={{
            padding: 16,
            maxWidth: 700,
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: 32,
            marginBottom: 32,
          }}
        >
          <div style={{ marginLeft: "auto", marginRight: "auto" }}>
            This app is on the deprecation path. Please connect your wallet and unstake your tokens from both Ethereum
            Mainnet and Optimism!
          </div>
        </div>
      </div>
    </>
  );
}
