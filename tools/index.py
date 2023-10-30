from flask import Flask, render_template, send_file
import os

app = Flask(__name__)
app.debug = True


@app.route('/<category>', methods=['GET'])
def home(category=None):
    if not category:
        return render_template('index.html')
    if category not in ["daily", "landscapes", "portraits"]:
        return "not a valid category"
    PATH = "../public/images/portfolio/" + category
    images = (sorted(os.listdir(PATH), key=lambda x: int(x.split('.')[0])))
    PATHs = [(PATH + '/' + i) for i in images]
    print(PATHs)
    return render_template('index.html', paths=PATHs)


# @app.route('/images/<category>', methods=['GET'])
# def images(category="daily"):
#     if category not in ["daily", "landscapes", "portraits"]:
#         return "not a valid category"
#     PATH = "../public/images/portfolio/" + category
#     images = (sorted(os.listdir(PATH), key=lambda x: int(x.split('.')[0])))
#     PATHs = [(PATH + '/' + i) for i in images]

#     return '''<div>
#     {% for path in PATHs %}
#         <img src={path}>

#     {% endfor %}
#     </div>'''

# python -m flask --app index run