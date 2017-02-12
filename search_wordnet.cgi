#! /usr/local/bin/python
# coding: UTF-8

#GETメソッドでデータを受けとるおまじない
import os
import cgi
import sys
import json

import cgitb
cgitb.enable()

import re
import copy
import time

#データの読み込み　失敗したらresultに0入れとく
data = sys.stdin.read()
params = json.loads(data)

if ('word' not in params):
    print 'Content-Type: application/json\n\n'
    print json.JSONEncoder().encode("0")
    print '\n'
    quit()
#おまじない ここまで

##############クラス定義#################
class Words:
    def __init__(self, num, word):
        self.num = num
        self.word = word
##############クラス定義ここまで##############

#start = time.time()

w = params['word'] #データaを整数として読み込む

#w = "happy"
wo = w

w = w.replace(' ', '_')
pt = "[0-9] " + w + ' '
pt = pt.replace('\\', '\\\\')

#結果を入れる配列
result = []

fn = open('./WordNet/dict/data.noun', 'r')
for line in fn:
    matchOB = re.search(pt, line)

    if matchOB:
        tmp = re.findall('[0-9] [A-Za-z]{2,} ', line)

        #クラス作成
        for w in tmp:
            tmp2 = re.split(' ', w)

            if (len(tmp2) > 1):
                result.append((Words(tmp2[0], tmp2[1])))
fn.close()

fn = open('./WordNet/dict/data.adj', 'r')
for line in fn:
    matchOB = re.search(pt, line)

    if matchOB:
        tmp = re.findall('[0-9] [A-Za-z]{2,} ', line)

        #クラス作成
        for w in tmp:
            tmp2 = re.split(' ', w)

            if (len(tmp2) > 1):
                result.append((Words(tmp2[0], tmp2[1])))
fn.close()

fn = open('./WordNet/dict/data.adv', 'r')
for line in fn:
    matchOB = re.search(pt, line)

    if matchOB:
        tmp = re.findall('[0-9] [A-Za-z]{2,} ', line)

        #クラス作成
        for w in tmp:
            tmp2 = re.split(' ', w)

            if (len(tmp2) > 1):
                result.append((Words(tmp2[0], tmp2[1])))
fn.close()

fn = open('./WordNet/dict/data.verb', 'r')
for line in fn:
    matchOB = re.search(pt, line)

    if matchOB:
        tmp = re.findall('[0-9] [A-Za-z]{2,} ', line)

        #クラス作成
        for w in tmp:
            tmp2 = re.split(' ', w)

            if (len(tmp2) > 1):
                result.append((Words(tmp2[0], tmp2[1])))
fn.close()

res_arr = []

#出力
if (len(result) > 0):
    for i in result:
        if (i.word != wo):
            res_arr.append(i.word)
else:
    res_arr = ["0"]

res_arr = ",".join(res_arr)
res = {'result' : res_arr}
#結果の出力
print 'Content-Type: application/json\n\n'
print json.JSONEncoder().encode(res)
print '\n'

#et = time.time() - start
#print str(et) + "sec"
