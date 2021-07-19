import graphene
from graphene_django import DjangoObjectType

from identity import schema as identity_schema
from whiteboard import schema as whiteboard_schema


class Viewer(whiteboard_schema.Query, graphene.ObjectType):

    id = graphene.String(required=True)
    user = graphene.Field(identity_schema.User)

    def resolve_id(root, _info):
        return "viewer"

    def resolve_user(root, info):
        if info.context.user.is_authenticated:
            return info.context.user


class Query(graphene.ObjectType):
    viewer = graphene.Field(Viewer)

    def resolve_viewer(self, info):
        return Viewer()


class Mutation(
    identity_schema.Mutation, whiteboard_schema.Mutation, graphene.ObjectType
):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
