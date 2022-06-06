import { Layout } from "antd";
import React from "react";

// displays a page header

export default function ScaffoldFooter() {
  const { Footer } = Layout;
  return (
    <Footer style={{ textAlign: "center", background: "transparent" }}>
      <p>
        Created by the{" "}
        <a href="https://buidlguidl.com" target="_blank">
          BuidlGuidl
        </a>{" "}
        using{" "}
        <a href="https://github.com/scaffold-eth/scaffold-eth" target="_blank">
          🏗 scaffold-eth
        </a>
      </p>
      <p>
        <a href="https://github.com/DanieleSalatti/gitcoin-grants-conviction" target="_blank">
          code
        </a>
        {" / "}
        <a href="https://etherscan.io/address/0x195acfcF9f06e43410a3ad177665F358E659cDA6#code" target="_blank">
          contract (mainnet)
        </a>
        {" / "}
        <a
          href="https://optimistic.etherscan.io/address/0xbBb02E07bd83947e920D746b25a067B9424537b7#code"
          target="_blank"
        >
          contract (optimism)
        </a>
      </p>
    </Footer>
  );
}
