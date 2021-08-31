
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts/compose", views.compose, name="compose"),
    path("posts/all", views.query_posts, name="query_posts"),
    path("posts/all/<int:page_number>", views.query_posts, name="query_posts_paginated"),
    path("profile/<int:user>", views.profile, name="query_profile"),
    path("profile/follow", views.follow, name="follow"),
    path("profile/isfollowing/<int:followed_id>", views.is_following, name="query_following"),
    path("profile/follows/<int:user_pk>", views.query_following, name="following"),
    path("profile/followers/<int:user_pk>", views.query_followers, name="followers"),
    path("profile/name/<int:user_pk>", views.query_name, name="get_name"),
]
