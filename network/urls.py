
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("view/following", views.view_following, name="view_following"),
    path("profile/<int:owner_pk>", views.profile, name="profile"),

    # API Routes
    path("posts/compose", views.compose, name="compose"),
    path("posts", views.query_posts, name="query_posts"),
    path("posts/edit", views.edit_post, name="edit_post"),
    path("profile/like/<int:post_id>", views.like, name="like"),
    path("profile/like_count/<int:post_id>", views.query_likes, name="like_count"),


    #path("posts/all/<int:page_number>", views.query_posts, name="query_posts_paginated"),
    path("posts/<int:user_pk>", views.query_user_posts, name="query_user_posts"),
    path("posts/<int:user_pk>/<int:page_number>", views.query_user_posts, name="query_user_posts_paginated"),
    path("profile/<int:user>", views.profile, name="query_profile"),
    path("profile/follow", views.follow, name="follow"),
    path("profile/isfollowing/<int:followed_id>", views.is_following, name="query_following"),
    path("profile/isLiked/<int:liked_id>", views.is_liked, name="query_liked"),
    path("profile/follows/<int:user_pk>", views.query_following, name="following"),
    path("profile/followers/<int:user_pk>", views.query_followers, name="followers"),
    path("profile/name/<int:user_pk>", views.query_name, name="get_name"),
]
