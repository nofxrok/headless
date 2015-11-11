{% import 'sso/init.sls' as vars %}

# clone the code from git
git@github.com:SS-Priv/himalayan_pink.git:
  git.latest:
    - rev: 'origin/master'
    - always_fetch: True
    - force:  True
    - force_checkout: True
    - target: {{ vars.home_dir }}/www
    - identity: {{ vars.home_dir }}/.ssh/id_rsa
    - user: {{ vars.user }}

