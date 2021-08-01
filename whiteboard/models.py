from django.db import models
from django.db.models import Q
from django.conf import settings

# Create your models here.


class Board(models.Model):
    users = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="users", through="BoardUser"
    )
    title = models.CharField(max_length=128)
    public = models.BooleanField(default=False)

    def to_json(self):
        return {"objects": [obj.to_json() for obj in self.board_objects.all()]}

    @classmethod
    def check_access(
        cls, *, board_id, user_id, include_public=True, include_shared=True
    ):
        conditions = Q(users=user_id)
        if include_public:
            conditions |= Q(public=True)
        if not include_shared:
            conditions = conditions & Q(boarduser__role=BoardUser.BoardUserRole.owner)
        return cls.objects.filter(conditions).filter(pk=board_id).exists()

    def has_access(self, user):
        return Board.check_access(board_id=self.pk, user_id=user.id)


class BoardUser(models.Model):
    class BoardUserRole(models.TextChoices):
        owner = "owner"
        shared = "shared"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    board = models.ForeignKey(Board, on_delete=models.CASCADE)
    role = models.CharField(max_length=12, choices=BoardUserRole.choices)


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
