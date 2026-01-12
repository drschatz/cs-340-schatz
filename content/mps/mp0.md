---
title: MP0
subtitle: Environment Setup
number: 0
---

This Machine Problem (MP) is NOT turned in on Prairie Learn, instead, to get the points, you will need to get it checked-off at office hours before the deadline or during the grace period (24 hours after the deadline). See the [home page](/) for the office hours schedule and the [syllabus](/syllabus) for course policies.

For this MP only, we will help you during office hours even after the original deadline.

In this class, we will develop code through two different toolchains. The first, Docker, is used for MPs 1-9. The second, a VM, is only required for MP10 and the final project but can be used for other MPs if docker isn't working. For MP0, you are required to get both toolchains working to avoid future issues. 

You are encouraged to look back at this MP through the course to help with working with the toolchains. 


# Local toolchain with Docker

## Installation

Install the following tools:

- [VS Code](https://code.visualstudio.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Setup

1. Download [cs340.zip](cs340.zip) which contains some basic VS Code and Docker setup and unzip it in a place that you can easily access (you'll need to upload from and download to this folder). We'll call the folder this creates your `cs340` folder for the rest of the semester.

*NOTE: the unzipped folder contains "hidden" folders as well as visible ones; you need to keep the entire unzipped folder intact, not copy its visible contents to another location. If in VS Code you don't see something named `.devcontainer` then you didn't keep all parts of the unzipped folder.*

There is a file named `Dockerfile` (that exact capitalization, no file extension) with the following text inside of it:

```dockerfile
FROM docker.io/gcc
RUN DEBIAN_FRONTEND=noninteractive \
    apt-get update && \
    apt-get install --yes --no-install-recommends \
        make \
        clang lld gdb lldb valgrind \
        curl wget git \
        less nano jq xxd \
        python3-pytest-aiohttp python3-pip \
        man manpages manpages-dev \
    && rm -rf /var/lib/apt/lists/*
CMD bash
```

Docker is a tool for creating an isolated environment called a "container" on your computer. We use it to get the power of a modern Linux development environment on non-Linux computers.

2. Run Docker Desktop -- it will do some first-time setup to finish installing itself.

3. Run VS Code:
    
    a. Either open a terminal, `cd` into your `cs340` folder, and type `code .` or open VS Code in another way and then use Open Folder from the File menu and open your `cs340` folder.
    
    NOTE: If `code` is not recognized as a command... If you are running MacOS, the [official setup guide](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line) explains how to fix this. If you are running a different OS contact course staff.
        
    b. Click the Extensions icon in the left bar. Inside this, install the following extensions, all from Microsoft:
    
    - `Dev Containers`
    - `Remote - SSH`
    - `C/C++`
    - `Python` (which should automatically also install `Python Debugger`)
    
    c. Click the remote icon in the bottom-left corner of VS Code:
    
    d. Select "Reopen in Container".
    
    *NOTE: If you are asked where to add a configuration... that means VS Code and Docker aren't talking to one another correctly. You either are not in the correct folder or you need to close VS Code, uninstall and re-install Docker, then re-open VS Code and try again. If that doesn't fix it, let us know on Campuswire or office hours and we'll look for another solution.*
    
    *NOTE: If you get an error message... Try opening a terminal and running `docker login` or try clearing your docker cache (or uninstalling and reinstalling docker)*
        
    e. Wait for the container to build.
    
    *NOTE: If you get an error message... Talk to a member of course staff; they can often resolve this. If not, there is an **alternative path**, though it will require some small setup effort **for each MP**:*
    
    ### Alternative Path for Docker

    1. Build a Docker image manually: from a terminal in the directory containing `Dockerfile`, run
        
        ```sh
        docker build -t cs340_image .
        ```
        
        If it has errors, post them on CampusWire and we'll suggest changes to the Dockerfile to fix them.
    
    2. In the `.devcontainer/devcontainer.json` of every MP, replace `"build: {`...`},` with `"image": "cs340_image",`
    

## Verify Docker

When running VS Code, you should see the bottom-left button says "Dev Container: Existing Dockerfile." If it does not say this, redo the "Reopen in Container" step from Setup.

In a terminal in VS Code (e.g. by pressing `Ctrl` + `` ` ``), you should:

- See the prompt line is `root@`hash`:/workspaces/cs340#` where "hash" is some random-looking string of letters and numbers.
- Run `gcc --version` to see a version number (`13.3.0` or later).
- Run `valgrind --version` to see a version string (`valgrind-3.22.0` or later).
- Run `pydoc3 aiohttp` to get a screen that says `Help on package aiohttp` (press Q to exit this screen).

# Remote toolchain with a Virtual Machine

All parts of the VM process require that you are either on the campus network or [using the university's VPN](https://answers.uillinois.edu/illinois/98773).

## Identify and Turn On your VM

You will be given a single VM. It's name will have the form `fa25-cs340-`num`.cs.illinois.edu` where "num" is a 3-digit number unique to you this semester. You can find the exact name at <https://csid-basic-apps.cs.illinois.edu>. You must be on the campus network or using a VPN to access it. If you have been enrolled in the course for at least two school days and no VM is listed there for you, contact the professor.

The VM will be turned off after a few hours of idleness. To turn it back on, follow these directions: <https://answers.uillinois.edu/illinois.engineering/page.php?id=108475>. Your VM needs to be on to interact with it in any way.

*NOTE: vsphere, the web portal for turning on VMs, can sometimes have intermittent trouble. "Other Ways" #2 below does not depend on vsphere.*

### Other Ways

All ways of powering on your VM require you to either (a) be on campus or (b) be connected to [the VPN](https://answers.uillinois.edu/illinois/98773).

1. If <https://vc.cs.illinois.edu/> is rejecting your credentials, try opening it in a private or incognito browser window. The page has an error in its handling of cookies that can sometimes make a normal window reject your authentication.

2. The Engineering Workstations have a script for turning on your VM. To use it:
    
    a. From a command line, type `ssh `netid`@linux.ews.illinois.edu`
    
    b. Log in with your NetID and its password. Note that the password might not appear on screen as you type it, but it is still being accepted.
    
    c. You'll see a few dozen lines of text about EWS, and then a prompt where you can type
    
    d. Type `cs-vmfarm-poweron`
    
    e. Enter the information that it requests, including the full VM name (`fa25-cs340-`num`.cs.illinois.edu`)
    
    f. Type `exit` to close your connection to EWS

*NOTE: Your VM's password is your NetID password. If you change your NetID password it may take a couple of days for the VM to catch up.*

### Connecting without typing your password

VS Code connects to the virtual machine using a protocol and tool called SSH. SSH has several ways to authenticate users: it defaults to checking passwords, but can be set up to compare files on your machine and the virtual machine instead. Because there are several implementations of SSH, the details of how that works vary, but the following should work for most students.

**Windows:**

1. Open the powershell application; the following steps are run from that window.
2. If `ls $env:USERPROFILE/.ssh/` does **not** show a file named `id_`*something*`.pub`:
    
    a. Run `ssh-keygen` and press Enter without typing anything at each passphrase prompt.

3. Run `ls $env:USERPROFILE/.ssh/` to see what file named `id_`*something*`.pub` you have. Common files are `id_rsa.pub` and `id_ed25519.pub`, but others are possible. The next step assumes `id_rsa.pub` but you can change that part of the command if it was something different.

4. Run `ssh` *your VM* `"mkdir .ssh"`, replacing "*your vm*" with your user-qualified full VM name (netid`@fa25-cs340-`num`.cs.illinois.edu`). When prompted, enter the password associated with your NetID.

5. Run `type $env:USERPROFILE\.ssh\id_rsa.pub | ssh` *your VM* `"cat >> .ssh/authorized_keys"`, replacing "*your vm*" with your user-qualified full VM name (netid`@fa25-cs340-`num`.cs.illinois.edu`). When prompted, enter the password associated with your NetID.

**MacOS or Linux:**

1. Open the terminal application; the following steps are run from that window.
2. If `ls $HOME/.ssh/` does **not** show a file named `id_`*something*`.pub`:
    
    a. Run `ssh-keygen` and press Enter without typing anything at each passphrase prompt.

3. Run `ssh-copy-id` *your VM*, replacing "*your vm*" with your user-qualified full VM name (netid`@fa25-cs340-`num`.cs.illinois.edu`). When prompted, enter the password associated with your NetID.

If this is successful, you should then be able to run `ssh` *your VM* and connect without requiring a password. If it is not successful, you'll need to use the password-based authentication instead, and may also share how it failed on CampusWire; we might be able to find a workaround, but no promises.

## Setup VS Code VM integration

1. Open VS Code.

2. Click the remote icon in the bottom-left corner of VS Code:
    
    a. Select "Connect to Host…"
    
    b. Select "Add New SSH Host…"
    
    c. Type `ssh `netid`@fa25-cs340-`num`.cs.illinois.edu`, filling in your NetID and VM number.
    
    d. Pick a config file from the available options; the first displayed option should work fine.
    
    e. In the new VS Code window that opens up, open up a terminal. It should have your VM name on the prompt line.

## Verify VM

When running VS Code, you should see the bottom-left button says the name of your VM. If it does not say this, redo step 2 of Setup VS Code VM integration.

In a terminal in VS Code (e.g. by pressing `Ctrl` + `` ` ``), you should:

- See the prompt line is netid`@fa25-cs340-`num`:~$` with your NetID and VM number.
- Run `gcc --version` to see a version number (`13.3.0` or later).
- Run `valgrind --version` to see a version string (`valgrind-3.22.0` or later).
- Run `pydoc3 aiohttp` to get a screen that says `Help on package aiohttp` (press Q to exit this screen).

## File transfer

Your virtual machine has a separate disk from your personal computer. To move files back and forth, use `scp`.

1. In a VS Code terminal running the virtual machine:
    
    a. `cd` into the directory where the files are or where you want them to be
    
    b. `pwd` to see the full directory path; for example, `/home/netid/cs340/mp18`

2. In a VS Code terminal running the docker container:
    
    a. `cd` into the directory where the files are or where you want them to be
    
    b. use `scp currentLocation desiredLocation`, where:
        
    - One of the locations has the form netid`@fa25-cs340-`num`.cs.illinois.edu:/home/netid/cs340/mp18`

    - The other location is a local filename

    - The `desiredLocation` may be a directory, meaning "keep the same filename". If so, the `currentLocation` can be a wildcard like `*` or repeated to transfer several files at once.

For files located online, you can download them to the VM directly by using `wget https://example.com/file/to/download.zip`


# Check-Off Requirements

To get points for this MP, you must show a staff member at office hours the "Verify Docker" and "Verify VM" steps from above.

