import { gql, useMutation } from "@apollo/client";
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import {
  SetBoardPublicMutation,
  SetBoardPublicMutationVariables,
} from "../../__generated__/SetBoardPublicMutation";
import {
  ShareBoardByUsernameMutation,
  ShareBoardByUsernameMutationVariables,
} from "../../__generated__/ShareBoardByUsernameMutation";
import { BoardQuery_board_Board } from "../../__generated__/BoardQuery";
import { BoardUserRole } from "../../__generated__/globalTypes";

type Props = {
  board: BoardQuery_board_Board;
  open: boolean;
  onHide: () => void;
};

const setBoardPublicMutation = gql`
  mutation SetBoardPublicMutation($input: SetBoardPublicInput!) {
    setBoardPublic(input: $input) {
      board {
        id
        title
        public
      }
    }
  }
`;

const shareBoardByUsernameMutation = gql`
  mutation ShareBoardByUsernameMutation($input: ShareBoardByUsernameInput!) {
    shareBoardByUsername(input: $input) {
      board {
        id
        boardUsers {
          user {
            username
          }
          role
        }
      }
    }
  }
`;

function ShareWithUser({ board }: Pick<Props, "board">) {
  const { register, handleSubmit } = useForm<{ username: string }>();
  const [shareBoardByUserName] = useMutation<
    ShareBoardByUsernameMutation,
    ShareBoardByUsernameMutationVariables
  >(shareBoardByUsernameMutation);
  const onSubmit = React.useCallback(
    (data) => {
      const { username } = data;
      shareBoardByUserName({
        variables: { input: { id: board.id, username, value: true } },
      }).then((res) => {
        console.log(res);
      });
    },
    [board.id, shareBoardByUserName]
  );
  const onRemoveUser = React.useCallback(
    (username) => () => {
      shareBoardByUserName({
        variables: { input: { id: board.id, username, value: false } },
      }).then((res) => {
        console.log(res);
      });
    },
    [board.id, shareBoardByUserName]
  );
  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>
            <h6>Share with user</h6>
          </Form.Label>
        </Form.Group>
        <Form.Control
          placeholder="Share with username"
          autoComplete="off"
          {...register("username")}
        />
        <Button type="submit" size="sm" className="mt-2">
          Share
        </Button>
      </Form>
      <hr />
      <h6>Users with access:</h6>
      <div>
        {board.boardUsers.map((bu) => {
          return (
            <div key={bu.id}>
              {bu.user.username} - {bu.role}
              {bu.role === BoardUserRole.SHARED && (
                <Button variant="link" onClick={onRemoveUser(bu.user.username)}>
                  Remove
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function ShareBoardModal({ board, open, onHide }: Props) {
  const [setBoardPublic] = useMutation<
    SetBoardPublicMutation,
    SetBoardPublicMutationVariables
  >(setBoardPublicMutation);
  const setBoardPublicCb = React.useCallback(
    (value: boolean) => {
      setBoardPublic({ variables: { input: { id: board.id, value } } });
    },
    [setBoardPublic]
  );
  const setBoardPublicCbs = React.useMemo(() => {
    return [() => setBoardPublicCb(true), () => setBoardPublicCb(false)];
  }, [setBoardPublicCb]);
  return (
    <Modal show={open} onHide={onHide}>
      <>
        <Modal.Header closeButton>Share {board.title}</Modal.Header>
        <Modal.Body>
          <div>
            <h6>Share with everyone</h6>
            <Button
              size="sm"
              onClick={
                board.public ? setBoardPublicCbs[1] : setBoardPublicCbs[0]
              }
            >
              {board.public ? "Make private" : "Make public"}
            </Button>
          </div>
          <hr />
          <ShareWithUser board={board} />
        </Modal.Body>
      </>
    </Modal>
  );
}

export default ShareBoardModal;
