import { Button, List, Skeleton, Avatar } from "antd";
import React, { useEffect, useState } from "react";
import { RollbackOutlined, CheckOutlined, LockOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import { BigNumber } from "ethers";
import { useHistory } from "react-router-dom";

export default function Confirm({ tx, readContracts, writeContracts, cart, setCart, address }) {
  const history = useHistory();
  const [canStake, setCanStake] = useState(false);
  const [allowance, setAllowance] = useState(0);

  const cartTotal = ethers.utils.parseEther(
    cart
      .reduce((runnintTotal, _item) => {
        const value = _item.amount ? parseFloat(_item.amount) : 0;
        return runnintTotal + value;
      }, 0)
      .toString(),
  );

  useEffect(() => {
    if (!readContracts.GTC || !readContracts.GTCStaking) return;
    const checkCanStake = async () => {
      const balance = await readContracts.GTC.balanceOf(address);
      const currentAllowance = await readContracts.GTC.allowance(address, readContracts.GTCStaking.address);
      const canStake = balance.gte(cartTotal) && currentAllowance.gte(cartTotal);
      setAllowance(currentAllowance);
      setCanStake(canStake);
    };
    checkCanStake();
  }, [cartTotal]);

  const handleApprove = () => {
    console.log("tx address", readContracts.GTCStaking.address);
    console.log("tx amount", BigNumber.from(cartTotal));
    tx(writeContracts.GTC.approve(readContracts.GTCStaking.address, cartTotal), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        setCanStake(true);
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

  const handleStake = () => {
    // Staking
    const votes = cart.map(item => {
      console.log("tx duration", Math.floor(Date.now() / 1000) + 60 * 60 * item.duration);
      return {
        grantId: item.id,
        amount: ethers.utils.parseEther(item.amount ? item.amount.toString() : "0"),
      };
    });
    console.log("🗳 Sending votes:", votes);
    tx(writeContracts.GTCStaking.vote(votes), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        setCart([]);

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
        history.push("/success");
      }
    });
  };

  return (
    <div
      style={{
        padding: 16,
        width: "50%",
        margin: "auto",
        marginTop: 64,
        marginBottom: 32,
      }}
    >
      <p>By clicking "Stake" you agree to stake your GTC tokens according to your selections:</p>
      <List
        itemLayout="horizontal"
        dataSource={cart}
        footer={
          <div>
            <p>
              <b>Total: {ethers.utils.formatEther(cartTotal)} GTC</b>
              {" - "}
              <b>Allowance: {ethers.utils.formatEther(allowance)} GTC</b>
            </p>
          </div>
        }
        renderItem={item => (
          <List.Item style={{ opacity: item.amount ? 1.0 : 0.2 }}>
            <Skeleton loading={false} title={false} active>
              <List.Item.Meta avatar={<Avatar src={item.img} />} title={item.title} />
              <div>Amount: {item.amount ?? 0} GTC</div>
            </Skeleton>
          </List.Item>
        )}
      />
      <div style={{ padding: "26px" }}>
        <Button
          onClick={() => {
            history.push("/checkout");
          }}
          style={{ marginRight: "16px" }}
          shape="round"
          icon={<RollbackOutlined key="view-details" />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApprove}
          style={{ marginRight: "16px" }}
          type="primary"
          shape="round"
          disabled={canStake}
          icon={<CheckOutlined key="view-details" />}
        >
          Approve
        </Button>
        <Button
          onClick={handleStake}
          disabled={!canStake}
          type="primary"
          shape="round"
          icon={<LockOutlined key="view-details" />}
        >
          Stake
        </Button>
      </div>
    </div>
  );
}
