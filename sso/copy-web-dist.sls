{% import 'sso/init.sls' as vars %}

create dist folder:
  file.recurse:
    - name: {{ vars.dist_dir_path }}
    - user: {{ vars.user }}
    - group: {{ vars.group }}
    - dir_mode: 755
    - source: salt://sso/files/gui/dist
    - file_mode: '0644'
    - makedirs: True
    - recurse:
      - user
      - group
      - mode

