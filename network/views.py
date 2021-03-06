import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Follow, Like


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


@login_required
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


@login_required
def edit_post(request):
    """ Edit a new post """

    if request.method != "POST":
        print('not post')
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of post
    print('post request')
    data = json.loads(request.body)
    body = data.get("body", "")
    print(f'The body is {body}')
    post_id = request.headers['post-id']
    print(f'post id {post_id}')

    # Make sure they own the post
    user = request.user
    current = Post.objects.get(id=post_id)
    print(user, current.user)
    if user != current.user:
        return JsonResponse({"message": "You may only edit your own posts."}, status=400)


    # Create new post
    post = Post.objects.get(pk=post_id)
    post.body = body
    post.save()

    return JsonResponse({"message": "Post edited successfully."}, status=201)


@csrf_exempt
def query_posts(request):
    """ Get selected posts """

    # check usage is Post
    if request.method != "GET":
        print('not get')
        return JsonResponse({"error": "GET request required."}, status=400)

    if request.headers['authors'] == 'all_posts':
        posts = Post.objects.all().order_by("-id")
    elif request.headers['authors']  == 'following':
        follows = query_following_raw(request.user.pk)
        posts = Post.objects.filter(user__in=follows).order_by("-id")
        # retrieve posts where user is in current users followed list.
    else:
        author_list = [int(author) for author in request.headers['authors'].split(",")]
        posts = Post.objects.filter(user_id__in=author_list).order_by('-id')

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
    #my_posts['user'] = request.user

    #return JsonResponse([post.serialize() for post in posts], safe=False)
    return JsonResponse(my_posts, safe=False)


def query_following_raw(user):
    """ return a list of whom the user is following, used by query_posts """

    result = Follow.objects.filter(follower=user)

    follows = [follow.followed.pk for follow in result]

    return follows


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


def profile(request, owner_pk):
    """ Display user profile """

    # need to update the call to user number also
    follows = Follow.objects.filter(follower = 1)

    objects = [follow.serialize() for follow in follows]

    return render(request, "network/profile.html", {
        "objects": objects,
    })


@login_required
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


def is_liked(request, liked_id):
    """ Check if user liked post """

    if request.method != "GET":
        print('not get')
        return JsonResponse({"error": "GET request required."}, status=400)

    user = request.user
    liked = liked_id

    result = Like.objects.filter(user=user).filter(liked=liked)

    if not result:
        return JsonResponse({"liked": "false"})

    return JsonResponse({"liked": "true"})


def query_following(request, user_pk):
    """ Get a list of whom the user is following """

    if request.method != "GET":
        print('not get')
        return JsonResponse({"error": "GET request required."}, status=400)

    result = Follow.objects.filter(follower=user_pk)
    follows = [follow.followed.pk for follow in result]
    follows_total = {
        'following_list': follows,
    }
    #follows_json = json.dumps(follows_total)

    return JsonResponse(follows_total, safe=False)


def query_followers(request, user_pk):
    """ Get a list of whom the user is followed by. """

    if request.method != "GET":
        print('not get')
        return JsonResponse({"error": "GET request required."}, status=400)

    result = Follow.objects.filter(followed=user_pk)
    following = [follow.follower.pk for follow in result]
    following_total = []
    for i in following:
        following_total.append(i)
    #followed_json = json.dumps(followed_total)
    following_json = {
        'following_total': following_total,
    }

    return JsonResponse(following_json, safe=False)


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


@login_required
def like(request, post_id):
    """ like or unlike """

    if request.method != "POST":
        print('not post')
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of post
    print('like request')
    user = request.user.pk
    liked = Post.objects.get(pk=post_id)
    result = Like.objects.filter(user=user).filter(liked=liked)

    if not result:
        like = Like(
            user=request.user,
            liked=liked
        )
        like.save()

        return JsonResponse({"message": "like added"})

    print('remove like')
    result.delete()

    return JsonResponse({"message": "like removed"})


def query_likes(request, post_id):
    """ Get a count of likes for post """

    if request.method != "GET":
        print('not get')
        return JsonResponse({"error": "GET request required."}, status=400)

    result = Like.objects.filter(liked=post_id)
    print(f'result {result}')
    if result:
        total_likes = len(result)
    else:
        total_likes = 0
    likes_json = {
        'total_likes': total_likes,
    }
    #likes_json = json.dumps(likes_json)

    return JsonResponse(likes_json, safe=False)
