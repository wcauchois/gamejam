#!/bin/bash

(
  files=(assets/*.pbm)
  echo "{"
  for f in "${files[@]::${#files[@]}-1}"; do ./pbm2array.py $f; echo ","; done
  ./pbm2array.py "${files[@]: -1:1}"
  echo "}"
) >ships.json

