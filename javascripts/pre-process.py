#! usr/local/bin
# -*- coding: utf-8 -*-

import sys #コマンドライン引数を扱う
import re #正規表現を扱う
import math #数学のあれこれ
import time #日付
import os.path #ファイルの有無

import warnings;warnings.filterwarnings('ignore')

import numpy as np
import cv2

argvs = sys.argv
argc = len(argvs)

if (argc != 2):
    print 'Usage: # python %s filename' % argvs[0]
    quit()

#文字列をファイル名と拡張子に分割
argv_array = argvs[1].split(".")

if (len(argv_array) < 2):
    print 'invalid filename.(no kakuchoshi)'
    quit()

#ファイルがpngかjpgであることを確認
if ((argv_array[len(argv_array) - 1] != "png") & (argv_array[len(argv_array) - 1] != "jpg") & (argv_array[len(argv_array) - 1] != "jpeg")):
    print 'invalid filename.(wrong filetype)'
    quit()

#ファイル名を付ける　ファイル名がない場合は現在時刻からファイル名を付ける

filename = argv_array[0] + ".png"

filename = "./mono/" + filename

#画像のロード
img = cv2.imread(argvs[1], -1)

if (img == None):
    print 'read error.'
    quit()

#imgを大きい方が500pxになるようにリサイズ
SQUARE = 100.0
h = img.shape[0]
w = img.shape[1]
size = 1.0

if (h > w):
    size = SQUARE / h
else:
    size = SQUARE / w

img = cv2.resize(img, (int(math.floor(w * size)) , int(math.floor(h * size))))

#imgを白黒にする
for line in img:
    for pixel in line:
        b = math.floor(0.114 * pixel[0] + 0.587 * pixel[1] + 0.299 * pixel[2])
        pixel[0] = b
        pixel[1] = b
        pixel[2] = b

        if (len(pixel) == 4):
            pixel[0] += 255 - pixel[3]
            pixel[1] += 255 - pixel[3]
            pixel[2] += 255 - pixel[3]

            pixel[0] = min(pixel[0], 255)
            pixel[1] = min(pixel[1], 255)
            pixel[2] = min(pixel[2], 255)

#透過情報は要らないので消す
img = img[:, :, :3]
#真っ白な500*500の画像を作成、その上にimgを貼り付ける　imgは処理結果で上書き

white_img = np.tile(np.uint8([255,255,255]), (SQUARE, SQUARE,1))

h = img.shape[0]
w = img.shape[1]
white_img[int(math.floor((SQUARE - h) / 2)):int(math.floor((SQUARE + h) / 2)), int(math.floor((SQUARE - w) / 2)):int(math.floor((SQUARE + w) / 2))] = img

img = white_img

#書き出し
cv2.imwrite(filename,img)

#画像のロード処理
"""
img = cv2.imread(argvs[1], -1)
filename += "-gray.png"


quit()"""
