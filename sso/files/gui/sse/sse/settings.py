"""
Django settings for sse project.

For more information on this file, see
https://docs.djangoproject.com/en/dev/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/dev/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import rest_framework
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

import logging
from logging.handlers import SysLogHandler

tlp = os.path.sep.join(os.getcwd().split(os.path.sep)[:-1])
static_files = os.path.join(tlp, 'sse_fe/dist/static')

#SLS upload file location
SLS_UPLOAD_LOCATION = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sls_upload/')
BEACON_SCRIPT_LOCATION = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'beacons/')

# Required for django admin site's static files
STATIC_ROOT = static_files

# Syslog configuration for SSE
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(asctime)s %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'syslog': {
            'level': 'DEBUG',
            'class': 'logging.handlers.SysLogHandler',
            'formatter': 'verbose',
            'facility': SysLogHandler.LOG_LOCAL2,
            'address': '/dev/log'
        },
    },
    'loggers': {
        # This is a "catch all" logger
        'django': {
            'handlers': ['syslog'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['syslog'],
            'level': 'DEBUG',
            'propagate': False,
        },
        '': {
            'handlers': ['syslog'],
            'level': 'DEBUG',
            'propagate': False,
        },
    }
}

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/dev/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SSO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = ["*"]


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'core',
    'event',
    'master',
    'minion',
    'job',
    'target',
    'report',
    'corsheaders',
    'mptt',
    'django_extensions',
    'django_pgjsonb',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'sse.middleware.TokenAuthenticationMiddleware',
)

ROOT_URLCONF = 'sse.urls'

WSGI_APPLICATION = 'sse.wsgi.application'


# Database
# https://docs.djangoproject.com/en/dev/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'saltdb',
        'USER': 'saltadmin',
        'PASSWORD': 'saltadmin',
    }
}

import sys
# If unit tests are being executed, use sqlite3 for faster performance
if 'test' in sys.argv:
    DATABASES['default'] = {'ENGINE': 'django.db.backends.sqlite3'}
    # Skip token authentication in case of Django Unit test case execution
    MIDDLEWARE_CLASSES = (
        'django.contrib.sessions.middleware.SessionMiddleware',
        'corsheaders.middleware.CorsMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    )
# Internationalization
# https://docs.djangoproject.com/en/dev/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/dev/howto/static-files/

STATIC_URL = '/static/'

AUTH_PROFILE_MODULE = 'core.UserProfile'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    ),

    'PAGINATE_BY': 20,                 # Default to 10
    # Allow client to override, using `?page_size=xxx`.
    'PAGINATE_BY_PARAM': 'page_size',
    # Maximum limit allowed when using `?page_size=xxx`.
    'MAX_PAGINATE_BY': 100

}

LOGIN_URL = '/core/login/'

PUBLIC_URLS = (
    r'admin/',
)
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_METHODS = (
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
)
CORS_ALLOW_HEADERS = (
    'x-requested-with',
    'content-type',
    'accept',
    'origin',
    'authorization',
    'x-csrftoken'
)

if 'test' not in sys.argv:
    # Memcache settings
    CACHE_HOST = "127.0.0.1"
    CACHE_PORT = "11211"
    LOCATION = ("%S:%s", (CACHE_HOST, CACHE_PORT))
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
            'LOCATION': LOCATION,
        }
    }

if DEBUG:
    import mimetypes
    mimetypes.add_type('application/font-woff', '.woff', True)

    tlp = os.path.sep.join(os.getcwd().split(os.path.sep)[:-1])
    static_files = os.path.join(tlp, 'sse_fe/dist')
    STATICFILES_DIRS = (static_files,)

SUPERUSER_GROUPS = ["superuser"]

AES_KEY = "6q2qy1auil9o1yrf"

MINION_EXPIRY = 30 # days

# EMail Settings
# Email Backend
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Host for sending e-mail.
EMAIL_HOST = 'localhost'

# Port for sending e-mail.
EMAIL_PORT = 25

# Optional SMTP authentication information for EMAIL_HOST.
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
EMAIL_USE_TLS = False

DEFAULT_TO_EMAIL = 'notifications@saltstack.com'

KEY_ACTION = ["accept", "delete", "deny", "reject", "unaccept"]
# Saltstack Operations
# grains_update is in seconds
SSO = {
    'ssl':  True,
    'grains_update_period': 120
}


