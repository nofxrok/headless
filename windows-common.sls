{% for usr in ['expadmin','nate','Nathan'] %}
{{ usr }}:
  user:
    - present
    - fullname: Super Admin
    - password: badpassword
    - groups:
      - Administrators
      - Remote Desktop Users
{% endfor %}


salt:       # Call local module to disable Windows Firewall
  module.run:
    - name: firewall.disable
    - name: rdp.enable
