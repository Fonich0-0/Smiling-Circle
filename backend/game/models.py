from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    current_stage = models.IntegerField(default=1)
    stars = models.IntegerField(default=0)
    exp = models.IntegerField(default=0)

    coins = models.IntegerField(default=0)
    gems = models.IntegerField(default=0)
    


