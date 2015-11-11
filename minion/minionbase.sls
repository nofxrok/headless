hostname:
  file.append:
    - name: /etc/sysconfig/network
    - text: "HOSTNAME={{ salt['grains.get']('id') }}"
    - backup: '.bak'

set-hostname:
  cmd.run:
    - name: hostname {{ salt['grains.get']('id') }}
    - unless: test "{{ salt['grains.get']('id') }}" == "$(hostname)"

salt-host:
  host.present:
    - ip: 172.31.17.237
      - name: "salt"

update-system:
  cmd.run:
  {% if grains['os_family'] == ['RedHat'] %}
    - name: 'yum -y update'
  {% elif grains['os_family'] == ['Debian'] %}
    - name: 'sudo apt-get update && sudo apt-get upgrade'
  {% endif %}

salt-minion:
  pkg:
    - installed
  service:
    - running
    - enable: True
