{% import 'sso/init.sls' as vars %}

# file to activate virtual env
/etc/nginx/sites-available/sso:
  file.managed:
    {% if vars.ssl %}
    - source: salt://sso/files/sso_nginx_ssl
    {% else %}
    - source: salt://sso/files/sso
    {% endif %}
    - mode: 644
    - template: jinja
    - defaults:
      gui_dir_path: {{ vars.gui_dir_path }}

/etc/nginx/sites-enabled/default:
  file.absent


/etc/nginx/sites-enabled/sso:
  file.symlink:
    - target: /etc/nginx/sites-available/sso
    - mode: 644

nginx:
  service:
    - running
    - enable: True
    - watch:
      - file: /etc/nginx/sites-enabled/sso

