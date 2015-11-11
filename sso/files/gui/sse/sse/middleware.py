"""
    Middleware process handler to check if the token has expired or not. In case
    it has expired, redirect the user to the login page so that a new token is
    generated.
"""

from core.models import GlobalConfig
from datetime import timedelta
from django.conf import settings
from django.http.response import HttpResponseBadRequest
from re import compile
from rest_framework.authtoken.models import Token
import datetime
import pytz
import json

EXEMPT_URLS = [compile(settings.LOGIN_URL.lstrip('/'))]
if hasattr(settings, 'PUBLIC_URLS'):
    EXEMPT_URLS += [compile(expr) for expr in settings.PUBLIC_URLS]


class TokenAuthenticationMiddleware(object):

    """
        Token authentication middleware
    """

    def process_request(self, request):
        """
            process_request called before every view call and do the token authentication
        """

        # To exclude the public URLS from token authentication
        path = request.path_info.lstrip('/')
        if not any(m.match(path) for m in EXEMPT_URLS):

            try:
                token_id = request.META.get(
                    "HTTP_AUTHORIZATION", None).split()[1]
            except:
                return HttpResponseBadRequest(json.dumps((dict(error=["token_not_provided"], data=dict()))))

            try:
                token = Token.objects.get(key=token_id)
            except:
                return HttpResponseBadRequest(json.dumps((dict(error=["invalid_token"], data=dict()))))

            utc_now = datetime.datetime.utcnow()
            utc_now = utc_now.replace(tzinfo=pytz.utc)

            try:
                token_min = int(
                    GlobalConfig.objects.get(name="token_exp").value)
            except:
                token_min = 60

            if token and token.created < utc_now - timedelta(minutes=token_min):
                return HttpResponseBadRequest(json.dumps((dict(error=["token_expired"], data=dict()))))
            else:
                token.created = datetime.datetime.now()
                token.save()

        return None
