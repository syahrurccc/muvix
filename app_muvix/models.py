from django.contrib.auth.models import AbstractUser
from django.core import signing
from django.db import models

# Create your models here.
class User(AbstractUser):
    pass


class Theater(models.Model):
    name = models.CharField(max_length=12)
    seat_map = models.TextField()


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
    poster_url = models.URLField(blank=True)
    director = models.CharField(max_length=128, blank=True)
    stars = models.CharField(max_length=128, blank=True)
    genre = models.CharField(max_length=128, blank=True)
    synopsis = models.TextField(blank=True)
    trailer = models.URLField(blank=True)
    duration_min = models.CharField(default="TBA", blank=True)
    status = models.CharField(max_length=12, choices=Status.choices)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "director": self.director,
            "stars": self.stars,
            "genre": self.genre,
            "trailer": self.trailer,
            "poster_url": self.poster_url,
            "synopsis": self.synopsis,
            "duration": self.duration_min,
        }


class Show(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="shows")
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE, related_name="shows")
    date = models.DateField(null=True)
    starts_at = models.TimeField(null=True)
    price = models.DecimalField(max_digits=7, decimal_places=2)
    fee = models.DecimalField(max_digits=7, decimal_places=2)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.movie.title,
            "poster_url": self.movie.poster_url,
            "theater": self.theater.name,
            "date": self.date,
            "starts_at": self.starts_at.strftime("%H:%M"),
            "price": self.price,
            "fee": self.fee
        }


class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reservations")
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name="reservations")
    created_at = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "show": self.show.serialize(),
            "seats": [rs.seat.label for rs in self.reserved_seats.all()],
            "ticket_code": signing.dumps({"id": self.id})
        }


class ReservedSeat(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name="reserved_seats")
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name="reserved_seats")
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)

    # Limit each seat to belong to a show
    class Meta:
        constraints = [models.UniqueConstraint(fields=["show", "seat"], name="unique_seat")] 


