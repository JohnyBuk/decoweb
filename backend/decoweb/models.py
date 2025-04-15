from django.db import models


class Strategy(models.Model):
    target_depth = models.IntegerField(default=20)
    bottom_time = models.IntegerField(default=10) 
     
    def __str__(self):
        return f'{self.target_depth} m {self.bottom_time} min'

class Gass(models.Model):
    strategy = models.ForeignKey(Strategy, on_delete=models.CASCADE)
    oxygen = models.IntegerField()
    helium = models.IntegerField(default=0)
    
    def __str__(self):
        return f'{self.strategy}: {self.oxygen}% o2 {self.helium}% he'
