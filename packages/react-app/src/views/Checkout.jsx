import { Button, Input, Row, Col, List, Select, Skeleton, Statistic, Avatar } from "antd";
import React, { useEffect, useState } from "react";
import { DeleteOutlined, LockOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import { useHistory } from "react-router-dom";
import { calculateConviction } from "../lib/ConvictionCalculator";

const { Option } = Select;

export default function Checkout({ tokenBalance, cart, setCart }) {
  const [cartTotal, setCartTotal] = useState(0);
  const [convictionPerItem, setConvictionPerItem] = useState([]);
  const history = useHistory();

  useEffect(() => {
    setCartTotal(
      cart.reduce((runnintTotal, _item) => {
        const value = _item.amount ? parseFloat(_item.amount) : 0;
        return runnintTotal + value;
      }, 0),
    );
  }, [cart]);

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
      <List
        itemLayout="horizontal"
        dataSource={cart}
        style={{ margin: "32 auto", width: "400" }}
        renderItem={item => (
          <List.Item
            actions={[
              <Button
                onClick={() => {
                  setCart(cart.filter(_item => _item.id !== item.id));
                }}
                type="primary"
                shape="circle"
                icon={<DeleteOutlined key="remove-from-cart" />}
              />,
            ]}
          >
            <Skeleton loading={false} title={false} active>
              <List.Item.Meta avatar={<Avatar src={item.img} />} title={item.title} />
              <div>
                <div style={{ float: "left" }}>
                  <Select
                    placeholder="Duration"
                    onChange={value => {
                      item.duration = value;
                      setConvictionPerItem({
                        ...convictionPerItem,
                        [item.id]: calculateConviction(item.amount ?? 0, item.duration ?? 0),
                      });
                    }}
                    value={item.duration}
                  >
                    <Option value="1">1 hour</Option>
                    <Option value="24">1 day</Option>
                    <Option value="72">3 days</Option>
                    <Option value="168">7 days</Option>
                    <Option value="336">14 days</Option>
                    <Option value="720">30 days</Option>
                  </Select>
                </div>
                <div style={{ float: "right", marginLeft: "16px" }}>
                  <Input
                    type={"number"}
                    placeholder="0"
                    value={item.amount ?? 0}
                    onChange={e => {
                      item.amount = Number.isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value);
                      e.target.value = item.amount;
                      setConvictionPerItem({
                        ...convictionPerItem,
                        [item.id]: calculateConviction(item.amount ?? 0, item.duration ?? 0),
                      });
                      setCartTotal(
                        cart.reduce((runnintTotal, _item) => {
                          const value = _item.amount ? parseFloat(_item.amount) : 0;
                          return runnintTotal + value;
                        }, 0),
                      );
                    }}
                  />
                </div>
                <div>Conviction impact: {convictionPerItem[item.id]?.toFixed(2) ?? "0.00"}</div>
              </div>
            </Skeleton>
          </List.Item>
        )}
      />
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="Balance"
            value={tokenBalance ? ethers.utils.formatEther(tokenBalance) : "..."}
            suffix=" GTC"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Staked"
            value={cartTotal}
            valueStyle={{
              color: tokenBalance?.gte(ethers.utils.parseEther(cartTotal.toString())) ? "#3f8600" : "#cf1322",
            }}
            suffix={"/ " + (tokenBalance ? ethers.utils.formatEther(tokenBalance) : "...")}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={18}></Col>
        <Col span={6}>
          <Button
            onClick={() => {
              history.push("/confirm");
            }}
            disabled={tokenBalance?.lt(ethers.utils.parseEther(cartTotal.toString())) || cartTotal === 0}
            type="primary"
            shape="round"
            icon={<LockOutlined key="view-details" />}
          >
            Stake
          </Button>
        </Col>
      </Row>
    </div>
  );
}
