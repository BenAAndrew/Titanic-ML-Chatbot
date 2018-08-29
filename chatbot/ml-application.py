import numpy as np
import tensorflow as tf
from PIL import Image
from io import StringIO
import keras

from keras.models import Sequential, load_model
from keras.layers import Dense, Convolution2D, Activation, MaxPooling2D, Dropout, Flatten
from keras.preprocessing.image import ImageDataGenerator

def train():
    #load data
    training_path = "Data/train"
    validation_path = "Data/test"

    imageGen = ImageDataGenerator()

    trainingGen = imageGen.flow_from_directory(training_path, target_size=(56,56), batch_size=16, class_mode="binary")
    validationGen = imageGen.flow_from_directory(validation_path, target_size=(56,56), batch_size=16, class_mode="binary")

    num_training = 200
    num_validation = 80
    epochs = 5
    batch_size = 16
    data_format = "channels_first"

    model = Sequential()

    #layer one
    model.add(Convolution2D(32, (3, 3), input_shape=(150,150,3)))
    #32 features and 3x3image filter size and 150x150 at center of image
    model.add(Activation('relu'))
    #activation w/ type
    model.add(MaxPooling2D(data_format=data_format, pool_size=(2,2)))
    #pooling 2,2 for f and s

    #layer two
    model.add(Convolution2D(32, (3, 3)))
    model.add(Activation('relu'))
    model.add(MaxPooling2D(data_format=data_format, pool_size=(2,2)))

    #layer three
    model.add(Convolution2D(64, (3, 3)))
    #64 stops shrinking 
    model.add(Activation('relu'))
    model.add(MaxPooling2D(data_format=data_format, pool_size=(2,2)))

    model.add(Flatten())
    #3d to 1d
    model.add(Dense(64))
    #fully connected layer w/ 64 i/o
    model.add(Activation('relu'))
    model.add(Dropout(0.3))
    #cuts neurons to avoid overfitting
    model.add(Dense(1))
    #1 prediction / binary

    model.add(Activation('sigmoid'))
    model.compile(optimizer = "adam", loss="binary_crossentropy", metrics=["accuracy"])

    model.fit_generator(trainingGen, steps_per_epoch=3000 // batch_size, epochs = epochs, validation_data = validationGen, validation_steps= 1200 // batch_size)

    model.save("model.h5")

def classify_image(data):
    tempBuff = StringIO()
    tempBuff.write(data)
    tempBuff.seek(0)
    imgFromURL = Image.open(tempBuff)

    imgFromURL = imgFromURL.resize((56,56), Image.ANTIALIAS)
    img = np.asarray(imgFromURL)
    model = load_model("model.h5")

train()