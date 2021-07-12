from django.db import models

# Create your models here.


class Board(models.Model):
    def to_json(self):
        return {"objects": [obj.to_json() for obj in self.board_objects.all()]}


class BoardObject(models.Model):
    class BoardObjectType(models.TextChoices):
        path = "path"

    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name="board_objects"
    )
    type = models.CharField(choices=BoardObjectType.choices, max_length=16)
    data = models.JSONField(default=dict)

    def to_json(self):
        type = str(self.type)
        return {"type": type, **self.data, "id": str(self.pk)}

    @classmethod
    def from_json(cls, board_id, object_data):
        object_data = {**object_data}
        board = cls(
            board_id=board_id,
            type=object_data.pop("type"),
            data=object_data,
        )
        board.save()
        return board
