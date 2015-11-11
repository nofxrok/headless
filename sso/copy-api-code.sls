{% import 'sso/init.sls' as vars %}

create api folder firectory:
  file.recurse:
    - name: {{ vars.api_dir_path }}
    - user: {{ vars.user }}
    - group: {{ vars.group }}
    - dir_mode: 755
    - source: salt://sso/files/gui/sse
    - file_mode: '0644'
    - makedirs: True
    - recurse:
      - user
      - group
      - mode

