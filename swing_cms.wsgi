#!/usr/bin/python
import sys
import logging

logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/var/www/rxdbit.com/contact-os/")

from swing_main import app as application
