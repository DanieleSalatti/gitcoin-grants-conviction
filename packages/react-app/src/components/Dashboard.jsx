import { List, Button } from "antd";
import { useEffect, useState } from "react";
import { useEventListener } from "eth-hooks/events/useEventListener";
import Address from "./Address";
import { CONVICTION_MULTIPLIER, GTC_STAKING_DEPLOYMENT_BLOCK } from "../constants";
import { gql, useQuery } from "@apollo/client";
import GraphiQL from "graphiql";
import "graphiql/graphiql.min.css";
import fetch from "isomorphic-fetch";
import { UnlockOutlined } from "@ant-design/icons";
import VoteItem from "../components/VoteItem";

const { ethers } = require("ethers");

export default function Events({ address, readContracts, writeContracts, tx }) {
  const query = `query getRunningRecordsByVoterId {
  runningVoteRecords(where: {voter: "${
    address ? address.toLowerCase() : "0x0000000000000000000000000000000000000000"
  }"}) {
    id
    voter {
      id
    }
    grantId
    voteCount
    votes {
      id
      voteId
    }
    totalStaked
    createdAt
    updatedAt
  }
}`;

  const gGGQL = gql(query);
  const { loading, data } = useQuery(gGGQL, { pollInterval: 2500 });

  useEffect(() => {
    console.log("Subgraph loading:", loading);
    if (data) {
      console.log("Subgraph received:", data);
    }
  }, [data, loading]);

  const [unstakeCart, setUnstakeCart] = useState([]);

  const handleUnstake = () => {
    console.log("tx address", readContracts.GTCStaking.address);

    console.log("DASA unstakeCart", unstakeCart);
    const toUnstake = unstakeCart.map(item => {
      console.log("DASA item", item);
      return item.votes.map(vote => {
        console.log("DASA vote", vote.voteId);
        return ethers.BigNumber.from(vote.voteId);
      });
    });
    console.log("DASA toUnstake", toUnstake);
    const flatten = toUnstake.reduce((accumulator, value) => accumulator.concat(value), []);
    console.log("DASA flatten", flatten);

    tx(writeContracts.GTCStaking.releaseTokens(flatten), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
      }
    });
  };

  const unstakeCheckCallBack = (runningVoteRecord, checked) => {
    if (checked) {
      setUnstakeCart([...unstakeCart, runningVoteRecord]);
    } else {
      const uCart = unstakeCart;
      setUnstakeCart(uCart.filter(record => record.id !== runningVoteRecord.id));
    }
  };

  return (
    <div style={{ width: 800, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      {data && data.runningVoteRecords.filter(_item => _item.totalStaked != 0).length > 0 && (
        <>
          <h2>Dashboard:</h2>
          <List
            loading={loading}
            dataSource={data.runningVoteRecords.filter(_item => _item.totalStaked != 0)}
            renderItem={item => <VoteItem item={item} onCheckCallback={unstakeCheckCallBack} />}
          />
          <Button
            onClick={() => {
              handleUnstake();
            }}
            type="primary"
            shape="round"
            disabled={unstakeCart.length == 0}
            icon={<UnlockOutlined key="unstake" />}
          >
            Unstake
          </Button>
        </>
      )}
    </div>
  );
}
