import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import login, authenticate

from .models import User as UserModel


class User(DjangoObjectType):
    class Meta:
        model = UserModel
        fields = ("id", "username")
        interfaces = (graphene.relay.Node,)


class Login(graphene.ClientIDMutation):
    class Input:
        username = graphene.String(require=True)
        password = graphene.String(require=True)

    viewer = graphene.Field("django_whiteboard.schema.Viewer", required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, *, username, password):
        user = authenticate(info.context, username=username, password=password)
        if user is not None:
            login(info.context, user)
        return cls(viewer=1)


class CreateUser(graphene.ClientIDMutation):
    class Input:
        username = graphene.String(require=True)
        password = graphene.String(require=True)
        password2 = graphene.String(require=True)

    viewer = graphene.Field("django_whiteboard.schema.Viewer", required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, *, username, password, password2):

        if password != password2:
            return cls(viewer=1)
        try:
            user = UserModel.objects.create_user(username=username, password=password)
        except:
            return cls(viewer=1)
        else:
            login(info.context, user)
            return cls(viewer=1)


class Mutation(graphene.ObjectType):
    login = Login.Field()
    create_user = CreateUser.Field()
