kill_loadgenerator:
  cmd.run:
    - name: kill -9  $(ps aux | grep gzip | awk '{print $2}')
