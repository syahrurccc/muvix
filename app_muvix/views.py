import json
from datetime import date, datetime
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError, transaction
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from luhnchecker.luhn import Luhn

from .models import User, Seat, Movie, Show, Reservation, ReservedSeat


def valid_expiry(expiry_date):

    date = expiry_date.split("/")
    print(date)
    try:
        month = int(date[0])
        year = int(date[1])

        now = datetime.now()
        print(now.month)

        if year < now.year:
            return False
        elif year == now.year and month < now.month:
            return False
        
        return True

    except (ValueError, TypeError):
        return False


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

    return render(request, "muvix/show.html", {"movie": movie_id})


def movie_api(request, movie_id):
    
    try:
        movie = Movie.objects.get(id=movie_id)
    except Movie.DoesNotExist:
        return HttpResponseRedirect("/")

    return JsonResponse({
        "is_playing": movie.status == Movie.Status.PLAYING,
        "movie_data": movie.serialize(),
    })


def fetch_shows(request, movie_id):

    try:
        movie = Movie.objects.get(id=movie_id)
    except Movie.DoesNotExist:
        return HttpResponseRedirect("/")
    
    if date_str := request.GET.get("date"):
        try:
            date_obj = date.fromisoformat(date_str)
        except ValueError:
            return JsonResponse ({"error: Invalid date format"}, status=400)
    
    shows = movie.shows.filter(date=date_obj).select_related("theater").order_by("starts_at")

    return JsonResponse([show.serialize() for show in shows], safe=False)


@login_required(login_url="/login")
def render_seats(request, show_id):
    
    try:
        show = Show.objects.get(id=show_id)
        seat_map = json.loads(show.theater.seat_map)
        seat_ids = list(show.theater.seat.values_list("id", flat=True))
        reserved_ids = list(ReservedSeat.objects.filter(show_id=show_id).values_list("seat_id", flat=True))
    except Show.DoesNotExist:
        return HttpResponseRedirect("/")

    return JsonResponse({
        "seatMap": seat_map, 
        "seatIds": seat_ids,
        "reservedIds": reserved_ids
        })


@login_required(login_url="/login")
def show_details(request, show_id):
    
    try:
        show = Show.objects.get(id=show_id)
    except Show.DoesNotExist:
        return HttpResponseRedirect("/")
    
    return JsonResponse(show.serialize())


@csrf_exempt
@login_required(login_url="/login")
def reserve_seats(request, show_id):
    
    if request.method != "POST":
         return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)

    card_number = data.get("cardNumber")
    expiry_date = data.get("expiryDate")
    cvv = data.get("cvv")
    name = data.get("cardholderName")
    seat_ids = data.get("seatIds")

    if not (card_number and expiry_date and cvv and name):
        return JsonResponse({"error": "One or more required fields are empty."}, status=400)
    elif not seat_ids:
        return JsonResponse({"error": "How do you get to this point?"}, status=400)
    
    if not Luhn.check_luhn(card_number):
        return JsonResponse({"error": "Invalid card number"}, status=400)
    if not valid_expiry(expiry_date):
        return JsonResponse({"error": "Expired card"}, status=400)
    
    try:
        show = Show.objects.get(id=show_id)
        seats = list(Seat.objects.filter(id__in=seat_ids))
    except (Show.DoesNotExist, Seat.DoesNotExist):
        return JsonResponse({"error": "Huh?"}, status=400)
    
    with transaction.atomic():
        reservation = Reservation.objects.create(user=request.user, show=show)
        
        rs = [ReservedSeat(reservation=reservation, show=show, seat=seat) for seat in seats]
        try:
            ReservedSeat.objects.bulk_create(rs)
        except IntegrityError:
            transaction.set_rollback(True)
            return JsonResponse({"error": "Unable to book seats, please try again"}, status=400)

    return JsonResponse({"message": "Successfully book seats, you will be redirected in a moment."}, status=200)


@login_required(login_url="/login")
def my_tickets(request):
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