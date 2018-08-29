import pandas as pd
import numpy as np

from sklearn import cross_validation, tree, preprocessing
from sklearn.model_selection import train_test_split
from sklearn import svm
from sklearn.pipeline import Pipeline
from sklearn import metrics

from flask import Flask, request

from io import StringIO

app = Flask(__name__)

print("import success")

def model(prediction):
    processed_titanic = pd.read_csv('processed_titanic_df.csv')
    processed_titanic = processed_titanic.drop(columns=["Unnamed: 0"])
    x = processed_titanic.drop(columns=['survived'])
    y = processed_titanic['survived'].values
    x_train, x_val, y_train, y_val = train_test_split(x, y, test_size=0.01)
    decision_tree = tree.DecisionTreeClassifier(max_depth=8, random_state=1)
    decision_tree.fit(x_train, y_train)
    predicted = decision_tree.predict([prediction])
    return str(predicted[0])

@app.route("/predict", methods=["POST"])

def predict():
    print("Getting record...")
    record = np.zeros((1,4))
    #1, no. of paramters parameters
    initialReq = str(request.data)
    initialReq = initialReq[2:len(initialReq)-1]
    print("Req: "+str(initialReq))
    initialReq = str(initialReq).split(",")
    print(initialReq)
    record = list()
    for item in initialReq:
        record.append(int(item))
    print("Record after: "+str(record))
    return model(record)

if __name__ == '__main__':
    app.run(debug=True)