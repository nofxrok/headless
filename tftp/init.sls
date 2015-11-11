#!jinja|yaml

{% from "tftp/defaults.yaml" import rawmap with context %}
{% set datamap = salt['grains.filter_by'](rawmap, merge=salt['pillar.get']('tftp:lookup')) %}

tftp:
  pkg:
    - installed
    - pkgs: {{ datamap.pkgs }}
  service:
    - running
    - name: {{ datamap.service.name }}
    - enable: {{ datamap.service.enable|default(True) }}
{% endif %}
