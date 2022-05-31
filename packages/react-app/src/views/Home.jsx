import { Button, Card, Input, Spin, Row, Col, notification } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { InfoOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";
import { ethers } from "ethers";
import InfiniteScroll from "react-infinite-scroller";
import { useDebounce } from "use-debounce";

import { Dashboard } from "../components";

import { BUIDL_GUIDL_API_ENDPOINT } from "../constants";

require("dotenv").config();

const { Meta } = Card;

export default function Home({
  address,
  tokenBalance,
  cart,
  setCart,
  votes,
  tx,
  readContracts,
  writeContracts,
  localProvider,
  mainnetProvider,
  localChainId,
}) {
  const [items, setItems] = useState([]);
  const [nextStart, setNextStart] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebounce(filter, 500);
  const [totalGrants, setTotalGrants] = useState(0);

  const generateNewSeed = () => {
    return (Math.random() - 0.5) * 2;
  };

  const [seed, setSeed] = useState(generateNewSeed());

  const limit = 50;

  let reset = false;

  const axiosConfig = {
    baseURL: BUIDL_GUIDL_API_ENDPOINT + "/grants",
    timeout: 30000,
  };

  const axiosClient = axios.create(axiosConfig);

  const fetchGrants = useCallback(async () => {
    if (fetching || (nextStart === -1 && !reset)) {
      return;
    }
    let start = nextStart;
    let currentSeed = seed;
    if (reset) {
      start = 0;
      setNextStart(0);
      reset = false;
      currentSeed = generateNewSeed();
      setSeed(currentSeed);
    }
    setFetching(true);

    let queryString = `?_start=${start}&_limit=${limit}&seed=${currentSeed}`;

    console.log("fetching grants", queryString);

    if (filter) {
      queryString += `&q=${filter}`;
    }

    try {
      let res = await axiosClient.get(queryString);
      // Shuffle the results
      // We will need to repro this on the entire dataset on the backend
      // let data = res.data.sort(() => Math.random() - 0.5);
      let data = res.data;

      if (start === 0) {
        setItems(data);
      } else {
        setItems([...items, ...data]);
      }

      setTotalGrants(res.headers["x-total-count"]);

      if (res.headers["x-total-count"] > start + limit) {
        setNextStart(start + limit);
      } else {
        setNextStart(-1);
      }
    } finally {
      setFetching(false);
    }
  }, [items, fetching, nextStart, debouncedFilter]);

  useEffect(() => {
    fetchGrants();
  }, []);

  useEffect(() => {
    if (filter.length < 4 && filter.length > 0) return;
    reset = true;
    fetchGrants();
  }, [debouncedFilter]);

  useEffect(() => {
    if (tokenBalance) console.log("Your new token balance is", ethers.utils.formatEther(tokenBalance?.toString()));
  }, [tokenBalance]);

  const hasMoreItems = nextStart !== -1;

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
            width: 700,
            margin: "auto",
            marginTop: 32,
            marginBottom: 32,
          }}
        >
          <div style={{ margin: 4 }}>
            <Input
              style={{ fontSize: 24, width: 700 }}
              placeholder="Search"
              onChange={e => {
                setFilter(e.target.value);
              }}
            />
          </div>
        </div>

        <div style={{ display: "none" }}>
          <div style={{ float: "left", marginBottom: 16 }}>Total grants found: {totalGrants}</div>
        </div>
        <div style={{ clear: "both" }}></div>

        <InfiniteScroll
          loadMore={() => {
            !fetching && fetchGrants();
          }}
          hasMore={hasMoreItems}
          loader={
            <div className="loader" key={0}>
              <Spin />
            </div>
          }
        >
          <Row gutter={[24, 16]}>
            {items.map(grant => {
              return (
                <Col span={6} key={grant.id}>
                  <Card
                    hoverable
                    style={{ width: 240 }}
                    cover={
                      <>
                        <Button
                          style={{
                            position: "relative",
                            top: "8px",
                            right: "8px",
                            width: "8px",
                            float: "right",
                            marginBottom: "-24px",
                          }}
                          onClick={() => {
                            window.open(grant.url, "_blank");
                          }}
                          type="default"
                          size="small"
                          shape="circle"
                          icon={<InfoOutlined key="view-details" />}
                        />
                        <img alt={grant.title} src={grant.img} />
                      </>
                    }
                    actions={[
                      <Button
                        disabled={cart.includes(grant)}
                        onClick={() => {
                          if (cart.includes(grant)) {
                            notification["error"]({
                              message: "You already have this grant in your cart!",
                              description: `The grant for ${grant.title} is already in your cart.`,
                              duration: 3,
                              placement: "topRight",
                            });
                            return;
                          }
                          setCart([...cart, grant], () => {
                            notification["success"]({
                              message: "Added to cart",
                              description: `${grant.title}`,
                              duration: 3,
                              placement: "topRight",
                            });
                          });
                        }}
                        type="secondary"
                        shape="round"
                        icon={<ShoppingCartOutlined key="add-to-cart" />}
                      >
                        Stake GTC
                      </Button>,
                    ]}
                  >
                    <Meta title={grant.title} description={grant.description.substr(0, 100) + "..."} />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </InfiniteScroll>
      </div>
    </>
  );
}
