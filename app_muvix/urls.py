from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="homepage"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("tickets", views.my_tickets, name="tickets"),
    path("movies/<int:movie_id>", views.movie_view, name="movie"),

    # API paths
    path("movies/<str:type>", views.fetch_movies, name="fetch_movies")
]