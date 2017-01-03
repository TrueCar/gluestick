Gluestick-installed vagrant box file
====================================

This Vagrant project creates an Ubuntu 16.04 machine with nodejs and gluestick installed.  It is suitable for creating a non-local instance of gluestick for development work.

Setup
-----
To create a machine:

```
vagrant up
```
This machine provisions using bootstrap.sh.  It installs node and yarn, then checks out gluestick from the public repository and uses `yarn link` to install globally.  The machine does not expose any ports or share any folders, but it can be used locally via `vagrant ssh`, or via the virtualbox GUI.

Wait for provisioning to complete, then run the following from the same path:
```
./makePackage.sh
./addPackage.sh
```
These commands generate and register a vm package (box file) so that the apt and gluestick installtions need not be repeated.  They are simple wrappers around the vagrant commands `package` and `box add` to register as "truecar/gluestick". 

Usage
-----


### Using the new box
This image can be referenced in other Vagrant projects with:
```
Vagrant.configure("2") do |config|

    config.vm.box = "truecar/gluestick"
    # ...
end
```

### Shared folders

Because node heavily leverages symbolic links, sharing folders from Windows is difficult.  Instead, use one-way syncing of files via sftp or rsync.  For example:

```
1. vagrant ssh-config >> ~/.ssh/config #export vagrant's ssh config
2. rsync or sftp stuff
3. profit

