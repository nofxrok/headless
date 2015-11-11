{% import 'sso/init.sls' as vars %}

create gui folder firectory:
  file.recurse:
    - name: {{ vars.gui_dir_path }}
    - user: {{ vars.user }}
    - group: {{ vars.group }}
    - dir_mode: 755
    - source: salt://sso/files/gui/sse_fe
    - file_mode: '0644'
    - makedirs: True
    - recurse:
      - user
      - group
      - mode
