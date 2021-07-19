import { gql, useMutation, useQuery } from "@apollo/client";
import React from "react";
import { Button, Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import {
  CreateBoardMutation,
  CreateBoardMutationVariables,
} from "../../__generated__/CreateBoardMutation";
import {
  UserDashboardQuery,
  UserDashboardQuery_viewer_boards,
} from "../../__generated__/UserDashboardQuery";

const userDashboardQuery = gql`
  query UserDashboardQuery {
    viewer {
      id
      boards {
        title
        id
      }
    }
  }
`;

const createBoardMutation = gql`
  mutation CreateBoardMutation($input: CreateBoardInput!) {
    createBoard(input: $input) {
      board {
        id
      }
    }
  }
`;

function BoardItem({ board }: { board: UserDashboardQuery_viewer_boards }) {
  const history = useHistory();
  const onClick = React.useCallback(() => {
    history.push("/board/" + board.id);
  }, [history]);
  return (
    <div className="board-item" key={board.id} onClick={onClick}>
      {board.title}
    </div>
  );
}

function UserDashboard() {
  const [createBoard] = useMutation<
    CreateBoardMutation,
    CreateBoardMutationVariables
  >(createBoardMutation);
  const history = useHistory();
  const onCreateBoard = React.useCallback(() => {
    const title = window.prompt("Title: ")
    createBoard({variables: {input: {title}}}).then((resp) => {
      if (resp.data?.createBoard?.board) {
        const id = resp.data.createBoard.board.id;
        history.push(`/board/${id}`);
      } else {
        throw new Error("no board");
      }
    }).catch(console.error)
  }, [createBoard, history])
  const { data, loading } = useQuery<UserDashboardQuery>(userDashboardQuery);
  if (loading) return "loading...";
  if (!data?.viewer?.boards.length) {
    return (
      <Container>
        <Button onClick={onCreateBoard}>Create new board</Button>
      </Container>
    );
  }
  return (
    <Container>
      <div className="board-grid">
        {data.viewer.boards.map((board) => {
          return <BoardItem board={board} key={board.id} />;
        })}
      </div>
    </Container>
  );
}

export default UserDashboard;
