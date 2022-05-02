import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header({ link, title, subTitle }) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      <PageHeader title={title} subTitle={subTitle} style={{ cursor: "pointer" }} />
    </a>
  );
}

Header.defaultProps = {
  link: "https://github.com/0xDarni/scaffold-eth/tree/conviction-voting-gitcoin",
  title: "Gitcoin Conviction Voting",
  subTitle: "Signal your support to the community",
};
