import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { GRAPH_URI_RINKEBY, GRAPH_URI_MAINNET, INITIAL_NETWORK } from "./constants";

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

const GRAPH_URI = INITIAL_NETWORK !== "mainnet" ? GRAPH_URI_RINKEBY : GRAPH_URI_MAINNET;

const client = new ApolloClient({
  uri: GRAPH_URI,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
      <BrowserRouter>
        <App subgraphUri={GRAPH_URI} />
      </BrowserRouter>
    </ThemeSwitcherProvider>
  </ApolloProvider>,
  document.getElementById("root"),
);
