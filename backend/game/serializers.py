from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Player


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        read_only_fields = ('user',)
        fields = ('current_stage', 'stars',  'exp', 'coins', 'gems')


class RegisterSerializer(serializers.ModelSerializer):
    
    # ModelSerializer — это встроенный робот DRF. 
    # Он смотрит на модель (User) и сам понимает:
    # - Ага, у User есть поле 'username', оно обязательное и должно быть уникальным.
    # - Есть поле 'email', оно должно быть валидным адресом почты.
    

    # 1. ЯВНОЕ ОБЪЯВЛЕНИЕ ПОЛЯ ДЛЯ ПАРОЛЯ
    # Мы не хотим использовать стандартные настройки Django для пароля, поэтому пишем сами:
    password = serializers.CharField(
        write_only=True,      # ПАРОЛЬ ПОЙДЕТ ТОЛЬКО В БАЗУ. В ответе API (JSON) его никогда не будет!
        min_length=8,         # Автоматическая проверка: если пароль < 8 символов, DRF сам выкинет ошибку
        error_messages={      # Кастомизируем ошибки, чтобы фронтенд получал понятный текст
            "blank": "Пароль не может быть пустым.",
            "min_length": "Пароль слишком короткий, нужно минимум 8 символов."
        }
    )

    class Meta:
        model = User # Связываем сериализатор со стандартной моделью пользователя Django
        fields = ['username', 'email', 'password'] # Список полей, которые мы ждем от фронтенда
        
        # Настройки для стандартных полей модели
        extra_kwargs = {
            'email': {
                'required': True,          # Делаем email строго обязательным (в Django по умолчанию он необязателен)
                'allow_blank': False,       # Запрещаем присылать пустую строку "" вместо email
            },
            'username': {
                'error_messages': {
                    'unique': "Пользователь с таким именем уже существует!" # Кастомный текст, если имя занято
                }
            }
        }

    # 2. КАСТОМНАЯ ВАЛИДАЦИЯ КОНКРЕТНОГО ПОЛЯ (email)
    # Если вам нужно проверить поле особым образом, пишите метод: validate_<имя_поля>
    # DRF вызовет его автоматически во время выполнения метода is_valid()
    def validate_email(self, value):
        """
        value — это то, что прислал пользователь в поле 'email'.
        По умолчанию Django проверяет уникальность username, но не email. Исправим это руками:
        """
        # Переводим email в нижний регистр, чтобы 'User@mail.com' и 'user@mail.com' считались одним адресом
        email_normalized = value.lower()

        # Ищем в базе: есть ли уже юзер с такой почтой?
        if User.objects.filter(email=email_normalized).exists():
            # Если нашли — кидаем ValidationError.
            # DRF поймает её и превратит в красивый ответ: 400 Bad Request
            raise serializers.ValidationError("Пользователь с этим email уже зарегистрирован.")
        
        # Если всё ок — обязательно возвращаем очищенное значение назад!
        return email_normalized

    # 3. МЕТОД СОЗДАНИЯ ОБЪЕКТА (Вызывается внутри serializer.save())
    def create(self, validated_data):
        """
        validated_data — это словарь, в котором лежат данные, ПРОШЕДШИЕ ВСЕ ПРОВЕРКИ выше.
        Он выглядит так: {'username': 'ivan', 'email': 'ivan@ya.ru', 'password': 'super_password123'}
        """
        # Используем встроенный метод create_user.
        # Он берет сырой пароль, превращает его в хэш (например, pbkdf2_sha256$...)
        # и только хэш сохраняет в базу.
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Возвращаем созданного пользователя обратно в метод .save()
        return user
