#!/usr/local/bin/python
# -*- coding: utf-8 -*-

import os
import sys, json #ファイル読み込み

import cgitb
cgitb.enable()

#画像処理に要る
import numpy as np
import cv2

#データの読み込み　失敗したらresultに0入れとく
data = sys.stdin.read()
params = json.loads(data)

if ('src' not in params):
    quit()

img_src = "../download/" + params['src']

#白い画像を作成
cols = 200
rows = 200
img = np.zeros((rows, cols, 3), np.uint8)

img[:,:] = [255, 255, 255]

#保存
os.chdir("../download")
cv2.imwrite(params['src'], img)
