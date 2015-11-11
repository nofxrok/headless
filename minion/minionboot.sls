hostname:
  file.append:
    - name: /etc/sysconfig/network
    - text: "HOSTNAME={{ salt['grains.get']('id') }}"

set-hostname:
  cmd.run:
    - name: hostname {{ salt['grains.get']('id') }}
    - unless: test "{{ salt['grains.get']('id') }}" == "$(hostname)"

salt-host:
  host.present:
    - ip: 172.31.17.237
    - name: "salt"

call-bootstrap:
  cmd.run:
    - name: wget -O install_salt.sh https://bootstrap.saltstack.com && sudo sh install_salt.sh

