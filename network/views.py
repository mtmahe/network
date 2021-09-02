import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Follow


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
def query_posts(request):
    """ Get selected posts """

    # check usage is Post
    if request.method != "GET":
        print('not get')
        return JsonResponse({"error": "GET request required."}, status=400)

    if request.headers['authors'] == 'all':
        posts = Post.objects.all().order_by("-id")

    # Create paginated json for response
    my_posts = {}
    objects = [post.serialize() for post in posts]

    p = Paginator(objects, 10)
    my_posts['p_count'] = p.count
    my_posts['num_pages'] = p.num_pages

    # make a dictionary of each page and its variables
    pages = {}
    for i in range(p.num_pages):
        pages['{0}'.format(i+1)] = {
            'page_list': p.page(i+1).object_list,
            'has_next': p.page(i+1).has_next(),
            'has_previous': p.page(i+1).has_previous()
        }
    my_posts['pages'] = pages

    #return JsonResponse([post.serialize() for post in posts], safe=False)
    return JsonResponse(my_posts, safe=False)


def query_user_posts(request, user_pk, page_number):
    """ Get all posts by user. """

    if not page_number:
        page_number = 1

    current_page = {}

    # posts = Post.objects.all()
    posts = Post.objects.filter(user=user_pk).order_by("-id")

    # Pagination
    objects = [post.serialize() for post in posts]

    p = Paginator(objects, 10)
    current_page["pages"] = p.page(page_number).object_list
    page_list = []
    for i in range(p.num_pages):
        page_list.append(i+1)
    current_page["page_list"] = page_list
    current_page["has_next"] = p.page(page_number).has_next()
    current_page["has_previous"] = p.page(page_number).has_previous()
    current_page["num_pages"] = p.num_pages


    #return JsonResponse([post.serialize() for post in posts], safe=False)
    return JsonResponse(current_page, safe=False)


def profile(request, user):
    """ Display user profile """

    # need to update the call to user number also
    follows = Follow.objects.filter(follower = 1)
    print(f'profile: {follows}')

    objects = [follow.serialize() for follow in follows]

    return render(request, "network/profile.html", {
        "objects": objects,
    })


@csrf_exempt
def follow(request):
    """ Follow or unfollow """

    if request.method != "POST":
        print('not post')
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of post
    print('follow request')
    data = json.loads(request.body)
    user = request.user.pk
    followed = data.get("followed", "")
    followed = User.objects.get(pk=followed)
    print(f'The user is {user}, followed is {followed}')

    result = Follow.objects.filter(follower=user).filter(followed=followed)

    if not result:
        follow = Follow(
            follower=request.user,
            followed=followed
        )
        follow.save()

        return JsonResponse({"success": "user followed"})

    print('unfollowing')
    result.delete()

    return JsonResponse({"success": "user unfollowed"})


def is_following(request, followed_id):
    """ Check if user is following profile owner """

    if request.method != "GET":
        print('not get')
        return JsonResponse({"error": "GET request required."}, status=400)

    user = request.user.pk
    followed = followed_id

    result = Follow.objects.filter(follower=user).filter(followed=followed)

    if not result:
        return JsonResponse({"followed": "false"})

    return JsonResponse({"followed": "true"})


def query_following(request, user_pk):
    """ Get a list of whom the user is following """

    if request.method != "GET":
        print('not get')
        return JsonResponse({"error": "GET request required."}, status=400)

    result = Follow.objects.filter(follower=user_pk)
    follows = [follow.followed.pk for follow in result]
    follows_total = 0;
    for i in follows:
        follows_total += i
    follows_json = json.dumps(follows_total)

    return JsonResponse(follows_json, safe=False)


def query_followers(request, user_pk):
    """ Get a list of whom the user is followed by. """

    if request.method != "GET":
        print('not get')
        return JsonResponse({"error": "GET request required."}, status=400)

    result = Follow.objects.filter(followed=user_pk)
    followed = [follow.followed.pk for follow in result]
    followed_total = 0;
    for i in followed:
        followed_total += i
    followed_json = json.dumps(followed_total)

    return JsonResponse(followed_json, safe=False)


def query_name(request, user_pk):
    """ Get the username given pk """

    if request.method != "GET":
        print('not get')
        return JsonResponse({"error": "GET request required."}, status=400)

    result = User.objects.get(pk=user_pk)
    name = result.username
    body = {
        "name": name,
    }

    return JsonResponse(body)


def view_following(request):
    """ show posts for only users being followed """

    return render(request, "network/following.html")
