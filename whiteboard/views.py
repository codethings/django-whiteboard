import json
from asyncio import sleep

from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.http.response import HttpResponse, HttpResponseForbidden, JsonResponse
from django.shortcuts import render
from django.db import transaction


from utils.decorators import expect_json_and_session_id

from .models import Board, BoardObject, BoardUser
from .consumer import BoardConsumer


def check_board_access(view_func):
    async def wrapper(request, *args, **kwargs):
        user = request.user
        payload = request.payload
        board_id = payload["boardId"]
        has_access = await database_sync_to_async(
            lambda: Board.check_access(board_id=board_id, user_id=user.pk)
        )()
        if not has_access:
            return HttpResponseForbidden()
        return await view_func(request, *args, **kwargs)

    return wrapper


@expect_json_and_session_id
@check_board_access
async def add_board_object(request):
    channel_layer = get_channel_layer()
    payload = request.payload
    board_id = payload["boardId"]
    object_data = payload["objectData"]
    board_obj = await database_sync_to_async(BoardObject.from_json)(
        board_id, object_data
    )
    object_data["id"] = str(board_obj.pk)
    await channel_layer.group_send(
        BoardConsumer.get_group_name(board_id),
        {
            "type": "broadcast.changes",
            "content": {"type": "ADD_OBJECT", "data": {"object": object_data}},
            "session_id": request.session_id,
        },
    )
    return JsonResponse({"id": str(board_obj.pk)})


@expect_json_and_session_id
@check_board_access
async def set_objects_attrs(request):
    channel_layer = get_channel_layer()
    payload = request.payload
    board_id = payload["boardId"]
    objects_attrs = payload["objectsAttrs"]
    # [[id, attrs], [id, attrs]]
    attrs_by_id = {}
    for board_obj_id, attrs in objects_attrs:
        attrs_by_id.setdefault(board_obj_id, {}).update(attrs)
    await database_sync_to_async(save_objects_attrs)(board_id, attrs_by_id)
    await channel_layer.group_send(
        BoardConsumer.get_group_name(board_id),
        {
            "type": "broadcast.changes",
            "content": {
                "type": "SET_OBJECTS_ATTRS",
                "data": {"objectsAttrs": attrs_by_id},
            },
            "session_id": request.session_id,
        },
    )
    return JsonResponse({"ok": True})


@expect_json_and_session_id
@check_board_access
async def remove_objects(request):
    channel_layer = get_channel_layer()
    payload = request.payload
    board_id = payload["boardId"]
    removed_object_ids = payload.get("removedObjectIds", [])
    await database_sync_to_async(delete_objects_by_id)(board_id, removed_object_ids)
    await channel_layer.group_send(
        BoardConsumer.get_group_name(board_id),
        {
            "type": "broadcast.changes",
            "content": {
                "type": "REMOVE_OBJECTS",
                "data": {"removedObjectIds": removed_object_ids},
            },
            "session_id": request.session_id,
        },
    )
    return JsonResponse({"ok": True})


@transaction.atomic()
def save_objects_attrs(board_id, attrs_by_id):
    board = Board.objects.get(pk=board_id)
    board_objs_to_update = board.board_objects.filter(
        id__in=attrs_by_id.keys()
    ).select_for_update()
    for obj in board_objs_to_update:
        obj.data.update(attrs_by_id[str(obj.pk)])
        obj.save(update_fields=["data"])


@transaction.atomic()
def delete_objects_by_id(board_id, object_ids):
    BoardObject.objects.filter(board_id=board_id, id__in=object_ids).delete()
