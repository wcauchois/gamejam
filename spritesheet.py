#!/usr/bin/env python

import os, sys, subprocess
from PIL import Image
from collections import namedtuple
import math
import json

# returns (width, height) tuple
def get_image_size(filename):
  # http://stackoverflow.com/a/9499976/1480571
  im = Image.open(filename)
  size = im.size
  im.close()
  return size

Sprite = namedtuple('Sprite', ['filename', 'width', 'height'])

if __name__ == '__main__':
  with open("sprites.txt") as fh:
    sprite_filenames = list(map(str.strip, fh.readlines()))
  sprites = []
  for filename in sprite_filenames:
    size = get_image_size(filename)
    sprites.append(Sprite(filename, size[0], size[1]))
  num_sprites = len(sprites)
  max_width = max(s.width for s in sprites)
  max_height = max(s.height for s in sprites)
  sheet_width = int(math.ceil(math.sqrt(num_sprites)))
  sheet_height = int(math.ceil(num_sprites / float(sheet_width)))
  print "generating {}x{} sheet containing {} sprites of size {}x{}".format(
    sheet_width, sheet_height, num_sprites, max_width, max_height)
  montage_cmd = ["montage"] + [s.filename for s in sprites]
  montage_cmd.extend(["-geometry", "{}x{}+0+0>".format(max_width, max_height)])
  montage_cmd.extend(["-tile", "{}x{}".format(sheet_width, sheet_height)])
  montage_cmd.extend(["-gravity", "NorthWest"])
  montage_cmd.extend(["-background", "transparent"])
  montage_cmd.extend(["dist/sprites.png"])
  print "running: {}".format(' '.join(montage_cmd))
  FNULL=open(os.devnull, 'w')
  subprocess.check_call(montage_cmd, stderr=FNULL)

  obj = {}  
  for y in xrange(0, sheet_height):
    for x in xrange(0, sheet_width):
      idx = x + y * sheet_width
      if idx < len(sprites):
        sprite = sprites[idx]
        name = os.path.splitext(os.path.basename(sprite.filename))[0]
        obj[name] = {
          "width": sprite.width,
          "height": sprite.height,
          "name": name,
          "x": x * max_width,
          "y": y * max_height
        }
  with open("dist/sprites.json", "w") as fh:
    json.dump(obj, fh)
  print "wrote dist/sprites.json"


