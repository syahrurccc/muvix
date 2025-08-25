from decimal import Decimal
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

# Create your models here.
class User(AbstractUser):
    watchlist = models.ManyToManyField("Movie", related_name="watchlist", blank=True)


class Theater(models.Model):
    name = models.CharField(max_length=12)
    rows = models.IntegerField()
    cols = models.IntegerField()
    seat_map_json = models.JSONField(default=dict)


class Seat(models.Model):
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE, related_name="seat")
    label = models.CharField(max_length=3)
    row = models.CharField(max_length=1)
    col = models.IntegerField()


class Movie(models.Model):

    class Status(models.TextChoices):
        PLAYING = "Now Playing"
        SOON = "Coming Soon"

    title = models.CharField(max_length=128)
    poster_url = models.URLField()
    synopsis = models.TextField()
    trailer = models.URLField(blank=True)
    duration_min = models.IntegerField()
    rating_avg = models.DecimalField(default=Decimal(0.00), max_digits=3, decimal_places=2, editable=False)
    rating_count = models.PositiveIntegerField(default=0, editable=False)
    status = models.CharField(max_length=12, choices=Status.choices)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "trailer": self.trailer,
            "poster_url": self.poster_url,
            "synopsis": self.synopsis,
            "duration": self.duration_min,
            "rating_avg": self.rating_avg,
            "rating_count": self.rating_count
        }


class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ratings")
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="ratings")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "movie"], name="unique_review")]


class Show(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE)
    starts_at = models.DateTimeField()
    price = models.DecimalField(max_digits=5, decimal_places=2)


class Reservation(models.Model):

    class Status(models.TextChoices):
        HOLD = "HOLD"
        CONFIRMED = "CONFIRMED"

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    show = models.ForeignKey(Show, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=Status.choices)
    hold_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ReservedSeat(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name="seats")
    show = models.ForeignKey(Show, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["show", "seat"], name="unique_seat")] 


