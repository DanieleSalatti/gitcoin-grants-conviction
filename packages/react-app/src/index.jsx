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

ReactDOM.render(
  <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeSwitcherProvider>,
  document.getElementById("root"),
);
