import { ApolloProvider } from "@apollo/client";
import React from "react";
import ReactDOM from "react-dom";
import { client } from "./apollo";
import { AuthContext, AuthProvider } from "./components/auth";
import UserDashboard from "./components/user-dashboard";
import TopNav from "./components/topNav";
import Board from "./components/board/";

import "./styles/index.scss";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import LoginPage from "./components/auth/loginPage";

const App = () => {
  const viewer = React.useContext(AuthContext);
  const user = viewer?.user;
  if (user) {
    return (
      <Router>
        <TopNav />
        <div style={{ marginTop: "1rem" }}>
          <Switch>
            <Route path="/" exact>
              <UserDashboard />
            </Route>
            <Route path="/board/:boardId">
              <Board />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  } else {
    return <LoginPage />;
  }
};

const Root = () => {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ApolloProvider>
  );
};

const appContainer = document.getElementById("app") as HTMLDivElement;
ReactDOM.render(<Root />, appContainer);
