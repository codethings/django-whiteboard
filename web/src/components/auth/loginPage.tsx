import { gql, useMutation } from "@apollo/client";
import React from "react";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import {
  LoginMutation,
  LoginMutationVariables,
} from "../../__generated__/LoginMutation";
import {
  RegMutationVariables,
  RegMutation,
} from "../../__generated__/RegMutation";

const loginMutation = gql`
  mutation LoginMutation($input: LoginInput!) {
    login(input: $input) {
      viewer {
        id
        user {
          id
          username
        }
      }
    }
  }
`;

const regMutation = gql`
  mutation RegMutation($input: CreateUserInput!) {
    createUser(input: $input) {
      viewer {
        id
        user {
          id
          username
        }
      }
    }
  }
`;

function LoginPage() {
  const [mode, setMode] = React.useState<"login" | "reg">("login");
  const toggleMode = React.useCallback(() => {
    setMode((current) => {
      if (current === "login") return "reg";
      return "login";
    });
  }, [setMode]);
  const { register, handleSubmit } =
    useForm<{ username: string; password: string; password2: string }>();
  const [login] = useMutation<LoginMutation, LoginMutationVariables>(
    loginMutation
  );
  const [reg] = useMutation<RegMutation, RegMutationVariables>(regMutation);
  const onSubmit = handleSubmit((data) => {
    if (mode === "login") {
      login({
        variables: {
          input: { username: data.username, password: data.password },
        },
      }).then((resp) => {
        if (!resp.data?.login?.viewer.user) {
          alert("login failed");
        }
      });
    } else {
      reg({
        variables: {
          input: {
            username: data.username,
            password: data.password,
            password2: data.password2,
          },
        },
      }).then((resp) => {
        if (!resp.data?.createUser?.viewer.user) {
          alert("reg failed");
        }
      });
    }
  });
  return (
    <Form onSubmit={onSubmit}>
      <Form.Group>
        <Form.Label>Username</Form.Label>
        <Form.Control {...register("username")} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Password</Form.Label>
        <Form.Control {...register("password")} type="password" />
      </Form.Group>
      {mode === "reg" && (
        <Form.Group>
          <Form.Label>Repeat password</Form.Label>
          <Form.Control {...register("password2")} type="password" />
        </Form.Group>
      )}
      <div className="mt-3">
        <Button variant="primary" type="submit">
          Submit
        </Button>
        <Button variant="link" type="button" onClick={toggleMode}>
          {mode === "login" ? "Create user" : "Login"}
        </Button>
      </div>
    </Form>
  );
}

export default LoginPage;
