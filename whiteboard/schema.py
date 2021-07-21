import graphene
from graphene_django import DjangoObjectType

from . import models


class Board(DjangoObjectType):
    class Meta:
        model = models.Board
        fields = ("title",)
        interfaces = (graphene.relay.Node,)

    @classmethod
    def get_node(cls, info, id):
        board = super().get_node(info, id)
        if board.has_access(info.context.user):
            return board
        return None


class Query(graphene.ObjectType):
    boards = graphene.List(graphene.NonNull(Board), required=True)

    def resolve_boards(root, info):
        user = info.context.user
        if not user.is_authenticated:
            return models.Board.objects.none()
        qs = models.Board.objects.filter(users=user).all()
        return qs


class CreateBoard(graphene.ClientIDMutation):
    class Input:
        title = graphene.String(required=True)

    board = graphene.Field(Board)

    @classmethod
    def mutate_and_get_payload(cls, root, info, *, title):
        user = info.context.user
        if not user.is_authenticated:
            return cls()
        board = models.Board.objects.create(title=title)
        board.users.add(user)
        return cls(board=board)

class Mutation(graphene.ObjectType):
    create_board = CreateBoard.Field()