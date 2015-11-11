
# Sync modules, build out dns entries and dhcp
sync_modules:
  cmd.run:
    - names:
      - cobbler sync


# Import ISO's mounted in the import-os state into Cobbler
import_cobbler_iso:
  cmd.run:
    - name: cobbler import --name=ubuntu14 --arch=x86_64 --path=/mnt/ubuntu-iso
    - onlyif: ls /var/www/cobbler/links/ubuntu14   # Don't import if it's already there


#{% if salt['pillar.get']('mountpoints')=="/mnt/ubuntu" %}
#import_iso::
#  cmd.run:
#    - name: cobbler import --name=ubuntu14 --arch=x86_64 --path=/mnt/ubuntu

#{% endif %}


include:
  - cobbler.import-os


