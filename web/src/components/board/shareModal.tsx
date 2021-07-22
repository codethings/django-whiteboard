import { gql, useMutation } from "@apollo/client";
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import {
  SetBoardPublicMutation,
  SetBoardPublicMutationVariables,
} from "../../__generated__/SetBoardPublicMutation";

type Props = {
  board: { id: string; title: string; public: boolean };
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
          <div>
            <h6>Share with user</h6>
            <Form.Control placeholder="share with username" />
          </div>
        </Modal.Body>
      </>
    </Modal>
  );
}

export default ShareBoardModal;
