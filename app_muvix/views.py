import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Theater, Seat, Movie, Show

# Create your views here.
def index(request):

    return render(request, "muvix/index.html")

def fetch_movies(request, type):

    if type == "playing":
        movies = Movie.objects.filter(status=Movie.Status.PLAYING)
    elif type == "soon":
        movies = Movie.objects.filter(status=Movie.Status.SOON)
    else:
        return JsonResponse({"error": "Invalid route"}, status=400)

    return JsonResponse([movie.serialize() for movie in movies], safe=False)


def movie_view(request, movie_id):
    
    try:
        movie_data = Movie.objects.get(id=movie_id)
    except Movie.DoesNotExist:
        return HttpResponseRedirect("/")

    return render(request, "muvix/show.html", {
        "is_playing": movie_data.status == Movie.Status.PLAYING,
        "id": movie_data.id,
        "title": movie_data.title,
        "trailer": movie_data.trailer,
        "poster_url": movie_data.poster_url,
        "synopsis": movie_data.synopsis,
        "duration": movie_data.duration_min,
        "rating_avg": movie_data.rating_avg,
        "rating_count": movie_data.rating_count,
        "theater": movie_data.shows.theater,

    })


@login_required(login_url="/login")
def my_tickets(request):
    ...


@login_required(login_url="/login")
def booking(request):
    ...


@login_required(login_url="/login")
def payment(request):
    ...


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