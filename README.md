# Swing CMS - Contact-Os
Contact-Os, Progressive Web App

-RXDBit

# Requirements

Swing CMS is being develop with the following libraries:
- Python 3.8 (on a virtual environment)
- Python pip 21.2.4
- Flask 2.0.1
- Nginx 1.14.0 and Gunicorn 20.1.0
- SocketIO 3.1.0, Flask-SocketIO 5.1.1 and SimplePeer 9.7
- NodeJS 14.17.6
- Elasticsearch 7.15.2
- MySQL 8.0 or PostgreSQL 14.1
- npm 6.14.15
- npm libraries:
    - webpack@5
    - css-loader
    - sass-loader
    - node-sass
    - extract-loader
    - file-loader
    - babel-core 
    - babel-loader
    - material-components-web
    - lots more!...


# Installation steps

To install Swing CMS, follow the next steps (under Ubuntu 16.04):

1 - Create a directory into which clone Swing CMS. If it's being deployed on a web server, like Apache HTTPD, create it under the proper directory. (i.e.: /var/www/)

2 - Install git:

    ~: sudo add-apt-repository ppa:git-core/ppa

    ~: sudo apt update

    ~: sudo apt-get install git

3 - Clone Swing CMS from GitHub's repository:

    ~: git clone git@github.com:renegng/contact-os.git

4 - Inside the prevoius folder, install a Python 3.8 or greater virtual environment and the RDBMS (MySQL, ElasticSearch) prerequisites:

    ~: [python | python3 | python3.8 | python3.x] -m venv venv
    ~: sudo apt-get install build-essential python3-dev libmysqlclient-dev
    ~: sudo apt-get install elasticsearch

5 - Inside the prevoius folder, activate the virtual environment:

    ~: source ./venv/bin/activate

6 - Within the activated virtual environment, install Flask and all PiP applications:

    ~: pip install --upgrade pip

    You could install all packages automatically:

    ~: pip install -r requirements.txt

    or independently:

    ~: pip install wheel
    ~: pip install flask
    ~: pip install flask-login
    ~: pip install flask-sqlalchemy
    ~: pip install flask-migrate
    ~: pip install flask-wtf
    ~: pip install flask-socketio
    ~: pip install flask-babel
    ~: pip install gunicorn[eventlet]
    ~: pip install gevent
    ~: pip install psycopg2-binary
    ~: pip install firebase-admin
    ~: pip install mysqlclient
    ~: pip install elasticsearch
    ~: pip install cryptography
    ~: pip install sqlalchemy-utils

    For ChatBot component, install following packages:
    ~: pip install pyspellchecker
    ~: pip install chatterbot
    ~: pip install pyyaml
    ~: pip install spacy
    ~: spacy download es

    ~: deactivate

7 - Install the appropriate plugin for Flask and Python to be executed on the web server:

    ~: sudo apt-get install [libapache2-mod-wsgi-py3 | nginx]

8 - Instal NodeJS:

    ~: curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -

    ~: sudo apt-get install -y nodejs

9 - Execute NodeJS's npm to install all libraries needed:

    ~: npm install
    ~: npm run build-prd-wp

** - AOS can sometimes generate some issues. To prevent that delete the .babelrc file under the node_modules/aos folder.

10 - Copy/configure the instance folder with all proper credentials and configurations:
    
    + firebase-admin-key
    + firebase-api-init
    + firebase-key
    + config_app
    + config_firebase
    + config_models

11 - Execute models/ddl.py to generate the database.

12 - Deploy your webserver:

    + Apache HTTPD - swing_cms.apache2.conf
    OR
    + Nginx/Gunicorn - swing_cms-socketio.*.conf


# Credits to

Proper credit for the following people/teams:
- Apache HTTPD, Nginx and Gunicorn web server that never fails.
- Google's Material Design, Workbox and Firebase team, for making the web awesome!
- Polymer Project, for an amazing main HTML PWA Template structure.
- Python, Flask, NodeJS, SQLAlchemy(-Utils), Migrate, Alembic, WTForms, Login, Cryptography GitHub and everyone's amazing frameworks.
- MySQL, Firebase, ElasticSearch for amazing Databases with amazing features.
- SocketIO and simple-peer for their wonderful frameworks to implement WebRTC.
- dr5hn's Countries States Cities Database for providing an amazing location DB.
- Localforage for their simple and amazing localStorage wrapper.
- jsCalendar and LitePicker for their amazing simple modern calendar library.
- Chart.js for their lite and modern data graphs charts.
- Traversy Media, for incredible tips & tricks overall.
- Visual Studio Code, for an incredible IDE.
- Twitter Twemoji for the amazing emojis.
- Ubuntu team, stable OS to work on.
- Animate.css from <a href="https://animate.style/" title="Animate CSS">animate.style/</a> for their amazing css animations!
- Icons made by <a href="http://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
- Icons made by <a href="https://www.flaticon.com/authors/vitaly-gorbachev" title="Vitaly Gorbachev">Vitaly Gorbachev</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
- Icons made by <a href="https://www.flaticon.com/authors/fjstudio" title="fjstudio">fjstudio</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
- Icons made by <a href="https://www.flaticon.com/authors/dinosoftlabs" title="DinosoftLabs">DinosoftLabs</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
- Anchorme for URL detection and replacement
- Sounds from <a href="https://www.zapsplat.com/" title="Zapsplat">zapsplat.com</a> and <a href="https://mixkit.co/" title="Mixkit">mixkit.com</a>
- dev-console.macro, date-fns & crypto-js for essential and amazing JS Libraries.
