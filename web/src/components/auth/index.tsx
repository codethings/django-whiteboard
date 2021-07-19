import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";

import { AuthQuery } from "../../__generated__/AuthQuery";

const authQuery = gql`
  query AuthQuery {
    viewer {
      id
      user {
        id
        username
      }
    }
  }
`;

export const AuthContext = React.createContext<AuthQuery["viewer"] | null>(
  null
);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, loading } = useQuery<AuthQuery>(authQuery);
  if (loading) return <>"loading..."</>;
  return (
    <AuthContext.Provider value={data?.viewer || null}>{children}</AuthContext.Provider>
  );
}
