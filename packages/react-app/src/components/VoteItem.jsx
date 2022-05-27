import { List, Skeleton, Avatar, Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

import { BUIDL_GUIDL_API_ENDPOINT } from "../constants";

export default function VoteItem({ item, onCheckCallback }) {
  const [loading, setLoading] = useState(true);
  const [grantDetails, setGrantDetails] = useState({});
  const [checked, setChecked] = useState(false);

  const [votingPower, setVotingPower] = useState(0);

  function onChange(e) {
    setChecked(e.target.checked);
    onCheckCallback(item, e.target.checked);
  }

  const axiosConfig = {
    baseURL: BUIDL_GUIDL_API_ENDPOINT + "/grant",
    timeout: 30000,
  };

  const axiosClient = axios.create(axiosConfig);

  const fetchGrantDetails = async item => {
    try {
      let res = await axiosClient.get(`/${item.grantId}`);
      setGrantDetails(res.data[0]);
      setChecked(false);
      setLoading(false);
    } catch (error) {
      console.log("🗳 Error:", error);
    }
  };

  const calculateVotingPower = () => {
    const votes = item.votes;
    const releasesByVoteId = new Map();
    item.releases.forEach(release => {
      releasesByVoteId.set(Number(release.voteId), release);
    });

    let totalVotingPower = 0;

    const alpha = 0.98;
    const alphaDecay = 0.8;

    votes.forEach(vote => {
      const release = releasesByVoteId.get(Number(vote.id));

      let daysSinceVote = (Date.now() / 1000 - new Date(parseInt(vote.createdAt))) / 60 / 60 / 24;
      let daysSinceRelease = 0;

      if (release) {
        daysSinceRelease = (Date.now() / 1000 - new Date(parseInt(release.createdAt))) / 60 / 60 / 24;
        daysSinceVote = daysSinceVote - daysSinceRelease;
      }

      let votingPower = 0;

      for (let i = 0; i < daysSinceVote; i++) {
        votingPower = Number(ethers.utils.formatEther(vote.amount)) + alpha * votingPower;
      }

      console.log("🗳 amount:", Number(ethers.utils.formatEther(vote.amount)));
      console.log(`🗳 votingPower after ${daysSinceVote} DSV:`, votingPower);

      for (let i = 0; i < daysSinceRelease; i++) {
        votingPower = alphaDecay * votingPower;
      }

      console.log(`🗳 votingPower after ${daysSinceVote} DSV and ${daysSinceRelease} DSR:`, votingPower);

      totalVotingPower = totalVotingPower + votingPower;
    });
    console.log("🗳 totalVotingPower:", totalVotingPower);
    setVotingPower(totalVotingPower);
  };

  useEffect(() => {
    void fetchGrantDetails(item);
    void calculateVotingPower(item);
  }, [item]);

  return (
    <List.Item>
      <Skeleton loading={loading} title={false} active>
        {item && (
          <>
            <List.Item.Meta avatar={<Avatar src={grantDetails.img} />} title={grantDetails.title} />
            <div style={{ float: "right", marginLeft: "16px" }}>
              Amount: {ethers.utils.formatEther(item.totalStaked)} GTC
            </div>
            <div style={{ float: "right", marginLeft: "16px" }}>VP: {votingPower.toFixed(4)}</div>

            <Checkbox
              onChange={onChange}
              style={{ marginLeft: "16px" }}
              disabled={!(item.totalStaked > 0)}
              checked={checked}
            >
              Unstake
            </Checkbox>
          </>
        )}
      </Skeleton>
    </List.Item>
  );
}
