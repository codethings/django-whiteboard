import graphene
from graphene.types import interface
from graphene_django import DjangoObjectType
import graphene_django
from graphene_django.converter import convert_choices_to_named_enum_with_descriptions
from django.contrib.auth import get_user_model

from . import models

BoardUserRole = convert_choices_to_named_enum_with_descriptions(
    "BoardUserRole", models.BoardUser.BoardUserRole.choices
)


class BoardUser(DjangoObjectType):
    class Meta:
        model = models.BoardUser
        fields = ("id", "board", "user", "role")
        interface = (graphene.relay.Node,)

    role = graphene.Field(BoardUserRole, required=True)

    @classmethod
    def get_node(cls, info, id):
        board_user = super().get_node(info, id)
        if models.Board.check_access(
            board_id=board_user.board_id, user_id=board_user.user_id
        ):
            return board_user
        return None


class Board(DjangoObjectType):
    class Meta:
        model = models.Board
        fields = ("title", "public")
        interfaces = (graphene.relay.Node,)

    board_users = graphene.List(graphene.NonNull(BoardUser), required=True)
    viewer_role = graphene.Field(BoardUserRole, required=False)

    def resolve_board_users(root, info):
        return models.BoardUser.objects.filter(board=root)

    def resolve_viewer_role(root, info):
        return (
            models.BoardUser.objects.filter(board=root, user=info.context.user)
            .values_list("role", flat=True)
            .first()
        )

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


class SetBoardPublic(graphene.ClientIDMutation):
    class Input:
        id = graphene.ID(required=True)
        value = graphene.Boolean(required=True)

    board = graphene.Field(Board, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, *, id, value):
        board = graphene.relay.Node.get_node_from_global_id(info, id, Board)
        if not models.Board.check_access(
            board_id=board.pk, user_id=info.context.user.pk, include_public=False
        ):
            return cls(board=board)
        board.public = value
        board.save(update_fields=["public"])
        return cls(board=board)


class ShareBoardByUsername(graphene.ClientIDMutation):
    class Input:
        id = graphene.ID(required=True)
        username = graphene.String(required=True)
        value = graphene.Boolean(required=True, description="True means shared")

    board = graphene.Field(Board, required=False)

    @classmethod
    def mutate_and_get_payload(cls, root, info, *, id, username, value):
        board = graphene.relay.Node.get_node_from_global_id(info, id, Board)
        if not models.Board.check_access(
            board_id=board.pk,
            user_id=info.context.user.pk,
            include_public=False,
            include_shared=False,
        ):
            return cls()
        user = get_user_model().objects.filter(username=username).first()
        if user is None:
            return cls()
        if models.BoardUser.objects.filter(
            user=user, board=board, role=models.BoardUser.BoardUserRole.owner
        ).exists():
            return cls()
        if value is True:
            models.BoardUser.objects.update_or_create(
                user=user,
                board=board,
                defaults={"role": models.BoardUser.BoardUserRole.shared},
            )
        else:
            models.BoardUser.objects.filter(user=user, board=board).delete()
        return cls(board=board)


class Mutation(graphene.ObjectType):
    create_board = CreateBoard.Field()
    set_board_public = SetBoardPublic.Field()
    share_board_by_username = ShareBoardByUsername.Field()
