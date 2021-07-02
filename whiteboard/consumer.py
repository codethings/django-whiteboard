from urllib.parse import parse_qsl
from .models import Board, BoardObject

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class BoardConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        self.board_id = self.scope["url_route"]["kwargs"]["board_id"]
        self.session_id = dict(parse_qsl(self.scope["query_string"].decode()))["sessionId"]
        await self.accept()
        await self.send_initial_data()
        await self.channel_layer.group_add(self.group_name, self.channel_name)

    @staticmethod
    def get_group_name(board_id):
        return f"board-{board_id}"

    @property
    def group_name(self):
        if not self.board_id:
            raise ValueError("No board id")
        return self.get_group_name(self.board_id)

    async def send_initial_data(self):
        payload = await self.get_board_data()
        return await self.send_json({"type": "INITIAL_DATA", "data": payload})

    @database_sync_to_async
    def get_board_data(self):
        board = Board.objects.get(pk=self.board_id)
        payload = board.to_json()
        return payload

    @database_sync_to_async
    def add_object(self, object_data):
        obj = BoardObject.from_json(self.board_id, object_data)
        obj.save()

    async def receive_json(self, content, **kwargs):
        message_type = content.get("type")
        # if message_type == "ADD_OBJECT":
            # object_data = content["data"]["object"]
            # await self.add_object(object_data)
            # await self.send_json({"ok": True})
            # await self.channel_layer.group_send(self.group_name, {
            #     "type": "broadcast.changes",
            #     "content": content,
            #     "session_id": self.session_id
            # })

    async def broadcast_changes(self, event):
        if (event.get("session_id") == self.session_id):
            return
        await self.send_json(event["content"])
