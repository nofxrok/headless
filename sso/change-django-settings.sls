{% import 'sso/init.sls' as vars %}

{% if vars.is_prod_build %}
Set debug to false for prod build:
  file.replace:
    - name: {{ vars.django_settings_file }}
    - pattern: "^DEBUG = True"
    - repl: "DEBUG = False"
    - show_changes: True
    - onlyif: egrep -q "^DEBUG = True" {{ vars.django_settings_file }}

{% endif %}

# env variable sourced by django start script
/etc/default/sso_gunicorn:
  file.managed:
    - source: salt://sso/files/salt_sso_env
    - user: {{ vars.user }}
    - mode: 600
    - template: jinja
    - defaults:
      django_secret: "{{ ''.join(salt['grains.get_or_set_hash']('django:SECRET_KEY', 50)) }}"

Replace database password with pillar data variables:
  file.replace:
    - name: {{ vars.django_settings_file }}
    - pattern: "^        'PASSWORD': 'saltadmin',"
    - repl: "        'PASSWORD': '{{ vars.db_password }}',"
    - show_changes: False

