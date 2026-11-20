from django.urls import path
from .views import RegisterView, LoginView, LogoutView, PlayerProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Refresh-View
    path('api/token/', TokenObtainPairView.as_view(), name='token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),

    # Хорошая практика — добавлять api/v1/, чтобы разделять версии API
    path('api/v1/registration/', RegisterView.as_view(), name='register'),
    path('api/v1/login/', LoginView.as_view(), name='login'),
    path('api/v1/logout/', LogoutView.as_view(), name='logout'),

    # Профиль игрока (Один путь для разных действий!)
    path('api/v1/players/me/', PlayerProfileView.as_view(), name='player-profile'),
]