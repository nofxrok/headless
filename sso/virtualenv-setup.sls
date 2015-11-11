# State to install virtualenvwrapper and initialize
# virtualenv for the GUI

{% import 'sso/init.sls' as vars %}
 
# This installs virtualenvwrapper via python pip
virtualenvwrapper:
  pip.installed:
    - require:
      - pkg: prereq-packages

# This state creates a virtualenv named sse_env using python 3
# The sse_env virtualenv gets creted in your home_dir/Envs folder
# Lastly this state will install any required packages using the requirements file
virtualenv-init:
  virtualenv.managed:
    - name: {{ vars.home_dir }}/Envs/{{ vars.virtual_env }}
    - python: /usr/bin/python3
    - pip_exists_action: i
    - user: {{ vars.user }}
    - requirements: salt://sso/files/requirements.txt

