import { List, Button } from "antd";
import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import "graphiql/graphiql.min.css";
import { UnlockOutlined } from "@ant-design/icons";
import VoteItem from "../components/VoteItem";

import { useOnRepetition } from "eth-hooks";

const { ethers } = require("ethers");

export default function Dashboard({ address, readContracts, writeContracts, tx, mainnetProvider }) {
  const [block, setBlock] = useState(0);

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
      amount
      createdAt
    }
    releases {
      id
      voteId
      amount
      createdAt
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

  useOnRepetition(
    () => {
      if (!mainnetProvider) return;
      console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
      setBlock(mainnetProvider._lastBlockNumber);
    },
    {
      provider: mainnetProvider,
      leadingTrigger: true,
    },
  );

  const [unstakeCart, setUnstakeCart] = useState([]);

  const handleUnstake = () => {
    console.log("tx address", readContracts.GTCStaking.address);

    const toUnstake = unstakeCart.map(item => {
      return item.votes.map(vote => {
        return ethers.BigNumber.from(vote.id);
      });
    });
    const flatten = toUnstake.reduce((accumulator, value) => accumulator.concat(value), []);

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
          <h2>Dashboard</h2>
          <p>
            Stake/unstake operations will be reflected here with a delay. Please allow a few seconds for the Subgraph so
            sync.
          </p>
          <p>Voting power is recalculated for every new block.</p>
          <List
            loading={loading}
            dataSource={data.runningVoteRecords.filter(_item => _item /*.totalStaked != 0*/)}
            renderItem={item => <VoteItem item={item} onCheckCallback={unstakeCheckCallBack} block={block} />}
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
