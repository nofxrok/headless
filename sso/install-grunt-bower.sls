{% import 'sso/init.sls' as vars %}

{% if vars.is_prod_build %}
include:
  - sso.copy-gui-code
{% endif %}

install grunt and bower:
  cmd.run:
    - shell: /bin/bash
    - name: npm install grunt-cli bower -g
    - cwd: {{ vars.gui_dir_path }}
    {% if vars.is_prod_build %}
    - require:
      - sls: sso.copy-gui-code
    {% endif %}

