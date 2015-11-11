dnsmasq:
  pkg.latest


# Cobbler now manages dnsmasq configs, see templates in that state
#/etc/dnsmasq.conf
#  file.managed:
#    - source://salt/dnsmasq/dnsmasq.conf
