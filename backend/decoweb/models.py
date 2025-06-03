from django.db import models
from django.contrib.auth.models import User


class Strategy(models.Model):
    target_depth = models.IntegerField(default=20)
    bottom_time = models.IntegerField(default=10)
    user = models.ForeignKey(User, null=True, on_delete=models.CASCADE)

    def __str__(self):
        return f"Strategy {self.target_depth} m {self.bottom_time} min"


class Gas(models.Model):
    strategy = models.ForeignKey(Strategy, on_delete=models.CASCADE)
    oxygen = models.IntegerField(default=21)
    helium = models.IntegerField(default=0)

    def __str__(self):
        return f"Gas for {self.strategy}: {self.oxygen}% o2 {self.helium}% he"
