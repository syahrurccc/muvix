from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="homepage"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("movies/<int:movie_id>", views.movie_view, name="movie"),

    # API paths
    path("api/tickets", views.my_tickets, name="tickets"),
    path("api/movies/<int:movie_id>", views.movie_api, name="movie_api"),
    path("api/movies/<str:type>", views.fetch_movies, name="fetch_movies"),
    path("shows/<int:movie_id>", views.fetch_shows, name="fetch_shows"),
    path("shows/<int:show_id>/seats", views.render_seats, name="render_seats"),
    path("shows/<int:show_id>/details", views.show_details, name="show_details"),
    path("shows/<int:show_id>/reserve", views.reserve_seats, name="reserve_seats"),
]