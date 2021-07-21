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

const LayoutWithTopNav: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <div>
      <TopNav />
      <div className="mt-4"></div>
      {children}
    </div>
  );
};

const App = () => {
  const viewer = React.useContext(AuthContext);
  const user = viewer?.user;
  if (user) {
    return (
      <Router>
          <Switch>
            <Route path="/" exact>
              <LayoutWithTopNav>
                <UserDashboard />
              </LayoutWithTopNav>
            </Route>
            <Route path="/board/:boardId">
              <Board />
            </Route>
          </Switch>
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
