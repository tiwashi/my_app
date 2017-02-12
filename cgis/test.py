#! /usr/local/bin/python
# coding: UTF-8

#他にも.pyファイル作ったらchmod a+xを実行する
#エラーログは/pribate/var/log/apache2/error_logにある

#GETメソッドでデータを受けとるおまじない
import os
import cgi

if 'QUERY_STRING' in os.environ:
    query = cgi.parse_qs(os.environ['QUERY_STRING'])
else:
    query = {}
#おまじない ここまで

if query == {}:
    a = 3
    b = 2
else:
    a = int(query['a'][0]) #データaを整数として読み込む
    b = int(query['b'][0]) #データbを整数として読み込む

c = a + b
print 'Content-type:text/javascript\n\n'
print "callback({'answer':'%s'});"%(str(c))
