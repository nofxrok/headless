export WORKON_HOME={{ home_dir }}/Envs
[ -f /etc/default/sso_gunicorn ] && . /etc/default/sso_gunicorn
source /usr/local/bin/virtualenvwrapper.sh
workon {{ virtual_env }}

# Run the following commands for db migration and seeding
# python manage.py migrate
# python manage.py loaddata initial_fixture.json

