
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

cobbler:
  pkg.latest:
    - refresh: True
    - watch_in:
      - service: apache
  service.running:
    - name: cobbler
    - enable: True

cobbler-web:
  pkg.installed:
    - name: cobbler-web

cobbler-settings-config:
  augeas.change:
    - context: /etc/cobbler/settings
    - changes:
      - set bind_master {{ get_config('bind_master', '127.0.0.1') }}
      - set next_server {{ get_config('next_server') }}
      - set server {{ get_config('server') }}
      - set manage_dhcp {{ get_config('manage_dhcp', '0') }}
      - set restart_dhcp {{ get_config('restart_dhcp', '0') }}
      - set manage_tftpd {{ get_config('manage_tftpd', 1) }}
      - set pxe_just_once {{ get_config('pxe_just_once', 0) }}
      - set default_virt_bridge {{ get_config('default_virt_bridge', 'xenbr0') }}
      - set default_virt_type {{ get_config('default_virt_type', 'xenpv') }}
      - set register_new_installs {{ get_config('register_new_installs', '0') }}
    - watch_in:
      - service: cobbler
  require:
    - pkg: cobbler

cobbler-modules-config:
  augeas.change:
    - context: /etc/cobbler/modules.conf
    - changes:
      - set dns/module {{ get_config('dns_module', 'manage_isc') }}
      - set dhcp/module {{ get_config('dhcp_module', 'manage_isc') }}
      - set tftpd/module {{ get_config('tftpd_module', 'manage_in_tftpd') }}
    - watch_in:
      - service: cobbler
  require:
    - pkg: cobbler


# This will point to the dnsmasq server and give parameters to set in that configuration
cobbler-dnsmasq-config:
  file.managed:
    - source: salt://cobbler/files/dnsmasq.template
    - name: /etc/cobbler/dnsmasq.template
    - template: jinja
  require:
    - pkg: cobbler
  listen_in:
    - service: cobbler

# This will manage the tftp configuration file parameters that cobbler will manage
cobbler-tftpd-config:
  file.managed:
    - source: salt://cobbler/files/tftpd.template
    - name: /etc/cobbler/tftpd.template
    - template: jinja
  require:
    - pkg: cobbler
  listen_in:
    - service: cobbler



# Ensure that the /tftpboot directory is there
/tftp:
  file.directory
