#!/usr/bin/env python

import sys, os

# http://paulbourke.net/dataformats/ppm/
with open(sys.argv[1]) as fh:
  linesread = 0
  linebuf = ''
  w = None
  h = None
  while linesread < 4:
    c = fh.read(1)
    if c == '\n':
      if linesread == 0:
        if linebuf != 'P6':
          print >>sys.stderr, 'unrecognized format: {}'.format(linebuf)
          sys.exit(1)
      elif linesread == 1:
        w = int(linebuf)
      elif linesread == 2:
        h = int(linebuf)
      linebuf = ''
      linesread += 1
    else:
      linebuf += c
  print >>sys.stderr, 'writing image of size {}x{}'.format(w, h)
  imagebuf = fh.read()
  name = os.path.splitext(os.path.basename(sys.argv[1]))[0]
  sys.stdout.write('"%s":{"width":%s,"height":%s,"data":[' % (name, w, h))
  is_first = True
  for byte in imagebuf:
    sys.stdout.write('{}{}'.format(',' if not is_first else '', ord(byte)))
    is_first = False
  sys.stdout.write(']}\n')

