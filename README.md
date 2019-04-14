
# DLive Guide

A chrome extension that shows all live streams of the people you follow. Written in mithril.js

### Running

I will add a build, but currently this requires nodejs to install the dependencies

    cd src
    npm install

### Contributing

This project will use [git flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

The basic flow is to branch off develop to a new feature branch:

    git checkout develop
    git pull
    git checkout -b feature/my-cool-new-feature

implement your cool new feature, committing as you go. Then push your new branch to origin. Then simply open a pull request back into develop. 

### Installation

 1. Open the extensions configuration page in Chrome

     ![Extensions](images/readme/extensions.png)

 2. Turn on "Developer Mode"

     ![Developer Mode](images/readme/developer_mode.png)

 3. "Load Unpacked Extension" and select the allnight folder

     ![Load Unpacked](images/readme/load_unpacked.png)
     
