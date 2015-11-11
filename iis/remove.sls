state_event:
    salt.function:
          - tgt: 'roles:saltmaster'
              - tgt_type: grain
                  - name: cmd.run
                      - arg: salt 'win*' chocolatey.uninstall firefox && salt 'win*' cmd.run "C:\Program Files (x86)\Mozilla Firefox\uninstall\helper.exe /S" && salt -t 30 'win*' win_servermanager.remove 'Web-Server,Web-Mgmt-Tools,Web-Mgmt-Console,Web-Scripting-Tools' && salt 'win*' system.reboot
