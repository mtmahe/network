from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "owner": self.user.username,
            "owner_pk": self.user.pk,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following_user")
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following_followed")

    def __str__(self):
        return f"{self.follower.username} is following {self.followed.username}."


class Like(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="like_user")
    liked = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="liked_post")

    def __str__(self):
        return f"{self.user.username} liked post {self.liked.id}."
