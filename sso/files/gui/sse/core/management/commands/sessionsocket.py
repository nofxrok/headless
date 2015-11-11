from django.core.management.base import NoArgsCommand
from tornado.ioloop import PeriodicCallback
import asyncio
import datetime
import django
import os
import pytz
import sys
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.websocket

# Setup Django environment so that we can access Django models
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sse.settings")
sys.path.append(
    os.path.join(os.path.sep.join(os.getcwd().split(os.path.sep)[:-1]), "sse"))
django.setup()
from django.conf import settings

from core.models import GlobalConfig
from rest_framework.authtoken.models import Token
from core import status_updater


class WSHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self, token):
        print ("open")
        self.token = token
        self.callback = PeriodicCallback(self.check_session, 30000)
        self.callback.start()

    def check_session(self):
        key = self.token

        try:
            token_min = int(GlobalConfig.objects.get(name="token_exp").value)
        except:
            token_min = 60

        try:
            token = Token.objects.get(key=key)
        except Exception as e:
            print (e)
            self.write_message("invalid_token")
            token = None
            self.callback.stop()

        utc_now = datetime.datetime.utcnow()
        utc_now = utc_now.replace(tzinfo=pytz.utc)

        if token and token.created < (utc_now - datetime.timedelta(minutes=token_min)):
            self.write_message("token_expired")
            self.callback.stop()

    def on_message(self, message):
        print (message)
        self.callback.stop()
        self.close()

    def on_close(self):
        print ("close")
        self.callback.stop()

application = tornado.web.Application([
    (r'/ws/(.*)', WSHandler),
])

class Command(NoArgsCommand):
    help = """
    Starts a daemon process to monitor user session activities. If a user login, a web socket connection is
    initiated between the client and the server. This monitors if the session of that user has expired or
    not. When user's session expires, session_expired message is pushed to the client from the server.
    """
    def handle_noargs(self, **options):
        if settings.SSO['ssl']:
            ssl_opts = {
                'certfile': '/etc/pki/tornado/certs/localhost.crt',
                'keyfile': '/etc/pki/tornado/certs/localhost.key',
            }
            http_server = tornado.httpserver.HTTPServer(application,
                                                        ssl_options=ssl_opts)
        else:
            http_server = tornado.httpserver.HTTPServer(application)

        http_server.listen(8888)
        callbacks = []

        funcs = [(status_updater.process_presence_events, 30000),
                 (status_updater.process_auth_events, 30000),
                 (status_updater.process_key_events, 30000),
                 (status_updater.purge_events, 30000),
                 (status_updater.update_info, settings.SSO.get('grains_update_period', 120)*1000)]
        for func in funcs:
            callbacks.append(PeriodicCallback(func[0], func[1]))
        for callback in callbacks:
            callback.start()
        tornado.ioloop.IOLoop.instance().start()
