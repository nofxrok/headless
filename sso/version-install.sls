{% import 'sso/init.sls' as vars %}

############################################################
# Create the version.html file in root of GUI install,
# template source file created during fe_build process
############################################################

version_install:
  {% set version_file = '{0}/version.html'.format(vars.dist_dir_path) %}
  file.managed:
    - name: {{ version_file }}
    - source: salt://sso/files/v.b
    - template: jinja
