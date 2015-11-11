
{% set cfg_cobbler = pillar.get('cobbler', {}) -%}
{%- macro get_config(configname, default_value) -%}
{%- if configname in cfg_cobbler -%}
{{ cfg_cobbler[configname] }}
{%- else -%}
{{ default_value }}
{%- endif -%}
{%- endmacro -%}


include:
  - apache


cobbler-dnsmasq-config:
  file.managed:
    - source: salt://cobbler/files/dnsmasq.template
    - name: /etc/cobbler/dnsmasq.template
    - template: jinja
  require:
    - pkg: cobbler
