# Steps to install Api

Follow these steps to install the API server

# Install pyenv

Pyenv is required for this to work.

## Prerequisites

This documentation assumes you already have a pre-loaded MySQL Database with user privileges configured. You can find the bare schema in schema.sql

Configure config.py:
~~~
MYSQL_USER = ''
MYSQL_PASSWORD = ''
MYSQL_HOST = '127.0.0.1'
MYSQL_PORT = 3306
MYSQL_DB = 'bingo'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER  = "/home/bingo/www-data/uploads"
AVATAR_FOLDER = "/home/bingo/www-data/avatars"
SECRET_KEY = 'mysecretkey'
~~~

## Configure pyenv environment
From the current working directory:
~~~
$ python -m venv venv
$ source venv/bin/activate
(venv) $
~~~
Install packages
~~~
(venv) $ pip install -r requirements.txt
~~~
The remaining configs should already be good enough to make this run.

## Test some stuff

You should probably test to make sure your environment is working. Verify that app.py runs without error. The following command should not return an error:
~~~
(venv) $ python app.py
Registered routes:
/static/<path:filename>
/api/login
/api/users
/api/boxes
/api/card/<int:user_id>
/api/card/<int:user_id>
/api/card/<int:user_id>/<int:row>/<int:col>/upload
/api/card/<int:user_id>/lock
/api/card/<int:user_id>/unlock
/api/card/<int:user_id>/lock-status
/api/users/<int:user_id>/upload-avatar
/uploads/<filename>
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5500
~~~

## Continue configuring uwsgi

CTL-C out of app.py and try running with uwsgi

~~~
(env) $ uwsgi --socket 0.0.0.0:5500 --protocol=http -w wsgi:app
*** Starting uWSGI 2.0.30 (64bit) on [Thu Aug  7 20:50:55 2025] ***
compiled with version: 14.2.0 on 31 July 2025 18:52:53
os: Linux-6.11.0-21-generic #21-Ubuntu SMP PREEMPT_DYNAMIC Wed Feb 19 16:50:40 UTC 2025
...
WSGI app 0 (mountpoint='') ready in 0 seconds on interpreter 0x5d72d554a740 pid: 1250128 (default app)
*** uWSGI is running in multiple interpreter mode ***
spawned uWSGI worker 1 (and the only) (pid: 1250128, cores: 1)
~~~

## Enable uWSGI as a service

You can now stop both app.py and uWSGI and deactivate the pyenv environment:
~~~
(venv) $ deactivate
~~~
Make a new file called /etc/systemd/system/bingo.service:
~~~
$ sudo vi /etc/systemd/system/bingo.service
[Unit]
Description=uWSGI instance to serve bingo
After=network.target

[Service]
User=bingo
Group=www-data
WorkingDirectory=/home/bingo/api
Environment="PATH=/home/bingo/api/venv/bin"
ExecStart=/home/bingo/api/venv/bin/uwsgi --ini api.ini

[Install]
WantedBy=multi-user.target
~~~
This should point at the correct path for wherever you have the apiserver code installed.

### Enable uWSGI to run as a service

Start the api service which you configured two steps earlier:
~~~
$ sudo systemctl start bingo
~~~
Enable bingo to start on boot:
~~~
$ sudo systemctl enable bingo
$ sudo systemctl status bingo
● bingo.service - uWSGI instance to serve bingo
     Loaded: loaded (/etc/systemd/system/bingo.service; enabled; preset: enabled)
     Active: active (running) since Thu 2025-08-07 17:34:29 UTC; 3h 23min ago
 Invocation: 6fad8e1580c94d0196f983c029c0ed3f
   Main PID: 1248045 (uwsgi)
      Tasks: 5 (limit: 2317)
     Memory: 45.6M (peak: 45.8M)
        CPU: 1.888s
     CGroup: /system.slice/bingo.service
             ├─1248045 /home/bingo/api/venv/bin/uwsgi --ini api.ini
             ├─1248047 /home/bingo/api/venv/bin/uwsgi --ini api.ini
             ├─1248048 /home/bingo/api/venv/bin/uwsgi --ini api.ini
             ├─1248049 /home/bingo/api/venv/bin/uwsgi --ini api.ini
             └─1248050 /home/bingo/api/venv/bin/uwsgi --ini api.ini
~~~
