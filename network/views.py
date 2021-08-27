import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from django.views.decorators.csrf import csrf_exempt

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def compose(request):
    """ Compose a new post """

    if request.method != "POST":
        print('not post')
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of post
    print('post request')
    data = json.loads(request.body)
    body = data.get("body", "")
    print(f'The body is {body}')

    # Create new post
    post = Post(
        user=request.user,
        body=body,
    )
    post.save()

    return JsonResponse({"message": "Post added successfully."}, status=201)


@csrf_exempt
def query_posts(request, page_number):
    """ Get all posts """

    if not page_number:
        page_number = 1

    current_page = {}

    # posts = Post.objects.all()
    posts = Post.objects.all().order_by("-id")

    # Pagination
    objects = [post.serialize() for post in posts]

    p = Paginator(objects, 10)
    print(f'page number is {page_number}')
    current_page["pages"] = p.page(page_number).object_list
    page_list = []
    for i in range(p.num_pages):
        page_list.append(i+1)
    current_page["page_list"] = page_list
    print(page_list)
    current_page["has_next"] = p.page(page_number).has_next()
    current_page["has_previous"] = p.page(page_number).has_previous()
    current_page["num_pages"] = p.num_pages


    #return JsonResponse([post.serialize() for post in posts], safe=False)
    return JsonResponse(current_page, safe=False)
