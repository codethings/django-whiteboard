import json
from asyncio import sleep

from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.http.response import HttpResponse, JsonResponse
from django.shortcuts import render


from utils.decorators import expect_json_and_session_id

from .models import Board, BoardObject
from .consumer import BoardConsumer


@expect_json_and_session_id
async def add_board_object(request):
    channel_layer = get_channel_layer()
    payload = request.payload
    board_id = payload["boardId"]
    object_data = payload["objectData"]
    await sleep(1)
    await database_sync_to_async(BoardObject.from_json)(board_id, object_data)
    await channel_layer.group_send(
        BoardConsumer.get_group_name(board_id),
        {
            "type": "broadcast.changes",
            "content": {"type": "ADD_OBJECT", "data": {"object": object_data}},
            "session_id": request.session_id,
        },
    )
    return JsonResponse({"ok": True})
