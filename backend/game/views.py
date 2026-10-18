from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Player
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import PlayerSerializer
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, password_validation
from django.contrib.auth import logout
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404

from .serializers import RegisterSerializer


# <---------->_APIView_<---------->
# Вместо кучу условия типа if request.method == 'POST', внутри APIView ты просто 
# создаешь функции с названиями методов: def post(self, request): или 
# def get(self, request):. Django сам поймет, какую функцию запустить, когда прилетит fetch.

# Когда фронтенд отправляет JSON-строку через fetch, APIView автоматически парсит её.

# Окутывает ответ в красивую обертку (Response): Когда твоя функция возвращает Response({'token': ...}), 
# APIView превращает этот питоновский словарь обратно в JSON-строку, добавляет правильные технические 
# заголовки и отправляет этот ответ назад в браузер
# <---------->_APIView_<---------->


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Достаем токен из куки с именем 'access' вместо заголовка
        raw_token = request.COOKIES.get('access')
        if not raw_token:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
    

class RegisterView(APIView):
    permission_classes = [AllowAny] # Пускаем всех без токена

    def post(self, request):
        # ШАГ 1: Передаем сырые данные (request.data) в сериализатор.
        # На этом этапе код просто загрузил JSON в память сериализатора, но еще ничего не проверял.
        serializer = RegisterSerializer(data=request.data)

        # ШАГ 2: Запускаем валидацию.
        # Внутри этой строки DRF берет присланные данные и прогоняет их через:
        # - Проверку типов (строка/число)
        # - Проверку длины (наш min_length=8)
        # - Метод validate_email(), который мы написали руками
        # - Внутренние проверки Django на уникальность username в БД.
        if serializer.is_valid():
            
            # ШАГ 3: Сохранение (Вся магия сокращения здесь!)
            # Раз данные валидны, мы пишем .save(). 
            # Под капотом .save() вызывает метод create(), который мы описали в сериализаторе.
            # Туда передаются чистые данные, создается юзер в БД, и возвращается нам в переменную `user`.
            user = serializer.save()
            Player.objects.create(user=user) # Создаём аккаунт

            # ШАГ 4: Выпуск токенов и упаковка в куки (как мы хотели)
            refresh = RefreshToken.for_user(user)
            
            response = Response({
                "message": "Регистрация успешна!",
                "user": {
                    "username": user.username,
                    "email": user.email
                }
            }, status=status.HTTP_201_CREATED)

            # Устанавливаем куки в ответ
            # Устанавливаем куки в ответ (ИСПРАВЛЕНО для работы cross-site)
            response.set_cookie(key='access', value=str(refresh.access_token), httponly=True, samesite='None', secure=True)
            response.set_cookie(key='refresh', value=str(refresh), httponly=True, samesite='None', secure=True)


            return response

        # ШАГ 5: Обработка ошибок.
        # Если `serializer.is_valid()` вернул False, мы не упадем с ошибкой сервера (500).
        # В переменной `serializer.errors` уже лежит готовый словарь со всеми косяками.
        # Например: {"password": ["Пароль слишком короткий..."], "email": ["Пользователь с этим email уже..."]}
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Заполните все поля!'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_obj = User.objects.get(email=email) # Нашли пользователя по почте чтобы узнать его данные

            real_username = user_obj.username # А теперь находим настоящее его имя что бы аунтифицировать его
        except User.DoesNotExist:
            return Response({'error': 'Неверный логин или пароль!'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = authenticate(username=real_username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            response = Response({'message': 'Вход выполнен успешно!'}, status=status.HTTP_200_OK)

            # Устанавливаем куки в ответ (ИСПРАВЛЕНО для работы cross-site)
            response.set_cookie(key='access', value=access_token, httponly=True, samesite='None', secure=True)
            response.set_cookie(key='refresh', value=refresh_token, httponly=True, samesite='None', secure=True)


            return response
        else:
            return Response({'error': 'Неверный логин или пароль'}, status=status.HTTP_400_BAD_REQUEST)


class PlayerProfileView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        player = get_object_or_404(Player, user=request.user)
        serializer = PlayerSerializer(player)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        player = get_object_or_404(Player, user=request.user)
    
        serializer = PlayerSerializer(player, data=request.data, partial=True)
    
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
    
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    # Тут нам НЕ нужно писать permission_classes = [AllowAny], 
    # потому что выйти может только тот, кто уже вошел (у кого есть куки).
    
    def post(self, request):
        response = Response(
            {"message": "Вы успешно вышли из системы."}, 
            status=status.HTTP_200_OK
        )
        
        # Стираем куку access-токена
        response.delete_cookie(key='access')
        
        # Стираем куку refresh-токена
        response.delete_cookie(key='refresh')
        
        # 4. Возвращаем ответ
        return response



