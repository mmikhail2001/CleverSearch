import { store } from "@store/store";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.scss";

import ErorrPage from "@modules/errorPage/errorPage";
import { LoginForm } from "@modules/login/login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErorrPage />,
  },
  {
    path: "/login",
    element: <LoginForm></LoginForm>,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />;
    </Provider>
  </React.StrictMode>
);
//  @reduxjs/toolkit @types/react-redux @types/react-select react react-dom react-redux react-router-dom react-select
//  @types/node @types/react @types/react-dom @types/react-router-dom @types/webpack @types/webpack-dev-server
//  css-loader html-webpack-plugin mini-css-extract-plugin sass sass-loader style-loader ts-loader ts-node typescript webpack webpack-cli webpack-dev-server
