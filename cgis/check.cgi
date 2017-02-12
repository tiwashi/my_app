#!/usr/local/bin/python
# -*- coding: utf-8 -*-

import sys, json #ファイル読み込み
import math

import cgitb
cgitb.enable()

#画像処理に要る
import numpy as np
import cv2

#機械学習
from sklearn.svm import LinearSVC
from sklearn import preprocessing
from sklearn.externals import joblib


#データの読み込み　失敗したらresultに0入れとく
data = sys.stdin.read()
params = json.loads(data)

if ('src' not in params):
    result = {'result':'0'}

img_src = "." + params['src']
#img_src = "." + params['src']
#img_src = data.replace('src=', '');

###############################################################
#                                                             #
#                                                             #
#                   ＝処理＝                                   #
#                                                             #
#                                                             #
###############################################################

#画像の読み込み
img = cv2.imread(img_src, -1)

if (isinstance(img, type(None))):
    #result = {'result':__file__}
    result = {'result': img_src}

    #結果の出力
    print 'Content-Type: application/json\n\n'
    print json.JSONEncoder().encode(result)
    print '\n'
    quit()

#=======================ここから下処理=======================

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

#print img.shape
#print len(img.shape)

if (len(img.shape) > 2):
    #普通の時
    #imgを白黒にする
    for line in img:
        for pixel in line:
            """
            if (isinstance(pixel, np.uint8)):
                print "pixel"
                print pixel

            if (len(pixel) != 4):
                print "len(pixel)" + str(len(pixel))
                quit()
            """
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


#=======================ここまで下処理=======================

#コーナー数
#ハリスオペレータで検出
if (len(img.shape) > 2):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
else:
    gray = img

gray = np.float32(gray)

dst = cv2.cornerHarris(gray, 2, 3, 0.10) #画像、ブロックのサイズ、ksize,k

corners = len(dst[dst>0.01*dst.max()]) #<---------------------------

#標準偏差
std = np.std(gray) #<---------------------------

#推定器とかのロード
estimator = joblib.load("../ml/estimator.est")
scaler = joblib.load("../ml/scaler.scl")

#推定
array = np.array([corners, std])
prediction = estimator.predict(array.reshape(1, -1))

#debug
if (prediction):
    result = {'result':'1'}
    #result = 1
else:
    result = {'result':'0'}
    #result = 0

#結果の出力
print 'Content-Type: application/json\n\n'
print json.JSONEncoder().encode(result)
print '\n'
