
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts", views.compose, name="compose"),
    path("posts/compose", views.compose, name="alt-compose"),
    path("posts/all", views.query_posts, name="query_posts"),
    path("posts/all/<int:page_number>", views.query_posts, name="query_posts_paginated"),
    path("profile/<int:user>", views.profile, name="query_profile"),
]
