base-vim:
  pkg.installed:
    - name: vim-enhanced

vim-unpack:
  archive.extracted:
    - name: /root/.vim/
    - source: salt://vim/files/salt-vim.tar
    - tar_options: v
    - archive_format: tar
    - if_missing: ~/.vim/salt-vim
