import os
import json

with open('/etc/network_config.json') as config_file:
    config = json.load(config_file)

class Config:
    DJANGO_KEY  = config.get('django_key')
