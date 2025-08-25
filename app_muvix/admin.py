from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Theater, Seat, Movie, Rating, Show, Reservation, ReservedSeat

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Theater)
admin.site.register(Seat)
admin.site.register(Movie)
admin.site.register(Rating)
admin.site.register(Show)
admin.site.register(Reservation)
admin.site.register(ReservedSeat)