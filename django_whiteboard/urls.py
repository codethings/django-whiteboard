"""django_whiteboard URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from graphene_django.views import GraphQLView

from whiteboard.views import add_board_object, set_objects_attrs, remove_objects
from .graphql_view import graphql_view


def app_view(request, *args, **kwargs):
    from django.shortcuts import render

    return render(request, "index.html")


def logout_view(request):
    from django.http import HttpResponseRedirect
    from django.contrib.auth import logout

    logout(request)
    return HttpResponseRedirect("/")


urlpatterns = [
    path("", app_view),
    path("b/<int:id>", app_view),
    path("add-object", add_board_object),
    path("set-objects-attrs", set_objects_attrs),
    path("remove-objects", remove_objects),
    path("logout", logout_view),
    path("admin/", admin.site.urls),
]

urlpatterns += [
    path("graphql", graphql_view),
]

urlpatterns += [
    path("board/<str:board_id>", app_view),
    path("auth", app_view)
]
