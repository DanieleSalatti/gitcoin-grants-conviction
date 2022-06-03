import { List, Skeleton, Avatar, Checkbox, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { UpCircleTwoTone, DownCircleTwoTone, QuestionCircleTwoTone } from "@ant-design/icons";
import { BUIDL_GUIDL_API_ENDPOINT } from "../constants";

const greenToneColor = "#52c41a";
const redToneColor = "#eb2f96";

const Direction = {
  Up: "Up",
  Down: "Down",
  Unknown: "Unknown",
};

export default function VoteItem({ item, onCheckCallback, block }) {
  const [direction, setDirection] = useState(Direction.Unknown);
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

    const alphaDecay = 0.8;
    const maxMultiplier = 50;

    votes.forEach(vote => {
      const release = releasesByVoteId.get(Number(vote.id));

      let secondsSinceVote = Date.now() / 1000 - parseInt(vote.createdAt);
      let secondsSinceRelease = 0;

      if (release) {
        secondsSinceRelease = Date.now() / 1000 - parseInt(release.createdAt);
        secondsSinceVote = secondsSinceVote - secondsSinceRelease;
      }

      let votingPower = 0;

      const secondsInSixMonths = 60 * 60 * 24 * 30 * 6;
      secondsSinceVote = Math.min(secondsSinceVote, secondsInSixMonths);

      const beta = Math.pow(maxMultiplier, 1 / secondsInSixMonths) - 1;

      votingPower = Number(ethers.utils.formatEther(vote.amount)) * Math.pow(1 + beta, secondsSinceVote);

      for (let i = 0; i < secondsSinceRelease; i++) {
        votingPower = votingPower - ((1 - alphaDecay) / (24 * 60 * 60)) * votingPower;
      }

      if (release) {
        setDirection(Direction.Down);
      } else {
        setDirection(Direction.Up);
      }
      totalVotingPower = totalVotingPower + votingPower;
    });

    setVotingPower(totalVotingPower);
  };

  useEffect(() => {
    void fetchGrantDetails(item);
    void calculateVotingPower(item);
  }, [item]);

  useEffect(() => {
    if (block) {
      void calculateVotingPower(item);
    }
  }, [block]);

  return (
    <List.Item style={{ width: "100%" }}>
      <Skeleton loading={loading} title={false} active>
        {item && (
          <Row gutter={[24, 16]} style={{ width: "100%" }}>
            <Col flex={12}>
              <List.Item.Meta
                avatar={<Avatar src={grantDetails.img} />}
                title={grantDetails.title}
                description={
                  <>
                    <p style={{ whiteSpace: "nowrap", lineHeight: "1" }}>
                      Amount Staked: {ethers.utils.formatEther(item.totalStaked)} GTC
                    </p>
                  </>
                }
              />
            </Col>
            <Col flex={8}>
              Conviction: {votingPower.toFixed(6)}{" "}
              {direction === Direction.Unknown ? (
                <QuestionCircleTwoTone />
              ) : direction === Direction.Up ? (
                <UpCircleTwoTone twoToneColor={greenToneColor} />
              ) : (
                <DownCircleTwoTone twoToneColor={redToneColor} />
              )}
            </Col>
            <Col flex={4}>
              <Checkbox onChange={onChange} disabled={!(item.totalStaked > 0)} checked={checked}>
                Unstake
              </Checkbox>
            </Col>
          </Row>
        )}
      </Skeleton>
    </List.Item>
  );
}
