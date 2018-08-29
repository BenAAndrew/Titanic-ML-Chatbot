from flask import Flask, request

import ml-application as ml

import tensorflow as tf
import keras
from keras import backend as K

app = Flask(__name__)

@app.route('/post_image', methods=['POST'])
#more to add

if __name__ == '__main__':
    #more to add
    app.run(debug=True)

